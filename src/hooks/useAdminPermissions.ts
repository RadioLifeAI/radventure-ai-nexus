
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

      console.log("Verificando permissões para usuário:", user.id);

      // Verificar se é admin usando a nova função segura
      const { data: isAdminResult, error: adminError } = await supabase
        .rpc("is_user_admin", { user_id: user.id });

      if (adminError) {
        console.error("Erro ao verificar admin:", adminError);
        throw adminError;
      }

      console.log("Resultado is_user_admin:", isAdminResult);
      setIsAdmin(isAdminResult || false);

      if (isAdminResult) {
        // Carregar roles específicos
        const { data: roles, error: rolesError } = await supabase
          .from("admin_user_roles")
          .select("admin_role")
          .eq("user_id", user.id)
          .eq("is_active", true);

        if (rolesError) {
          console.error("Erro ao carregar roles:", rolesError);
          throw rolesError;
        }

        const adminRoles = roles?.map(r => r.admin_role as AdminRole) || [];
        console.log("Roles encontrados:", adminRoles);
        
        // Se não tem roles específicos mas é ADMIN, dar acesso básico
        if (adminRoles.length === 0) {
          adminRoles.push("TechAdmin");
          console.log("Nenhum role específico encontrado, usando TechAdmin padrão");
        }

        setUserRoles(adminRoles);
      } else {
        setUserRoles([]);
      }
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
      setIsAdmin(false);
      setUserRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = (resource: ResourceType, action: PermissionAction): boolean => {
    const hasPermissionResult = isAdmin && hasPermission(userRoles, resource, action);
    console.log(`Verificando permissão: ${resource}.${action} = ${hasPermissionResult}`);
    return hasPermissionResult;
  };

  const hasAnyAdminRole = (): boolean => {
    const hasRole = isAdmin && userRoles.length > 0;
    console.log(`hasAnyAdminRole: ${hasRole} (isAdmin: ${isAdmin}, roles: ${userRoles.length})`);
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
