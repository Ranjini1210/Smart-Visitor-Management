import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const bgColors = {
          success: 'bg-emerald-600 text-white shadow-emerald-900/20',
          error: 'bg-rose-600 text-white shadow-rose-900/20',
          warning: 'bg-amber-600 text-white shadow-amber-900/20',
          info: 'bg-sky-700 text-white shadow-sky-900/20'
        };

        const icons = {
          success: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
          error: <XCircle className="w-5 h-5 flex-shrink-0" />,
          warning: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
          info: <Info className="w-5 h-5 flex-shrink-0" />
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg transition-all transform duration-200 ease-out ${bgColors[toast.type]}`}
          >
            <div className="flex items-center gap-3">
              {icons[toast.type]}
              <p className="text-sm font-medium leading-tight">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:opacity-80 transition-opacity ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
