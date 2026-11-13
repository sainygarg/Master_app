import React, { createContext, useContext, useState, useEffect } from 'react';

import supabase from '../config/supabaseClient';
import { fromRow } from '../../Systems/order-to-delivery/utils/userStorage';

const UnifiedAuthContext = createContext(null);

const MASTER_AUTH_KEY = 'sainy_couture_auth_user_v3';

export function UnifiedAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(MASTER_AUTH_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Check checklist auth fallback
      const chName = localStorage.getItem('user-name');
      const chRole = localStorage.getItem('role');
      if (chName) {
        return {
          id: chName.toLowerCase(),
          name: chName,
          username: chName.toLowerCase(),
          role: chRole ? (chRole.charAt(0).toUpperCase() + chRole.slice(1)) : 'User',
          allowedPages: [],
          allowedStages: [],
          allowedChecklistPages: [],
        };
      }
    } catch (e) {
      console.error('Failed to parse auth user:', e);
    }
    return null;
  });

  const syncToLocalStorage = (userData) => {
    if (userData) {
      localStorage.setItem(MASTER_AUTH_KEY, JSON.stringify(userData));
      // Checklist tasks are assigned to users.user_name (= login username), so RBAC filters must use the username, not the display name
      localStorage.setItem('user-name', userData.username || userData.name);
      localStorage.setItem('user_name', userData.username || userData.name);
      localStorage.setItem('role', (userData.role || 'user').toLowerCase());
      localStorage.setItem('can_self_assign', 'true');
      localStorage.setItem('user_id', userData.id || userData.username);
    } else {
      localStorage.removeItem(MASTER_AUTH_KEY);
      localStorage.removeItem('user-name');
      localStorage.removeItem('user_name');
      localStorage.removeItem('role');
      localStorage.removeItem('can_self_assign');
      localStorage.removeItem('user_id');
    }
  };

  const login = (userData) => {
    setUser(userData);
    syncToLocalStorage(userData);
    try {
      window.dispatchEvent(new Event('unified-auth-changed'));
    } catch {}
  };

  const logout = () => {
    setUser(null);
    syncToLocalStorage(null);
    try {
      window.dispatchEvent(new Event('unified-auth-changed'));
    } catch {}
  };

  useEffect(() => {
    if (user) {
      syncToLocalStorage(user);
    }
  }, [user]);

  // Re-read the user's permissions from the DB so access changed by an admin applies without re-login
  const identity = user ? String(user.username || user.name || '') : '';
  useEffect(() => {
    if (!identity) return;
    const key = identity.toLowerCase().replace(/[,()"\\]/g, '');
    if (!key) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .or(`username.eq.${key},user_name.eq.${key}`)
          .limit(1);
        if (cancelled || error || !data?.[0]) return;
        const fresh = fromRow(data[0]);
        if ((fresh.status || '').toLowerCase() !== 'active') {
          logout();
          return;
        }
        const next = { ...fresh, password: undefined };
        const changed = ['role', 'isAdmin', 'allowedPages', 'allowedStages', 'allowedChecklistPages', 'name'].some(
          (k) => JSON.stringify(user?.[k]) !== JSON.stringify(next[k])
        );
        if (changed) login({ ...user, ...next });
      } catch (e) {
        console.error('Failed to refresh permissions:', e);
      }
    };
    refresh();
    window.addEventListener('focus', refresh);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity]);

  useEffect(() => {
    const handleStorageOrAuthChange = () => {
      try {
        const stored = localStorage.getItem(MASTER_AUTH_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
          return;
        }
        const chName = localStorage.getItem('user-name');
        const chRole = localStorage.getItem('role');
        if (chName) {
          setUser({
            id: chName.toLowerCase(),
            name: chName,
            username: chName.toLowerCase(),
            role: chRole ? (chRole.charAt(0).toUpperCase() + chRole.slice(1)) : 'User',
            allowedPages: [],
            allowedStages: [],
            allowedChecklistPages: [],
          });
          return;
        }
        setUser(null);
      } catch (e) {
        console.error('Failed to parse auth user in listener:', e);
      }
    };

    window.addEventListener('storage', handleStorageOrAuthChange);
    window.addEventListener('unified-auth-changed', handleStorageOrAuthChange);
    return () => {
      window.removeEventListener('storage', handleStorageOrAuthChange);
      window.removeEventListener('unified-auth-changed', handleStorageOrAuthChange);
    };
  }, []);

  return (
    <UnifiedAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        role: user?.role || 'User',
      }}
    >
      {children}
    </UnifiedAuthContext.Provider>
  );
}

export function useUnifiedAuth() {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within UnifiedAuthProvider');
  }
  return context;
}

export default UnifiedAuthContext;

