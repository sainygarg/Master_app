import React, { createContext, useContext } from 'react';
import { useToastAlert } from '../../../core/context/ToastAlertContext';

const MagicToastContext = createContext(null);

export function MagicToastProvider({ children }) {
  const { showToast, removeToast } = useToastAlert();

  return (
    <MagicToastContext.Provider value={{ showToast, removeToast }}>
      {children}
    </MagicToastContext.Provider>
  );
}

export function useMagicToast() {
  const context = useContext(MagicToastContext);
  const toastAlert = useToastAlert();

  if (context && context.showToast) {
    return context;
  }
  return toastAlert;
}

export default MagicToastContext;
