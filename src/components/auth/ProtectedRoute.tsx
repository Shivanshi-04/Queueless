import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <span className="text-sm font-medium">Validating Secure Session...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectTarget = user.role === 'Admin' ? '/admin' : user.role === 'LoungeManager' ? '/lounge' : '/customer';
    console.log('[ROUTING] user.role:', user?.role);
    console.log('[ROUTING] selected dashboard:', redirectTarget);
    return <Navigate to={redirectTarget} replace />;
  }

  console.log('[ROUTING] user.role:', user?.role);
  console.log('[ROUTING] selected dashboard:', location.pathname);

  return <>{children}</>;
};
