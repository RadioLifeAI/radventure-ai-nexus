
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingPage } from './LoadingPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true,
  redirectTo = "/auth"
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - Loading:', loading, 'User:', !!user, 'RequireAuth:', requireAuth);

  if (loading) {
    return <LoadingPage />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !user) {
    console.log('Redirecting to auth - user not authenticated');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If user is authenticated but trying to access auth pages
  if (!requireAuth && user && (location.pathname === '/auth' || location.pathname === '/login')) {
    console.log('Redirecting to dashboard - user already authenticated');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
