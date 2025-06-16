
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminRole, hasPermission, ResourceType, PermissionAction } from "@/types/admin";

export function useAdminPermissions() {
  const [userRoles, setUserRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadUserRoles();
  }, []);

  const loadUserRoles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Verificar se é admin no perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("type")
        .eq("id", user.id)
        .single();

      if (profile?.type === "ADMIN") {
        setIsAdmin(true);

        // Carregar roles específicos
        const { data: roles } = await supabase
          .from("admin_user_roles")
          .select("admin_role")
          .eq("user_id", user.id)
          .eq("is_active", true);

        const adminRoles = roles?.map(r => r.admin_role as AdminRole) || [];
        
        // Se não tem roles específicos mas é ADMIN, dar acesso básico
        if (adminRoles.length === 0) {
          adminRoles.push("TechAdmin");
        }

        setUserRoles(adminRoles);
      }
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = (resource: ResourceType, action: PermissionAction): boolean => {
    return isAdmin && hasPermission(userRoles, resource, action);
  };

  const hasAnyAdminRole = (): boolean => {
    return isAdmin && userRoles.length > 0;
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
