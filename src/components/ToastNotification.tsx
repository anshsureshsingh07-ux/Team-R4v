import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, ShieldAlert, CheckCircle2, Copy, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'alert' | 'copy';
}

interface ToastNotificationProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto bg-[#0e1014]/95 border border-[#c5a059]/70 backdrop-blur-md p-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.85)] flex items-start justify-between gap-3 text-xs font-mono-vintage"
          >
            <div className="flex items-start gap-2.5">
              {toast.type === 'alert' ? (
                <ShieldAlert size={16} className="text-[#f87171] shrink-0 mt-0.5" />
              ) : toast.type === 'copy' ? (
                <Copy size={16} className="text-[#e5cb91] shrink-0 mt-0.5" />
              ) : toast.type === 'success' ? (
                <CheckCircle2 size={16} className="text-[#4ade80] shrink-0 mt-0.5" />
              ) : (
                <Radio size={16} className="text-[#c5a059] shrink-0 mt-0.5 animate-pulse" />
              )}

              <div className="space-y-0.5">
                <span className="text-[10px] text-[#8c6d32] tracking-widest uppercase block font-bold">
                  BUREAU TELEGRAPH DISPATCH
                </span>
                <span className="text-[#ede8dd] tracking-wider leading-relaxed block">
                  {toast.message}
                </span>
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#7a7469] hover:text-[#ede8dd] p-0.5 hover:bg-[#1a1d24] transition-colors"
              aria-label="Dismiss Notification"
            >
              <X size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
