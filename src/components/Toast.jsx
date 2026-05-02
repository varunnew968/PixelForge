import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl glass-morphism border shadow-2xl min-w-[280px] max-w-sm"
              style={{
                borderColor: toast.type === 'success' ? 'rgba(34,197,94,0.3)' : toast.type === 'error' ? 'rgba(239,68,68,0.3)' : toast.type === 'warning' ? 'rgba(234,179,8,0.3)' : 'rgba(99,102,241,0.3)'
              }}
            >
              <span className="flex-shrink-0">
                {toast.type === 'success' && <CheckCircle2 size={20} className="text-green-400" />}
                {toast.type === 'error' && <XCircle size={20} className="text-red-400" />}
                {toast.type === 'warning' && <AlertTriangle size={20} className="text-yellow-400" />}
                {toast.type === 'info' && <Info size={20} className="text-primary" />}
              </span>
              <p className="text-sm font-medium text-white flex-grow">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/30 hover:text-white transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
