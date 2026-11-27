import supabase from '../../../core/config/supabaseClient';

const TABLE = 'karigar_reports';
const LOCAL_KEY = 'sainy_karigar_reports_v1';

// In-memory response cache & in-flight request deduping (5-minute TTL)
const cache = new Map();
let distinctKarigarsCache = null;
let inflightDistinct = null;

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
export const submitKarigarReport = async ({ userId, karigarName, orderId, reportDate, workingTime, remark }) => {
  const newRow = {
    id: `REP-${Date.now()}`,
    user_id: userId || null,
    karigar_name: karigarName,
    order_id: orderId.trim(),
    report_date: reportDate || new Date().toISOString().split('T')[0],
    working_time: workingTime?.trim() || '',
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
    remark: newRow.remark,
    createdAt: newRow.created_at
  };
};
