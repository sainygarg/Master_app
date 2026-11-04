import React, { createContext, useContext, useState, useEffect } from 'react';

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
          allowedPages: ['orders', 'stages'],
          allowedStages: [],
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
      localStorage.setItem('user-name', userData.name || userData.username);
      localStorage.setItem('user_name', userData.name || userData.username);
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
  };

  const logout = () => {
    setUser(null);
    syncToLocalStorage(null);
  };

  useEffect(() => {
    if (user) {
      syncToLocalStorage(user);
    }
  }, [user]);

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

