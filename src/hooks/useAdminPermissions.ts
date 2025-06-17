
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminRole, hasPermission, ResourceType, PermissionAction } from "@/types/admin";
import { useAuth } from "./useAuth";
import { useUserProfile } from "./useUserProfile";

export function useAdminPermissions() {
  const [userRoles, setUserRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { profile } = useUserProfile();

  useEffect(() => {
    if (isAuthenticated && user && profile) {
      loadUserRoles();
    } else {
      setIsAdmin(false);
      setUserRoles([]);
      setLoading(false);
    }
  }, [isAuthenticated, user, profile]);

  const loadUserRoles = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log("🔍 Carregando permissões para usuário:", user.id);

      const isUserAdmin = profile?.type === 'ADMIN';
      setIsAdmin(isUserAdmin);

      if (isUserAdmin) {
        // Carregar roles específicos
        const { data: roles, error: rolesError } = await supabase
          .from("admin_user_roles")
          .select("admin_role")
          .eq("user_id", user.id)
          .eq("is_active", true);

        if (rolesError) {
          console.warn("⚠️ Aviso ao carregar roles:", rolesError);
        }

        const adminRoles = roles?.map(r => r.admin_role as AdminRole) || [];
        console.log("🎯 Roles encontrados:", adminRoles);
        
        // Garantir pelo menos uma role básica para admins
        if (adminRoles.length === 0) {
          adminRoles.push("TechAdmin");
          console.log("🔧 Usando TechAdmin como role padrão");
        }

        setUserRoles(adminRoles);
      } else {
        setUserRoles([]);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar permissões:", error);
      setIsAdmin(false);
      setUserRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = (resource: ResourceType, action: PermissionAction): boolean => {
    if (!isAuthenticated || !user) return false;
    
    // Sistema limpo: todos os admins têm acesso total
    const hasPermissionResult = isAdmin;
    console.log(`✅ Verificando permissão: ${resource}.${action} = ${hasPermissionResult}`);
    return hasPermissionResult;
  };

  const hasAnyAdminRole = (): boolean => {
    if (!isAuthenticated || !user) return false;
    
    // Sistema limpo: basta ser ADMIN
    const hasRole = isAdmin;
    console.log(`✅ hasAnyAdminRole: ${hasRole}`);
    return hasRole;
  };

  return {
    userRoles,
    loading,
    isAdmin,
    checkPermission,
    hasAnyAdminRole,
    reload: loadUserRoles
  };
}
