
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

  console.log('ProtectedRoute - Path:', location.pathname, 'Loading:', loading, 'User:', !!user, 'RequireAuth:', requireAuth);

  // Sempre mostrar loading enquanto estiver carregando
  if (loading) {
    return <LoadingPage />;
  }

  // Se autenticação é obrigatória mas usuário não está autenticado
  if (requireAuth && !user) {
    console.log('Redirecting to auth - user not authenticated');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Se usuário está autenticado mas tentando acessar páginas de auth
  if (!requireAuth && user) {
    const authPaths = ['/auth', '/login'];
    if (authPaths.includes(location.pathname)) {
      console.log('Redirecting to dashboard - user already authenticated');
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
