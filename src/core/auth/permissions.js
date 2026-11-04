/**
 * Core Permission & Role-Based Access Control (RBAC) System
 * Provides 2 primary parameters:
 *  - canView: Determines if a page / system is visible to the user.
 *  - canAllow: Determines if the user is allowed to access, perform actions, and fetch data.
 */

export const DEFAULT_PERMISSIONS = {
  admin: {
    'order-to-delivery': {
      dashboard: { canView: true, canAllow: true },
      orders: { canView: true, canAllow: true },
      stages: { canView: true, canAllow: true },
      settings: { canView: true, canAllow: true },
    },
    'checklist-delegation': {
      dashboard: { canView: true, canAllow: true },
      notifications: { canView: true, canAllow: true },
      'quick-task': { canView: true, canAllow: true },
      'assign-task': { canView: true, canAllow: true },
      delegation: { canView: true, canAllow: true },
      task: { canView: true, canAllow: true },
      calendar: { canView: true, canAllow: true },
      'holiday-list': { canView: true, canAllow: true },
      'working-day-calendar': { canView: true, canAllow: true },
      'admin-approval': { canView: true, canAllow: true },
      setting: { canView: true, canAllow: true },
      'training-video': { canView: true, canAllow: true },
      checklist: { canView: true, canAllow: true },
      maintenance: { canView: true, canAllow: true },
      repair: { canView: true, canAllow: true },
      'ea-task': { canView: true, canAllow: true },
      'bulk-import': { canView: true, canAllow: true },
      data: { canView: true, canAllow: true },
      'admin-data': { canView: true, canAllow: true },
      'delegation-data': { canView: true, canAllow: true },
      'mis-report': { canView: true, canAllow: true },
    },
  },
  user: {
    'order-to-delivery': {
      dashboard: { canView: false, canAllow: false },
      orders: { canView: true, canAllow: true },
      stages: { canView: true, canAllow: true },
      settings: { canView: false, canAllow: false },
    },
    'checklist-delegation': {
      dashboard: { canView: true, canAllow: true },
      notifications: { canView: true, canAllow: true },
      'quick-task': { canView: false, canAllow: false },
      'assign-task': { canView: true, canAllow: true },
      delegation: { canView: true, canAllow: true },
      task: { canView: true, canAllow: true },
      calendar: { canView: true, canAllow: true },
      'holiday-list': { canView: false, canAllow: false },
      'working-day-calendar': { canView: true, canAllow: true },
      'admin-approval': { canView: false, canAllow: false },
      setting: { canView: false, canAllow: false },
      'training-video': { canView: true, canAllow: true },
      checklist: { canView: true, canAllow: true },
      maintenance: { canView: true, canAllow: true },
      repair: { canView: true, canAllow: true },
      'ea-task': { canView: true, canAllow: true },
      'bulk-import': { canView: false, canAllow: false },
      data: { canView: false, canAllow: false },
      'admin-data': { canView: false, canAllow: false },
      'delegation-data': { canView: false, canAllow: false },
      'mis-report': { canView: false, canAllow: false },
    },
  },
};

/**
 * Checks if a user can view a page in a system
 */
export function canUserView(userRole, systemId, pageKey) {
  const normalizedRole = (userRole || 'user').toLowerCase();
  const roleRules = DEFAULT_PERMISSIONS[normalizedRole] || DEFAULT_PERMISSIONS.user;
  const systemRules = roleRules[systemId];
  if (!systemRules) return true; // default open if not configured
  const pageRule = systemRules[pageKey];
  if (!pageRule) return true;
  return !!pageRule.canView;
}

/**
 * Checks if a user is allowed to access and execute/fetch data on a page
 */
export function canUserAllow(userRole, systemId, pageKey) {
  const normalizedRole = (userRole || 'user').toLowerCase();
  const roleRules = DEFAULT_PERMISSIONS[normalizedRole] || DEFAULT_PERMISSIONS.user;
  const systemRules = roleRules[systemId];
  if (!systemRules) return true;
  const pageRule = systemRules[pageKey];
  if (!pageRule) return true;
  return !!pageRule.canAllow;
}

