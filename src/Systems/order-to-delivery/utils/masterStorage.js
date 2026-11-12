import supabase from '../../../core/config/supabaseClient';

const TABLE = 'order_delivery_masters';
const TTL_MS = 60 * 1000;

// In-memory cache + in-flight de-duplication so every page/stage doesn't refetch the same master list
const cache = new Map(); // kind -> { data, at }
const inflight = new Map(); // kind -> Promise

// Synchronous read of whatever is cached (may be stale) – lets views render instantly
export const getCachedMasters = (kind) => cache.get(kind)?.data;

// kind: 'customer' | 'vendor' | 'transporter' | 'karigar' | 'department' | 'tat'
export const fetchMasters = async (kind, { force = false } = {}) => {
  const hit = cache.get(kind);
  if (!force && hit && Date.now() - hit.at < TTL_MS) return hit.data;
  if (inflight.has(kind)) return inflight.get(kind);

  const p = supabase
    .from(TABLE)
    .select('data')
    .eq('kind', kind)
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (error) throw error;
      const rows = (data || []).map((r) => r.data);
      cache.set(kind, { data: rows, at: Date.now() });
      return rows;
    })
    .finally(() => inflight.delete(kind));
  inflight.set(kind, p);
  return p;
};

export const saveMaster = async (kind, item) => {
  const { error } = await supabase.from(TABLE).upsert({ kind, id: item.id, data: item });
  if (error) throw error;
  cache.delete(kind);
};

export const deleteMaster = async (kind, id) => {
  const { error } = await supabase.from(TABLE).delete().eq('kind', kind).eq('id', id);
  if (error) throw error;
  cache.delete(kind);
};

// Insert-only (fails with code 23505 instead of silently overwriting an existing record)
export const insertMaster = async (kind, item) => {
  const { error } = await supabase.from(TABLE).insert({ kind, id: item.id, data: item });
  if (error) throw error;
  cache.delete(kind);
};

const ID_PREFIX = {
  customer: 'CUST',
  vendor: 'VND',
  department: 'DEPT',
  tat: 'TAT',
  transporter: 'TRN',
  karigar: 'KRG'
};

// Next free id = highest existing numeric suffix + 1 (count+1 collides after a delete)
export const generateNextMasterId = (kind, items = []) => {
  const prefix = ID_PREFIX[kind] || 'ID';
  let highest = 0;
  items.forEach((i) => {
    const m = String(i?.id || '').match(/(\d+)$/);
    if (m) highest = Math.max(highest, parseInt(m[1], 10));
  });
  return `${prefix}-${String(highest + 1).padStart(3, '0')}`;
};
