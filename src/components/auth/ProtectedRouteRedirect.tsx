
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '@/components/Loader';

interface ProtectedRouteRedirectProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRouteRedirect({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteRedirectProps) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('🔒 Usuário não autenticado, redirecionando para:', redirectTo);
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
