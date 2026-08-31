import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import { Login } from './pages/Login';
import { AppLayout } from './layouts/AppLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { VisitorsPage } from './pages/VisitorsPage';
import { RegisterVisitorPage } from './pages/RegisterVisitorPage';
import { VisitorProfilePage } from './pages/VisitorProfilePage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { QRScannerPage } from './pages/QRScannerPage';
import { CheckInPage } from './pages/CheckInPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { UserRole } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: UserRole[] }> = ({
  children,
  roles
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-sky-400 font-bold">
        Loading Smart Visitor Management...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/visitors" element={<VisitorsPage />} />
              <Route path="/visitors/register" element={<RegisterVisitorPage />} />
              <Route path="/visitors/:id" element={<VisitorProfilePage />} />
              <Route
                path="/approvals"
                element={
                  <ProtectedRoute roles={['admin', 'host']}>
                    <ApprovalsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/qr-scanner"
                element={
                  <ProtectedRoute roles={['admin', 'security']}>
                    <QRScannerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/check-in"
                element={
                  <ProtectedRoute roles={['admin', 'security']}>
                    <CheckInPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
