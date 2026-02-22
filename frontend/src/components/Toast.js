import React, { useState, useEffect, useCallback } from 'react';

// Hook global pour utiliser les toasts partout
let toastHandler = null;

export function useToast() {
  return {
    success: (message) => toastHandler?.('success', message),
    error: (message) => toastHandler?.('error', message),
    warning: (message) => toastHandler?.('warning', message),
    info: (message) => toastHandler?.('info', message),
  };
}

const ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: '💡',
};

const COLORS = {
  success: 'bg-green-50 border-green-200 text-green-700',
  error: 'bg-red-50 border-red-200 text-red-700',
  warning: 'bg-orange-50 border-orange-200 text-orange-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
};

const PROGRESS = {
  success: 'bg-green-400',
  error: 'bg-red-400',
  warning: 'bg-orange-400',
  info: 'bg-blue-400',
};

function ToastItem({ toast, onRemove }) {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(progressInterval);
          return 0;
        }
        return prev - (100 / 30);
      });
    }, 100);

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [toast.id, onRemove]);

  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg overflow-hidden transition-all duration-300 min-w-72 max-w-sm ${COLORS[toast.type]} ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      <span className="text-xl flex-shrink-0">{ICONS[toast.type]}</span>
      <div className="flex-1">
        <p className="text-sm font-semibold">{toast.message}</p>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        className="text-gray-400 hover:text-gray-600 text-xs font-bold flex-shrink-0"
      >
        ✕
      </button>

      {/* Barre de progression */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
        <div
          className={`h-1 transition-all duration-100 ${PROGRESS[toast.type]}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    toastHandler = addToast;
    return () => { toastHandler = null; };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}