import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, markAsRead } = useNotifications();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Notifications & Alerts</h2>
          <p className="text-xs text-slate-500">Real-time notifications for visitor requests and security events</p>
        </div>
        <div className="p-3 rounded-2xl bg-sky-50 text-sky-600">
          <Bell className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No notifications available.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`p-5 flex items-start gap-4 transition-colors cursor-pointer hover:bg-slate-50 ${
                !n.is_read ? 'bg-sky-50/40' : ''
              }`}
            >
              <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700 shrink-0">
                {n.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : n.type === 'alert' ? (
                  <XCircle className="w-5 h-5 text-rose-600" />
                ) : (
                  <Info className="w-5 h-5 text-sky-600" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900">{n.title}</h4>
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(n.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
