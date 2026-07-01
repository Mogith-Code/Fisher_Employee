import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const typeConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-500',
    textColor: 'text-emerald-800',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-50 border-red-200',
    iconColor: 'text-red-500',
    textColor: 'text-red-800',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-500',
    textColor: 'text-blue-800',
  },
};

let toastId = 0;

function Toast({ toast, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);
  const config = typeConfig[toast.type] || typeConfig.info;
  const Icon = config.icon;

  useEffect(() => {
    // Trigger slide-in on mount
    const showTimer = requestAnimationFrame(() => setIsVisible(true));

    // Auto-dismiss
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 3000);

    return () => {
      cancelAnimationFrame(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [toast.id, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm
        min-w-[320px] max-w-md
        transition-all duration-300 ease-out
        ${config.bg}
        ${isVisible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-8'
        }`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
      <p className={`text-sm font-medium flex-1 ${config.textColor}`}>
        {toast.message}
      </p>
      <button
        onClick={handleDismiss}
        className={`p-0.5 rounded-md hover:bg-black/5 transition-all-custom shrink-0 cursor-pointer ${config.textColor}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    {
      success: (message) => addToast(message, 'success'),
      error: (message) => addToast(message, 'error'),
      info: (message) => addToast(message, 'info'),
    },
    [addToast]
  );

  // Attach raw addToast for flexibility
  toast.show = addToast;

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 pointer-events-auto">
          {toasts.map((t) => (
            <Toast key={t.id} toast={t} onDismiss={removeToast} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
