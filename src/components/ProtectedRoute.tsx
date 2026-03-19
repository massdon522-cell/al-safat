import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, session, role, isAdmin, isUser, loading } = useAuth();
  const location = useLocation();

  // ✅ 1. Wait until auth fully resolved
  if (loading || role === null && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // ✅ 2. Not logged in
  if (!session) {
    const loginPath = requiredRole === 'admin' ? "/admin/login" : "/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // ✅ 3. Role-based protection
  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  if (requiredRole === 'user' && !isUser && !isAdmin) {
    // Admins can typically view user pages, but strict "user" role check can be applied here
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;