import React, { createContext, useContext, useState, useCallback } from 'react';
import MagicToast from '../components/MagicToast';

const MagicToastContext = createContext(null);

export function MagicToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <MagicToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <MagicToast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </MagicToastContext.Provider>
  );
}

export function useMagicToast() {
  const context = useContext(MagicToastContext);
  if (!context) {
    return {
      showToast: (msg, type) => {
        console.log(`[Toast ${type || 'info'}]: ${msg}`);
      },
      removeToast: () => {},
    };
  }
  return context;
}

export default MagicToastContext;
