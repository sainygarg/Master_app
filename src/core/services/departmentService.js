import supabase from '../config/supabaseClient';

// Single source of truth for departments: the database only.
//  - Master Hub departments live in order_delivery_masters (kind = 'department', JSON in `data`)
//  - Checklist-created departments live in the `departments` table (name, given_by)
// Both are merged (de-duplicated by name). No hardcoded or localStorage fallbacks.
export const fetchDepartmentRows = async () => {
  const [masters, legacy] = await Promise.all([
    supabase.from('order_delivery_masters').select('data').eq('kind', 'department'),
    supabase.from('departments').select('*')
  ]);

  if (masters.error && legacy.error) throw masters.error;

  const byName = new Map();
  (masters.data || []).forEach((r) => {
    const d = r.data || {};
    const name = String(d.name || '').trim();
    if (name) byName.set(name.toLowerCase(), { id: d.id, name, given_by: d.headName || d.given_by || '' });
  });
  (legacy.data || []).forEach((d) => {
    const name = String(d.name || '').trim();
    if (name && !byName.has(name.toLowerCase())) {
      byName.set(name.toLowerCase(), { id: d.id, name, given_by: d.given_by || '' });
    }
  });

  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
};

export const fetchDepartmentNames = async () => (await fetchDepartmentRows()).map((d) => d.name);
