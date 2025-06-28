
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Loader } from '@/components/Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAdmin, isLoading, isAuthenticated } = useAdminCheck();
  const location = useLocation();

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // FASE 1: Proteção administrativa implementada
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
