
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

      console.log("🔍 Carregando permissões para usuário:", user.id);

      // Buscar perfil do usuário na estrutura limpa
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("type")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("❌ Erro ao carregar profile:", profileError);
        setIsAdmin(false);
        setUserRoles([]);
        setLoading(false);
        return;
      }

      console.log("✅ Profile encontrado:", profile);
      const isUserAdmin = profile?.type === 'ADMIN';
      setIsAdmin(isUserAdmin);

      if (isUserAdmin) {
        // Carregar roles específicos da tabela limpa
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
    // Sistema limpo: todos os admins têm acesso total
    const hasPermissionResult = isAdmin;
    console.log(`✅ Verificando permissão: ${resource}.${action} = ${hasPermissionResult}`);
    return hasPermissionResult;
  };

  const hasAnyAdminRole = (): boolean => {
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
