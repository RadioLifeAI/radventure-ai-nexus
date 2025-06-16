
import React from 'react';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { Button } from '@/components/ui/button';
import { Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingPage } from './LoadingPage';

interface AdminAccessProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminAccess({ children, fallback }: AdminAccessProps) {
  const { isAdmin, loading } = useAdminPermissions();

  if (loading) {
    return <LoadingPage />;
  }

  if (!isAdmin) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <Shield className="text-red-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">
            Você não tem permissões administrativas para acessar esta funcionalidade.
          </p>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Se você deveria ter acesso administrativo, entre em contato com o suporte.
            </AlertDescription>
          </Alert>
          <Button onClick={() => window.location.href = '/dashboard'}>
            <Shield size={16} className="mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
