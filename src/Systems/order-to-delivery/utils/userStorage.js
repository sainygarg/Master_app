import { INITIAL_USERS } from '../data/initialUsers';

const USERS_STORAGE_KEY = 'sainy_couture_users_v4';
const ACTIVE_USER_KEY = 'sainy_couture_active_user_id_v4';

export const getStoredUsers = () => {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed = JSON.parse(data);

    // Fail-safe check: ensure 'admin' exists with correct credentials
    const hasAdmin = parsed.some((u) => u.username === 'admin');
    if (!hasAdmin || !Array.isArray(parsed) || parsed.length === 0) {
      // Refresh with INITIAL_USERS if corrupt or missing admin
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }

    return parsed;
  } catch (err) {
    console.error('Failed to parse users', err);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
};

export const saveUsersToStorage = (users) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users', err);
  }
};

export const getActiveUserId = () => {
  try {
    const id = localStorage.getItem(ACTIVE_USER_KEY);
    return id || 'USR-ADMIN';
  } catch {
    return 'USR-ADMIN';
  }
};

export const setActiveUserId = (userId) => {
  try {
    localStorage.setItem(ACTIVE_USER_KEY, userId);
  } catch (err) {
    console.error('Failed to set active user', err);
  }
};

export const generateNextUserId = (users) => {
  let highest = 0;
  users.forEach((u) => {
    const match = u.id.match(/USR-(\d+)/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > highest) highest = n;
    }
  });
  const nextNum = (highest + 1).toString().padStart(2, '0');
  return `USR-${nextNum}`;
};

export const canUserAccessPage = (user, pageId) => {
  if (!user) return false;
  if (user.role === 'Admin' || user.isAdmin) return true;
  return user.allowedPages ? user.allowedPages.includes(pageId) : false;
};

export const canUserAccessStage = (user, stageId) => {
  if (!user) return false;
  if (user.role === 'Admin' || user.isAdmin) return true;
  return user.allowedStages ? user.allowedStages.includes(stageId) : false;
};
