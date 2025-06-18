
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Loader } from '@/components/Loader';
import { useNavigate } from 'react-router-dom';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      if (profile?.type !== 'ADMIN') {
        navigate('/dashboard');
        return;
      }

      setIsAuthorized(true);
    }
  }, [authLoading, profileLoading, isAuthenticated, profile, navigate]);

  if (authLoading || profileLoading) {
    return <Loader />;
  }

  if (!isAuthenticated || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#111C44] via-[#162850] to-[#0286d0] flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="mb-6">Você não tem permissão para acessar esta área.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
