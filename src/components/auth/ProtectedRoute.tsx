
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

  console.log('🛡️ ProtectedRoute check:', {
    isAuthenticated,
    isAdmin,
    isLoading,
    requireAdmin,
    currentPath: location.pathname
  });

  if (isLoading) {
    console.log('⏳ Auth loading...');
    return <Loader />;
  }

  if (!isAuthenticated) {
    console.log('❌ Não autenticado, redirecionando para login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Proteção administrativa implementada
  if (requireAdmin && !isAdmin) {
    console.log('❌ Acesso admin negado, redirecionando para dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ Acesso permitido');
  return <>{children}</>;
}
