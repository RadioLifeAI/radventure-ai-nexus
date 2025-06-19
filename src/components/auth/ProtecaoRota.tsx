
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUsuariosApp } from "@/hooks/useUsuariosApp";
import { Loader } from "@/components/Loader";

interface ProtecaoRotaProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

export function ProtecaoRota({ 
  children, 
  requireAdmin = false, 
  requireSuperAdmin = false 
}: ProtecaoRotaProps) {
  const { usuario, loading, isAuthenticated, isAdmin, isSuperAdmin } = useUsuariosApp();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
