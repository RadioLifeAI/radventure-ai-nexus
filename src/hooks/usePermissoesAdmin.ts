
import { useState, useEffect } from "react";
import { useUsuariosApp } from "./useUsuariosApp";

export type AdminRole = 'TechAdmin' | 'ContentAdmin' | 'UserAdmin' | 'DEV';
export type ResourceType = 'users' | 'cases' | 'events' | 'system';
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage';

export function usePermissoesAdmin() {
  const [loading, setLoading] = useState(false);
  const { usuario, isAdmin, isSuperAdmin } = useUsuariosApp();

  const userRoles = usuario?.roles || [];

  const checkPermission = (resource: ResourceType, action: PermissionAction): boolean => {
    if (!usuario || !isAdmin) return false;
    
    // SUPER_ADMIN tem todas as permissões
    if (isSuperAdmin) return true;
    
    // DEV tem todas as permissões
    if (userRoles.includes('DEV')) return true;
    
    // TechAdmin tem permissões em tudo
    if (userRoles.includes('TechAdmin')) return true;
    
    // Verificações específicas por role
    switch (resource) {
      case 'users':
        return userRoles.includes('UserAdmin');
      case 'cases':
        return userRoles.includes('ContentAdmin');
      case 'events':
        return userRoles.includes('ContentAdmin');
      case 'system':
        return userRoles.includes('TechAdmin') || userRoles.includes('DEV');
      default:
        return false;
    }
  };

  const hasAnyAdminRole = (): boolean => {
    return isAdmin && userRoles.length > 0;
  };

  const reload = async () => {
    // Esta função pode ser chamada para recarregar permissões
    // Por enquanto não faz nada, mas mantém compatibilidade
    setLoading(false);
  };

  return {
    userRoles,
    loading,
    isAdmin,
    checkPermission,
    hasAnyAdminRole,
    reload
  };
}
