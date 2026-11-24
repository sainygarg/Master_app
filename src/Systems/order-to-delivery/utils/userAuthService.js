import supabase from '../../../core/config/supabaseClient';

const TABLE = 'users';

export const ALL_PAGE_IDS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'orders', label: 'Orders' },
  { id: 'design-sheet', label: 'Design Sheet' },
  { id: 'stages', label: 'Production Stages' },
  { id: 'pc', label: 'PC (Production Control)' },
  { id: 'settings', label: 'Settings' }
];

// Checklist & Delegation sub pages (route href is the permission id)
export const ALL_CHECKLIST_PAGE_IDS = [
  { id: '/checklist/admin', label: 'Checklist Dashboard' },
  { id: '/checklist/notifications', label: 'Notifications' },
  { id: '/checklist/quick-task', label: 'Quick Task' },
  { id: '/checklist/assign-task', label: 'Assign Task' },
  { id: '/checklist/delegation', label: 'Delegation' },
  { id: '/checklist/task', label: 'Task' },
  { id: '/checklist/calendar', label: 'Calendar' },
  { id: '/checklist/holiday-list', label: 'Holiday List' },
  { id: '/checklist/working-day-calendar', label: 'Working Day Calendar' },
  { id: '/checklist/bulk-import', label: 'Bulk Import' },
  { id: '/checklist/admin-approval', label: 'Admin Approval' },
  { id: '/checklist/training-video', label: 'Training Video' }
];

// DB row (snake_case) <-> app user (camelCase)
export const fromRow = (r) => ({
  id: r.id,
  username: r.username,
  password: r.password,
  name: r.name,
  email: r.email || '',
  phone: r.phone || '',
  designation: r.Designation || '',
  role: r.role,
  isAdmin: !!r.is_admin,
  status: r.status,
  // Team Data Scope: Can user access and manage other employees' orders in OTD?
  canAccessAllOrders: Boolean(r.can_access_all_orders),
  // Granular 3-Tier Permissions Map: { [pageOrStageId]: 'none' | 'view' | 'modify' }
  permissions: r.permissions && typeof r.permissions === 'object' ? r.permissions : {},
  allowedPages: r.allowed_pages || [],
  allowedStages: r.allowed_stages || [],
  // null/undefined => nothing granted (deny by default)
  // legacy ids were saved as /dashboard/...; the routes now live under /checklist/...
  allowedChecklistPages: Array.isArray(r.allowed_checklist_pages)
    ? r.allowed_checklist_pages.map((h) => String(h).replace('/dashboard/', '/checklist/'))
    : [],
  avatarColor: r.avatar_color || 'bg-[#5B172E]'
});

const toRow = (u) => ({
  id: u.id,
  username: u.username,
  user_name: u.username, // checklist system reads/filters on user_name
  password: u.password,
  name: u.name,
  email: u.email || '',
  email_id: u.email || '',
  phone: u.phone || '',
  mobile: u.phone || '',
  number: u.phone || '',
  Designation: u.designation || null,
  role: u.role,
  is_admin: !!u.isAdmin,
  status: u.status,
  can_access_all_orders: Boolean(u.canAccessAllOrders),
  permissions: u.permissions || {},
  allowed_pages: u.allowedPages || [],
  allowed_stages: u.allowedStages || [],
  allowed_checklist_pages: u.allowedChecklistPages || [],
  avatar_color: u.avatarColor
});

export const fetchUsers = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(fromRow);
};

// Only ids – used to generate the next USR-xx without downloading every user row
export const fetchUserIds = async () => {
  const { data, error } = await supabase.from(TABLE).select('id');
  if (error) throw error;
  return data || [];
};

export const createUser = async (user) => {
  const { data, error } = await supabase.from(TABLE).insert([toRow(user)]).select().single();
  if (error) throw error;
  return fromRow(data);
};

export const updateUser = async (user) => {
  const { id, ...rest } = toRow(user);
  const { data, error } = await supabase.from(TABLE).update(rest).eq('id', id).select().single();
  if (error) throw error;
  return fromRow(data);
};

export const deleteUser = async (id) => {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
};

export const loginUser = async (identifier, password) => {
  // strip characters that would break out of the PostgREST .or() filter below
  const key = identifier.trim().toLowerCase().replace(/[,()"\\]/g, '');
  if (!key) return { error: 'User not found.' };
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .or(`username.eq.${key},email.eq.${key}`)
    .limit(1);
  if (error) throw error;
  const row = data?.[0];
  if (!row) return { error: 'User not found.' };
  if (row.password !== password) return { error: 'Incorrect password.' };
  if ((row.status || '').toLowerCase() !== 'active') return { error: 'Your account is inactive. Please contact admin.' };
  return { user: fromRow(row) };
};

export const generateNextUserId = (users) => {
  let highest = 0;
  users.forEach((u) => {
    const match = u.id && u.id.match(/USR-(\d+)/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > highest) highest = n;
    }
  });
  return `USR-${(highest + 1).toString().padStart(2, '0')}`;
};

export const isApexAdmin = (user) => {
  if (!user) {
    try {
      const storedRole = (localStorage.getItem('role') || '').toLowerCase();
      const storedUser = (
        localStorage.getItem('user-name') ||
        localStorage.getItem('user_name') ||
        ''
      ).toLowerCase();
      const isSuper = localStorage.getItem('is-super-admin') === 'true';
      if (
        isSuper ||
        storedRole.includes('admin') ||
        storedRole.includes('super') ||
        storedUser === 'admin' ||
        storedUser === 'masteradmin'
      ) {
        return true;
      }
    } catch {}
    return false;
  }
  if (user.isAdmin || user.is_admin) return true;
  const role = String(user.role || '').toLowerCase().replace(/[\s_-]+/g, '');
  const username = String(user.username || user.name || '').toLowerCase().trim();
  if (
    role.includes('admin') ||
    role.includes('super') ||
    username === 'admin' ||
    username === 'masteradmin'
  ) {
    return true;
  }
  return false;
};

export const canUserAccessPage = (user, pageId) => {
  if (isApexAdmin(user)) return true;
  if (!user) return false;
  return canView(user, pageId);
};

export const canUserAccessChecklistPage = (user, href) => {
  if (isApexAdmin(user)) return true;
  if (!user) return false;
  return canView(user, href);
};

export const canUserAccessStage = (user, stageId) => {
  if (isApexAdmin(user)) return true;
  if (!user) return false;
  return canView(user, stageId);
};

/**
 * Resolves 3-Tier Permission for any page or stage: 'none' | 'view' | 'modify'
 * STRICT RESOLUTION:
 * - Admin users always have full 'modify' permission.
 * - For all other users, access is determined SOLELY by their granular `permissions` mapping.
 * - No legacy fallbacks exist that grant 'modify'. Legacy arrays default strictly to 'none' unless explicitly present in `permissions`.
 */
export const getPermission = (user, key) => {
  if (!user) return 'none';
  if (isApexAdmin(user)) return 'modify';

  // Strict Check: Granular permissions map
  if (user.permissions && typeof user.permissions === 'object' && key in user.permissions) {
    const val = user.permissions[key];
    if (val === 'none' || val === 'view' || val === 'modify') return val;
  }

  return 'none';
};

/**
 * Checks if user has modify (CRUD) access
 */
export const canModify = (user, key) => {
  return getPermission(user, key) === 'modify';
};

/**
 * Checks if user can view page (either view or modify)
 */
export const canView = (user, key) => {
  const perm = getPermission(user, key);
  return perm === 'view' || perm === 'modify';
};
