
import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminProtectedRoute } from './AdminProtectedRoute';

interface SecureWrapperProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function SecureWrapper({ children, requireAdmin = false }: SecureWrapperProps) {
  if (requireAdmin) {
    return (
      <ProtectedRoute>
        <AdminProtectedRoute>
          {children}
        </AdminProtectedRoute>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
