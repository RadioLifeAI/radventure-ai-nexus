
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

      console.log("Carregando permissões para usuário:", user.id);

      // Durante desenvolvimento, verificar diretamente o tipo do usuário
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("type")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Erro ao carregar profile:", profileError);
        setIsAdmin(false);
        setUserRoles([]);
        setLoading(false);
        return;
      }

      console.log("Profile encontrado:", profile);
      const isUserAdmin = profile?.type === 'ADMIN';
      setIsAdmin(isUserAdmin);

      if (isUserAdmin) {
        // Carregar roles específicos (sem restrições RLS durante desenvolvimento)
        const { data: roles, error: rolesError } = await supabase
          .from("admin_user_roles")
          .select("admin_role")
          .eq("user_id", user.id)
          .eq("is_active", true);

        if (rolesError) {
          console.warn("Aviso ao carregar roles (pode ser esperado em desenvolvimento):", rolesError);
        }

        const adminRoles = roles?.map(r => r.admin_role as AdminRole) || [];
        console.log("Roles encontrados:", adminRoles);
        
        // Durante desenvolvimento, dar acesso básico se não tem roles específicos
        if (adminRoles.length === 0) {
          adminRoles.push("TechAdmin");
          console.log("Desenvolvimento: usando TechAdmin padrão");
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
    // Durante desenvolvimento, todos os admins têm acesso total
    const hasPermissionResult = isAdmin;
    console.log(`Verificando permissão (modo dev): ${resource}.${action} = ${hasPermissionResult}`);
    return hasPermissionResult;
  };

  const hasAnyAdminRole = (): boolean => {
    // Durante desenvolvimento, basta ser ADMIN
    const hasRole = isAdmin;
    console.log(`hasAnyAdminRole (modo dev): ${hasRole}`);
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
