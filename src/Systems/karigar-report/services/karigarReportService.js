import supabase from '../../../core/config/supabaseClient';

const TABLE = 'karigar_reports';
const LOCAL_KEY = 'sainy_karigar_reports_v1';

// In-memory response cache & in-flight request deduping (5-minute TTL)
const cache = new Map();
let distinctKarigarsCache = null;
let inflightDistinct = null;

export const KARIGAR_IMAGE_BUCKET = 'order-images';

/**
 * Client-Side Image Compression using HTML Canvas:
 * 1. Reads image file into FileReader
 * 2. Downscales if max dimension > 1280px (retaining aspect ratio)
 * 3. Encodes to JPEG at 72% quality to compress typical 4MB-10MB mobile photos to ~150KB-250KB
 */
export const compressImageFile = (file, maxDimension = 1280, quality = 0.72) =>
  new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image data'));
      img.onload = () => {
        const maxCurrent = Math.max(img.width, img.height);
        const scale = maxCurrent > maxDimension ? maxDimension / maxCurrent : 1;
        const targetWidth = Math.round(img.width * scale);
        const targetHeight = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context unavailable'));
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Image compression failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

/**
 * Uploads compressed image blob to Supabase Storage and returns public URL
 */
export const uploadKarigarReportImage = async (file) => {
  const compressedBlob = await compressImageFile(file);
  const fileName = `karigar_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
  const storagePath = `karigar-reports/${fileName}`;

  const { error } = await supabase.storage
    .from(KARIGAR_IMAGE_BUCKET)
    .upload(storagePath, compressedBlob, {
      contentType: 'image/jpeg',
      cacheControl: '31536000',
      upsert: false
    });

  if (error) {
    // If bucket/storage isn't reachable or fails, fallback to local object preview URL or throw
    throw error;
  }

  const { data } = supabase.storage
    .from(KARIGAR_IMAGE_BUCKET)
    .getPublicUrl(storagePath);

  return data.publicUrl;
};

export const clearKarigarReportCache = () => {
  cache.clear();
  distinctKarigarsCache = null;
};

const readLocal = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
};

const writeLocal = (rows) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
};

/**
 * Server-Side Range Pagination Service for Karigar Reports.
 *
 * SUPABASE 1,000 QUERY LIMIT MITIGATION:
 * Supabase (PostgREST) has a default max query limit of 1,000 rows.
 * If thousands of reports accumulate, a generic .select('*') caps at 1,000 rows and cannot scale.
 *
 * Solution:
 * 1. PostgREST .range(from, to) requests only the specific window of rows for the requested page (e.g. 15 or 25 rows).
 * 2. .select('*', { count: 'exact' }) requests the exact server-side count without fetching all rows.
 * 3. Scoped filtering by `karigar_name` ensures users query only their own partition of data.
 */
export const fetchKarigarReports = async ({
  page = 1,
  pageSize = 15,
  karigarName = '',
  searchOrderId = '',
  allReports = false,
  forceRefresh = false
}) => {
  const cacheKey = `${page}_${pageSize}_${karigarName}_${searchOrderId}_${allReports}`;

  // If cached and not forcing refresh, return immediately without calling Supabase
  if (!forceRefresh && cache.has(cacheKey)) {
    const entry = cache.get(cacheKey);
    if (Date.now() - entry.timestamp < 300_000) {
      return entry.data;
    }
    cache.delete(cacheKey);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let query = supabase
      .from(TABLE)
      .select('*', { count: 'exact' });

    // User Scoping: If not admin asking for all reports, isolate by karigar_name
    if (!allReports && karigarName) {
      query = query.eq('karigar_name', karigarName);
    }

    if (searchOrderId && searchOrderId.trim()) {
      query = query.ilike('order_id', `%${searchOrderId.trim()}%`);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const result = {
      reports: (data || []).map((r) => ({
        id: r.id,
        userId: r.user_id,
        karigarName: r.karigar_name,
        orderId: r.order_id,
        reportDate: r.report_date || r.created_at?.split('T')[0] || '',
        workingTime: r.working_time || '',
        imageUrl: r.image_url || '',
        remark: r.remark || '',
        createdAt: r.created_at
      })),
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize) || 1
    };

    cache.set(cacheKey, { timestamp: Date.now(), data: result });
    return result;
  } catch {
    // Graceful offline / fallback to LocalStorage with identical user scoping and pagination
    let local = readLocal();
    if (!allReports && karigarName) {
      local = local.filter((r) => (r.karigarName || r.karigar_name) === karigarName);
    }
    if (searchOrderId && searchOrderId.trim()) {
      const q = searchOrderId.trim().toLowerCase();
      local = local.filter((r) =>
        (r.orderId || r.order_id || '').toLowerCase().includes(q)
      );
    }
    const total = local.length;
    const paged = local.slice(from, to + 1).map((r) => ({
      id: r.id,
      userId: r.userId || r.user_id,
      karigarName: r.karigarName || r.karigar_name,
      orderId: r.orderId || r.order_id,
      reportDate: r.reportDate || r.report_date || (r.createdAt || r.created_at)?.split('T')[0] || '',
      workingTime: r.workingTime || r.working_time || '',
      imageUrl: r.imageUrl || r.image_url || '',
      remark: r.remark || '',
      createdAt: r.createdAt || r.created_at
    }));

    return {
      reports: paged,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1
    };
  }
};

/**
 * Fetch distinct list of Karigar names for Admin filter dropdown
 */
export const fetchDistinctKarigars = async (forceRefresh = false) => {
  if (!forceRefresh && distinctKarigarsCache) {
    return distinctKarigarsCache;
  }
  if (inflightDistinct) return inflightDistinct;

  inflightDistinct = (async () => {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('karigar_name')
        .order('karigar_name', { ascending: true });

      if (error) throw error;
      const names = Array.from(new Set((data || []).map((r) => r.karigar_name).filter(Boolean)));
      distinctKarigarsCache = names;
      return names;
    } catch {
      const local = readLocal();
      const names = Array.from(
        new Set(local.map((r) => r.karigarName || r.karigar_name).filter(Boolean))
      );
      distinctKarigarsCache = names;
      return names;
    } finally {
      inflightDistinct = null;
    }
  })();

  return inflightDistinct;
};

/**
 * Submit a new Karigar Report
 */
export const submitKarigarReport = async ({ userId, karigarName, orderId, reportDate, workingTime, imageUrl, remark }) => {
  const newRow = {
    id: `REP-${Date.now()}`,
    user_id: userId || null,
    karigar_name: karigarName,
    order_id: orderId.trim(),
    report_date: reportDate || new Date().toISOString().split('T')[0],
    working_time: workingTime?.trim() || '',
    image_url: imageUrl || '',
    remark: remark?.trim() || '',
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        user_id: newRow.user_id,
        karigar_name: newRow.karigar_name,
        order_id: newRow.order_id,
        report_date: newRow.report_date,
        working_time: newRow.working_time,
        image_url: newRow.image_url,
        remark: newRow.remark
      })
      .select()
      .single();

    if (error) throw error;
    if (data) {
      newRow.id = data.id;
      newRow.created_at = data.created_at;
    }
  } catch {
    /* fallback to localStorage */
  }

  const existing = readLocal();
  writeLocal([newRow, ...existing]);

  clearKarigarReportCache();
  return {
    id: newRow.id,
    userId: newRow.user_id,
    karigarName: newRow.karigar_name,
    orderId: newRow.order_id,
    reportDate: newRow.report_date,
    workingTime: newRow.working_time,
    imageUrl: newRow.image_url,
    remark: newRow.remark,
    createdAt: newRow.created_at
  };
};
