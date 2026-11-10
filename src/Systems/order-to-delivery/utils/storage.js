import supabase from '../../../core/config/supabaseClient';

const TABLE = 'order_delivery_orders';

export const fetchOrders = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('data')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((r) => r.data);
};

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
