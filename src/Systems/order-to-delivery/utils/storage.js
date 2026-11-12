import supabase from '../../../core/config/supabaseClient';

const TABLE = 'order_delivery_orders';

const CACHE_KEY = 'otd_orders_cache_v1';
let memoryCache = null;
let inflight = null;

// Last known orders (memory, then sessionStorage) so pages can paint instantly
// while fresh data loads in the background. Returns null when nothing is cached.
export const getCachedOrders = () => {
  if (memoryCache) return memoryCache;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      memoryCache = JSON.parse(raw);
      return memoryCache;
    }
  } catch {
    /* ignore */
  }
  return null;
};

// Photos still stored as base64 are far too heavy for the cache; drop them there (the DB copy is untouched)
const lightweight = (orders) =>
  orders.map((o) => ({
    ...o,
    designImages: (o.designImages || []).filter((i) => !String(i).startsWith('data:')),
    inspirationImages: (o.inspirationImages || []).filter((i) => !String(i).startsWith('data:'))
  }));

const setCachedOrders = (orders) => {
  memoryCache = orders;
  try {
    const json = JSON.stringify(lightweight(orders));
    if (json.length > 2_000_000) return; // too big to be worth caching
    sessionStorage.setItem(CACHE_KEY, json);
  } catch {
    /* quota exceeded – memory cache still works */
  }
};

export const fetchOrders = async () => {
  if (inflight) return inflight; // de-duplicate concurrent fetches
  inflight = supabase
    .from(TABLE)
    .select('data')
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (error) throw error;
      const orders = (data || []).map((r) => r.data);
      setCachedOrders(orders);
      return orders;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
};

// Keep the cache in step with local edits so a reload doesn't flash old data
export const syncOrdersCache = (orders) => setCachedOrders(orders);

export const saveOrder = async (order) => {
  const { error } = await supabase
    .from(TABLE)
    .upsert({ id: order.id, data: order, updated_at: new Date().toISOString() });
  if (error) throw error;
};

export const insertOrder = async (order) => {
  const { error } = await supabase.from(TABLE).insert({ id: order.id, data: order });
  if (error) throw error;
};

export const removeOrder = async (id) => {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
};

export const generateNextOrderId = (orders) => {
  let highestNum = 1000;
  orders.forEach((order) => {
    const match = order.id.match(/SG-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > highestNum) highestNum = num;
    }
  });
  return `SG-${highestNum + 1}`;
};
