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
    return {
      id: row.id,
      sku: row.sku || '',
      name: row.name || '',
      category: row.category || 'Couture',
      type: row.type || '',
      color: row.color || '',
      description: row.description || '',
      imageUrl: row.image_url || '',
      images: row.image_url ? [row.image_url] : [],
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
    return {
      id: item.id,
      sku: item.sku || null,
      name: item.name || '',
      category: item.category || 'Couture',
      type: item.type || null,
      color: item.color || null,
      description: item.description || null,
      image_url: item.imageUrl || item.image_url || (item.images?.[0] ?? null)
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

export const saveMaster = async (kind, item) => {
  const table = getTableName(kind);
  const row = toDbRow(kind, item);
  const { error } = await supabase.from(table).upsert(row, { onConflict: 'id' });
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
