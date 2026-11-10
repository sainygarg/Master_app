import supabase from '../../../core/config/supabaseClient';

const TABLE = 'order_delivery_masters';

// kind: 'customer' | 'vendor' | 'transporter' | 'karigar' | 'department' | 'tat'
export const fetchMasters = async (kind) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('data')
    .eq('kind', kind)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((r) => r.data);
};

export const saveMaster = async (kind, item) => {
  const { error } = await supabase.from(TABLE).upsert({ kind, id: item.id, data: item });
  if (error) throw error;
};

export const deleteMaster = async (kind, id) => {
  const { error } = await supabase.from(TABLE).delete().eq('kind', kind).eq('id', id);
  if (error) throw error;
};
