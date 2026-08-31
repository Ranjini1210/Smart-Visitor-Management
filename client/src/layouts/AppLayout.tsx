import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { ToastContainer } from '../components/ToastContainer';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Admin Dashboard';
    if (path.startsWith('/visitors/register')) return 'Register Visitor';
    if (path.startsWith('/visitors/')) return 'Visitor Profile';
    if (path.startsWith('/visitors')) return 'Visitors Directory';
    if (path.startsWith('/approvals')) return 'Approval Requests';
    if (path.startsWith('/qr-scanner')) return 'QR Entry Scanner';
    if (path.startsWith('/check-in')) return 'Check-In / Check-Out';
    if (path.startsWith('/analytics')) return 'Visitor Analytics';
    if (path.startsWith('/notifications')) return 'Notifications';
    if (path.startsWith('/settings')) return 'System Settings';
    return 'Smart Visitor Management';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Right Shell */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <Navbar pageTitle={getPageTitle()} setMobileOpen={setMobileOpen} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
