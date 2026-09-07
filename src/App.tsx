import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QueueProvider } from './context/QueueContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthScreen } from './components/auth/AuthScreen';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { LoungeTVPortal } from './components/public/LoungeTVPortal';

// Root redirector based on authenticated user's role
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'Admin') {
    return <Navigate to="/admin" replace />;
  } else if (user.role === 'LoungeManager') {
    return <Navigate to="/lounge" replace />;
  } else {
    return <Navigate to="/customer" replace />;
  }
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

            {/* Dashboard 1: Customer Portal (/customer) */}
            <Route
              path="/customer"
              element={
                <ProtectedRoute allowedRoles={['Customer', 'Admin']}>
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

            {/* Dashboard 3: Lounge TV Display (/lounge) */}
            <Route
              path="/lounge"
              element={
                <ProtectedRoute allowedRoles={['LoungeManager', 'Admin', 'Customer']}>
                  <LoungeTVPortal />
                </ProtectedRoute>
              }
            />

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
