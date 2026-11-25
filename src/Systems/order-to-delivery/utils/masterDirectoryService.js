import supabase from '../../../core/config/supabaseClient';

const TTL_MS = 60 * 1000;

// Dedicated table mapping for each master kind
const TABLE_MAP = {
  design: 'master_design',
  vendor: 'master_vendor',
  customer: 'master_customer',
  department: 'master_department',
  tat: 'master_tat',
  transporter: 'master_transporter',
  karigar: 'master_karigar'
};

export const getTableName = (kind) => TABLE_MAP[kind] || `master_${kind}`;

// Data converters: DB row <-> App Item (camelCase)
const fromDbRow = (kind, row) => {
  if (!row) return null;
  if (kind === 'design') {
    const rawImages = Array.isArray(row.images)
      ? row.images.filter(Boolean)
      : [];
    const mergedImages = row.image_url && !rawImages.includes(row.image_url)
      ? [row.image_url, ...rawImages]
      : rawImages;
    return {
      id: row.id,
      sku: row.sku || '',
      name: row.name || '',
      category: row.category || 'Couture',
      type: row.type || '',
      color: row.color || '',
      description: row.description || '',
      imageUrl: row.image_url || mergedImages[0] || '',
      thumbUrl: row.thumb_url || row.image_url || mergedImages[0] || '',
      images: mergedImages,
      createdAt: row.created_at
    };
  }
  if (kind === 'department') {
    return {
      id: row.id,
      name: row.name || '',
      code: row.code || '',
      createdAt: row.created_at
    };
  }
  if (kind === 'karigar') {
    return {
      id: row.id,
      name: row.name || '',
      phone: row.phone || '',
      status: row.status || 'Active (On Duty)',
      createdAt: row.created_at
    };
  }
  if (kind === 'vendor') {
    return {
      id: row.id,
      name: row.name || '',
      contactPerson: row.contact_person || '',
      phone: row.phone || '',
      address: row.address || '',
      gstNo: row.gst_no || '',
      createdAt: row.created_at
    };
  }
  if (kind === 'customer') {
    return {
      id: row.id,
      name: row.name || '',
      phone: row.phone || '',
      email: row.email || '',
      city: row.city || '',
      address: row.address || '',
      gstNo: row.gst_no || '',
      createdAt: row.created_at
    };
  }
  if (kind === 'transporter') {
    return {
      id: row.id,
      name: row.name || '',
      contactPerson: row.contact_person || '',
      phone: row.phone || '',
      createdAt: row.created_at
    };
  }
  if (kind === 'tat') {
    return {
      id: row.id,
      moduleName: row.module_name || 'Order to Delivery',
      stageId: row.stage_id || '',
      stageName: row.stage_name || '',
      stageIndex: row.stage_index || 1,
      tatType: row.tat_type || 'Days',
      timeValue: row.time_value ?? 2,
      assignedPerson: row.assigned_person || '',
      assignedPersonId: row.assigned_person_id || '',
      notes: row.notes || '',
      createdAt: row.created_at
    };
  }
  return { ...row };
};

const toDbRow = (kind, item) => {
  if (!item) return {};
  if (kind === 'design') {
    const images = Array.isArray(item.images)
      ? item.images.filter(Boolean)
      : (item.imageUrl || item.image_url ? [item.imageUrl || item.image_url] : []);
    return {
      id: item.id,
      sku: item.sku || null,
      name: item.name || '',
      category: item.category || 'Couture',
      type: item.type || null,
      color: item.color || null,
      description: item.description || null,
      image_url: images[0] || item.imageUrl || item.image_url || null,
      thumb_url: item.thumbUrl || item.thumb_url || null,
      images
    };
  }
  if (kind === 'department') {
    return {
      id: item.id,
      name: item.name || '',
      code: item.code || ''
    };
  }
  if (kind === 'karigar') {
    return {
      id: item.id,
      name: item.name || '',
      phone: item.phone || null,
      status: item.status || 'Active (On Duty)'
    };
  }
  if (kind === 'vendor') {
    return {
      id: item.id,
      name: item.name || '',
      contact_person: item.contactPerson || item.contact_person || null,
      phone: item.phone || null,
      address: item.address || null,
      gst_no: item.gstNo || item.gst_no || null
    };
  }
  if (kind === 'customer') {
    return {
      id: item.id,
      name: item.name || '',
      phone: item.phone || null,
      email: item.email || null,
      city: item.city || null,
      address: item.address || null,
      gst_no: item.gstNo || item.gst_no || null
    };
  }
  if (kind === 'transporter') {
    return {
      id: item.id,
      name: item.name || '',
      contact_person: item.contactPerson || item.contact_person || null,
      phone: item.phone || null
    };
  }
  if (kind === 'tat') {
    return {
      id: item.id,
      module_name: item.moduleName || 'Order to Delivery',
      stage_id: item.stageId || null,
      stage_name: item.stageName || '',
      stage_index: item.stageIndex || 1,
      tat_type: item.tatType || 'Days',
      time_value: item.timeValue ?? 2,
      assigned_person: item.assignedPerson || null,
      assigned_person_id: item.assignedPersonId || null,
      notes: item.notes || null
    };
  }
  return { ...item };
};

// In-memory cache + in-flight de-duplication so every page/stage doesn't refetch the same master list
const cache = new Map(); // kind -> { data, at }
const inflight = new Map(); // kind -> Promise

// Synchronous read of whatever is cached (may be stale) – lets views render instantly
export const getCachedMasters = (kind) => cache.get(kind)?.data;

export const fetchMasters = async (kind, { force = false } = {}) => {
  const hit = cache.get(kind);
  if (!force && hit && Date.now() - hit.at < TTL_MS) return hit.data;
  if (inflight.has(kind)) return inflight.get(kind);

  const table = getTableName(kind);
  const p = supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (error) throw error;
      const rows = (data || []).map((r) => fromDbRow(kind, r));
      cache.set(kind, { data: rows, at: Date.now() });
      return rows;
    })
    .finally(() => inflight.delete(kind));

  inflight.set(kind, p);
  return p;
};

// Lightweight count-only query for tab badges (transfers 0 rows)
export const fetchMasterCounts = async (
  kinds = ['customer', 'vendor', 'department', 'tat', 'karigar', 'design']
) => {
  const entries = await Promise.all(
    kinds.map(async (kind) => {
      try {
        const { count, error } = await supabase
          .from(getTableName(kind))
          .select('id', { count: 'exact', head: true });
        if (error) throw error;
        return [kind, count ?? 0];
      } catch {
        return [kind, null];
      }
    })
  );
  return Object.fromEntries(entries);
};

// Server-side paginated & slim query for Designs tab (excludes heavy images JSONB array)
export const fetchDesignsPage = async ({ page = 1, pageSize = 15, search = '' } = {}) => {
  const from = Math.max(0, (page - 1) * pageSize);
  const to = from + pageSize - 1;
  const q = String(search || '').trim().replace(/[,()"\\]/g, ' ');

  const buildQuery = (cols) => {
    let query = supabase
      .from(getTableName('design'))
      .select(cols, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (q) {
      query = query.or(
        `name.ilike.%${q}%,sku.ilike.%${q}%,category.ilike.%${q}%,type.ilike.%${q}%,color.ilike.%${q}%,description.ilike.%${q}%`
      );
    }
    return query;
  };

  let { data, count, error } = await buildQuery(
    'id, sku, name, category, type, color, description, image_url, thumb_url, created_at'
  );
  if (error && String(error.message || '').includes('thumb_url')) {
    const fallback = await buildQuery(
      'id, sku, name, category, type, color, description, image_url, created_at'
    );
    data = fallback.data;
    count = fallback.count;
    error = fallback.error;
  }
  if (error) throw error;
  return {
    rows: (data || []).map((r) => fromDbRow('design', r)),
    total: count ?? 0
  };
};

// Lightweight ID-only lookup for generating the next sequential ID without downloading all rows
export const fetchNextMasterId = async (kind) => {
  const { data, error } = await supabase
    .from(getTableName(kind))
    .select('id');
  if (error) throw error;
  return generateNextMasterId(kind, data || []);
};

// On-demand single-design gallery fetch (called only when user clicks a design image or Edit)
export const fetchDesignImages = async (designId) => {
  if (!designId) return [];
  const { data, error } = await supabase
    .from(getTableName('design'))
    .select('image_url, images')
    .eq('id', designId)
    .maybeSingle();

  if (error && String(error.message || '').includes('images')) {
    const fallback = await supabase
      .from(getTableName('design'))
      .select('image_url')
      .eq('id', designId)
      .maybeSingle();
    if (fallback.error) throw fallback.error;
    return fallback.data?.image_url ? [fallback.data.image_url] : [];
  }
  if (error) throw error;
  const rawImages = Array.isArray(data?.images) ? data.images.filter(Boolean) : [];
  if (data?.image_url && !rawImages.includes(data.image_url)) {
    return [data.image_url, ...rawImages];
  }
  return rawImages;
};

export const saveMaster = async (kind, item) => {
  const table = getTableName(kind);
  const row = toDbRow(kind, item);
  const { error } = await supabase.from(table).upsert(row, { onConflict: 'id' });
  if (error && kind === 'design' && (String(error.message || '').includes('images') || String(error.message || '').includes('thumb_url'))) {
    const { images: _ignoredImages, thumb_url: _ignoredThumb, ...safeRow } = row;
    const fallback = await supabase.from(table).upsert(safeRow, { onConflict: 'id' });
    if (fallback.error) throw fallback.error;
    cache.delete(kind);
    return;
  }
  if (error) throw error;
  cache.delete(kind);
};

export const deleteMaster = async (kind, id) => {
  const table = getTableName(kind);
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
  cache.delete(kind);
};

export const insertMaster = async (kind, item) => {
  const table = getTableName(kind);
  const row = toDbRow(kind, item);
  const { error } = await supabase.from(table).insert(row);
  if (error && kind === 'design' && (String(error.message || '').includes('images') || String(error.message || '').includes('thumb_url'))) {
    const { images: _ignoredImages, thumb_url: _ignoredThumb, ...safeRow } = row;
    const fallback = await supabase.from(table).insert(safeRow);
    if (fallback.error) throw fallback.error;
    cache.delete(kind);
    return;
  }
  if (error) throw error;
  cache.delete(kind);
};

const ID_PREFIX = {
  customer: 'CUST',
  vendor: 'VND',
  department: 'DEPT',
  tat: 'TAT',
  transporter: 'TRN',
  karigar: 'KRG',
  design: 'DSN'
};

// Next free id = highest existing numeric suffix + 1
export const generateNextMasterId = (kind, items = []) => {
  const prefix = ID_PREFIX[kind] || 'ID';
  let highest = 0;
  items.forEach((i) => {
    const m = String(i?.id || '').match(/(\d+)$/);
    if (m) highest = Math.max(highest, parseInt(m[1], 10));
  });
  return `${prefix}-${String(highest + 1).padStart(3, '0')}`;
};
