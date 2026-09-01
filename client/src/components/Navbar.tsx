import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Search, Bell, Menu, Shield, User, LogOut, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  pageTitle: string;
  setMobileOpen: (open: boolean) => void;
}

export const Navbar: React.FC<Props> = ({ pageTitle, setMobileOpen }) => {
  const { user, logout, switchRoleQuick } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/visitors?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 md:px-8 backdrop-blur-md">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{pageTitle}</h1>
          <p className="hidden md:block text-xs font-medium text-slate-500">
            Enterprise Campus Security & Visitor Management
          </p>
        </div>
      </div>

      {/* Middle & Right: Search, Notifications, Profile */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Global Search Input */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:flex relative items-center w-64 md:w-80">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search visitor, host, purpose..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
          />
        </form>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-sky-600 text-[10px] font-extrabold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-3 w-80 md:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-900">Notifications</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700">
                  {unreadCount} new
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                        !n.is_read ? 'bg-sky-50/40' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold text-xs text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-snug">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setShowNotifMenu(false);
                    navigate('/notifications');
                  }}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700"
                >
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-sky-400 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="hidden md:block text-xs font-semibold text-slate-800">{user?.name}</span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-400">Signed in as</p>
                <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-sky-100 text-sky-800">
                  Role: {user?.role}
                </span>
              </div>

              <div className="p-1.5">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
