import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QueueProvider } from './context/QueueContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthScreen } from './components/auth/AuthScreen';
import { ForgotPasswordScreen } from './components/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from './components/auth/ResetPasswordScreen';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { LoungeTVPortal } from './components/public/LoungeTVPortal';

// Root redirector based on authenticated user's role
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#232932] flex items-center justify-center text-[#A9A7A8]">
        <div className="w-8 h-8 border-2 border-[#E07015] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const selectedDashboard = user.role === 'Admin' ? '/admin' : user.role === 'LoungeManager' ? '/lounge' : '/customer';
  console.log('[ROUTING] user.role:', user?.role);
  console.log('[ROUTING] selected dashboard:', selectedDashboard);

  return <Navigate to={selectedDashboard} replace />;
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueueProvider>
          <Routes>
            {/* Public Authentication Gateways */}
            <Route path="/login" element={<AuthScreen />} />
            <Route path="/signup" element={<AuthScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/reset-password" element={<ResetPasswordScreen />} />

            {/* Dashboard 1: Customer Portal (/customer) */}
            <Route
              path="/customer"
              element={
                <ProtectedRoute allowedRoles={['Customer']}>
                  <CustomerPortal />
                </ProtectedRoute>
              }
            />

            {/* Dashboard 2: Admin Portal (/admin) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminPortal />
                </ProtectedRoute>
              }
            />

            {/* Dashboard 3: Lounge TV Display (/lounge) - Direct Public Access */}
            <Route path="/lounge" element={<LoungeTVPortal />} />

            {/* Root & Catch-all Fallbacks */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </QueueProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
