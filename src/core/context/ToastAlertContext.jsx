import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  X,
  HelpCircle 
} from 'lucide-react';

const ToastAlertContext = createContext(null);

// In-memory emitter so non-React code or window overrides can trigger toasts & dialogs
let globalShowToast = null;
let globalShowConfirm = null;

export const showGlobalToast = (message, type = 'info', duration = 3500) => {
  if (globalShowToast) {
    return globalShowToast(message, type, duration);
  }
  // Fallback to custom DOM notification if called before provider mounts
  console.log(`[Toast ${type}]:`, message);
};

export const showGlobalConfirm = ({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) => {
  if (globalShowConfirm) {
    return globalShowConfirm({ title, message, confirmText, cancelText, type });
  }
  // Fallback if not mounted
  return Promise.resolve(window.confirm(message || title));
};

export function ToastAlertProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    // Sanitize string if object/error passed
    const text = typeof message === 'string' 
      ? message 
      : (message?.message || JSON.stringify(message));
    
    setToasts((prev) => [...prev, { id, message: text, type, duration }]);
    return id;
  }, []);

  const showConfirm = useCallback(({ 
    title = 'Please Confirm', 
    message = 'Are you sure you want to proceed?', 
    confirmText = 'Confirm', 
    cancelText = 'Cancel', 
    type = 'warning' 
  }) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(null);
          resolve(false);
        }
      });
    });
  }, []);

  // Expose to module-level singleton
  useEffect(() => {
    globalShowToast = showToast;
    globalShowConfirm = showConfirm;

    // Intercept native window.alert globally so third-party scripts or missed calls never show "localhost:5173 says"
    const originalAlert = window.alert;
    window.alert = (msg) => {
      showToast(String(msg), 'error', 4500);
    };

    return () => {
      window.alert = originalAlert;
      globalShowToast = null;
      globalShowConfirm = null;
    };
  }, [showToast, showConfirm]);

  return (
    <ToastAlertContext.Provider value={{ showToast, removeToast, showConfirm }}>
      {children}

      {/* Floating Modern Toast Stack Container */}
      <div 
        aria-live="polite"
        className="fixed bottom-6 right-6 z-[999999] flex flex-col gap-3 pointer-events-none max-w-sm w-full select-none"
      >
        {toasts.map((toast) => (
          <ToastCard 
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Confirmation & Alert Modal (Replaces window.confirm) */}
      {confirmDialog && (
        <ConfirmModalDialog dialog={confirmDialog} />
      )}
    </ToastAlertContext.Provider>
  );
}

// Single Toast Card with Sainy Couture aesthetic
function ToastCard({ id, message, type, duration, onClose }) {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(onClose, 280);
  }, [onClose]);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) {
        handleClose();
      }
    }, 15);
    return () => clearInterval(interval);
  }, [duration, handleClose]);

  const getStyle = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          accentBg: 'bg-emerald-500',
          containerBg: 'bg-white',
          border: 'border-emerald-200',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          title: 'Success'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
          accentBg: 'bg-rose-500',
          containerBg: 'bg-white',
          border: 'border-rose-200',
          badge: 'bg-rose-50 text-rose-800 border-rose-200',
          title: 'Attention Required'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
          accentBg: 'bg-amber-500',
          containerBg: 'bg-white',
          border: 'border-amber-200',
          badge: 'bg-amber-50 text-amber-800 border-amber-200',
          title: 'Notice'
        };
      default:
        return {
          icon: <Info className="w-5 h-5 text-[#9B783E]" />,
          accentBg: 'bg-[#5B172E]',
          containerBg: 'bg-white',
          border: 'border-[#DECDB8]',
          badge: 'bg-[#FAF5EE] text-[#5B172E] border-[#DECDB8]',
          title: 'Notification'
        };
    }
  };

  const style = getStyle();

  return (
    <div
      className={`pointer-events-auto relative flex flex-col rounded-2xl border ${style.border} ${style.containerBg} shadow-xl backdrop-blur-md overflow-hidden transition-all duration-300 transform ${
        isExiting ? 'opacity-0 translate-x-4 scale-95' : 'opacity-100 translate-x-0 scale-100'
      }`}
    >
      <div className="p-4 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-center shrink-0 shadow-2xs">
          {style.icon}
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border uppercase tracking-wider ${style.badge}`}>
              {style.title}
            </span>
            {type === 'success' && <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />}
          </div>
          <p className="text-xs font-semibold text-stone-700 leading-snug break-words">
            {message}
          </p>
        </div>

        <button
          onClick={handleClose}
          className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress countdown indicator */}
      <div className="h-1 w-full bg-stone-100 overflow-hidden">
        <div
          className={`h-full ${style.accentBg} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Confirmation Dialog Modal replacing window.confirm
function ConfirmModalDialog({ dialog }) {
  const isDanger = dialog.type === 'danger' || dialog.type === 'error';

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-[#DECDB8] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        
        <div className="flex items-start gap-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs border ${
            isDanger ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-amber-50 text-amber-600 border-amber-200'
          }`}>
            {isDanger ? <AlertCircle className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
          </div>

          <div className="flex-1">
            <h3 className="font-serif text-base font-bold text-[#431021]">
              {dialog.title}
            </h3>
            <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
              {dialog.message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DECDB8]">
          <button
            type="button"
            onClick={dialog.onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200/60 transition-colors"
          >
            {dialog.cancelText}
          </button>
          <button
            type="button"
            onClick={dialog.onConfirm}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all ${
              isDanger 
                ? 'bg-rose-600 hover:bg-rose-700' 
                : 'bg-gradient-to-r from-[#5B172E] to-[#781F3E] hover:from-[#431021] hover:to-[#5B172E]'
            }`}
          >
            {dialog.confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}

export function useToastAlert() {
  const context = useContext(ToastAlertContext);
  if (!context) {
    return {
      showToast: showGlobalToast,
      showConfirm: showGlobalConfirm,
      removeToast: () => {}
    };
  }
  return context;
}

export default ToastAlertContext;

