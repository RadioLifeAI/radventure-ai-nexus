
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { AdminRole, PermissionAction, ResourceType } from "@/types/admin";

export function useAdminPermissions() {
  const { user, loading: authLoading } = useAuth();
  const [userRoles, setUserRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRoles() {
      // Aguarda a autenticação completar antes de buscar roles
      if (authLoading) return;
      
      setLoading(true);
      
      try {
        if (!user?.id) {
          console.log('No user authenticated, setting empty roles');
          setUserRoles([]);
          setLoading(false);
          return;
        }

        console.log('Fetching admin roles for user:', user.id);

        const { data, error } = await supabase
          .from('admin_user_roles')
          .select('admin_role')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching user roles:', error);
          // Em caso de erro, assumir usuário normal (não admin)
          setUserRoles([]);
        } else {
          const roles = data?.map(r => r.admin_role as AdminRole) || [];
          console.log('User roles fetched:', roles);
          setUserRoles(roles);
        }
      } catch (error) {
        console.error('Unexpected error fetching roles:', error);
        setUserRoles([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUserRoles();
  }, [user?.id, authLoading]);

  const hasPermission = (resource: ResourceType, action: PermissionAction): boolean => {
    // DEV e ADMIN_DEV têm acesso total
    if (userRoles.includes('DEV') || userRoles.includes('ADMIN_DEV')) {
      return true;
    }

    // Mapeamento específico de roles para recursos
    const rolePermissions: Record<AdminRole, Array<{resource: ResourceType, actions: PermissionAction[]}>> = {
      'DEV': [{ resource: 'USERS', actions: ['MANAGE'] }],
      'TechAdmin': [{ resource: 'USERS', actions: ['MANAGE'] }],
      'ADMIN_DEV': [{ resource: 'USERS', actions: ['MANAGE'] }],
      'SHIELD_MASTER': [
        { resource: 'USERS', actions: ['READ', 'UPDATE'] },
        { resource: 'SETTINGS', actions: ['MANAGE'] }
      ],
      'LORE_CRAFTER': [
        { resource: 'CASES', actions: ['MANAGE'] },
        { resource: 'CONTENT', actions: ['MANAGE'] },
        { resource: 'EVENTS', actions: ['CREATE', 'UPDATE'] }
      ],
      'SPEED_WIZARD': [
        { resource: 'ANALYTICS', actions: ['READ'] },
        { resource: 'SETTINGS', actions: ['READ', 'UPDATE'] }
      ],
      'DATA_SEER': [
        { resource: 'ANALYTICS', actions: ['MANAGE'] },
        { resource: 'USERS', actions: ['READ'] }
      ],
      'GROWTH_HACKER': [
        { resource: 'ANALYTICS', actions: ['READ'] },
        { resource: 'CONTENT', actions: ['UPDATE'] }
      ],
      'LOOT_KEEPER': [
        { resource: 'SUBSCRIPTIONS', actions: ['MANAGE'] },
        { resource: 'PAYMENTS', actions: ['MANAGE'] }
      ],
      'HELP_RANGER': [
        { resource: 'USERS', actions: ['READ', 'UPDATE'] },
        { resource: 'SUPPORT', actions: ['MANAGE'] }
      ],
      'LAW_GUARDIAN': [
        { resource: 'USERS', actions: ['READ'] },
        { resource: 'SETTINGS', actions: ['READ'] }
      ],
      'WebSecuritySpecialist': [
        { resource: 'USERS', actions: ['READ', 'UPDATE'] },
        { resource: 'SETTINGS', actions: ['MANAGE'] }
      ],
      'ContentEditor': [
        { resource: 'CASES', actions: ['MANAGE'] },
        { resource: 'CONTENT', actions: ['MANAGE'] },
        { resource: 'EVENTS', actions: ['CREATE', 'UPDATE'] },
        { resource: 'AI_TUTOR', actions: ['MANAGE'] }
      ],
      'WebPerformanceSpecialist': [
        { resource: 'ANALYTICS', actions: ['READ'] },
        { resource: 'SETTINGS', actions: ['READ', 'UPDATE'] }
      ],
      'WebAnalyticsManager': [
        { resource: 'ANALYTICS', actions: ['MANAGE'] },
        { resource: 'USERS', actions: ['READ'] }
      ],
      'DigitalMarketingSpecialist': [
        { resource: 'ANALYTICS', actions: ['READ'] },
        { resource: 'CONTENT', actions: ['UPDATE'] }
      ],
      'EcommerceManager': [
        { resource: 'SUBSCRIPTIONS', actions: ['MANAGE'] },
        { resource: 'PAYMENTS', actions: ['MANAGE'] }
      ],
      'CustomerSupportCoordinator': [
        { resource: 'USERS', actions: ['READ', 'UPDATE'] },
        { resource: 'SUPPORT', actions: ['MANAGE'] }
      ],
      'ComplianceOfficer': [
        { resource: 'USERS', actions: ['READ'] },
        { resource: 'SETTINGS', actions: ['READ'] }
      ]
    };

    return userRoles.some(role => {
      const permissions = rolePermissions[role] || [];
      return permissions.some(perm => 
        perm.resource === resource && 
        (perm.actions.includes(action) || perm.actions.includes('MANAGE'))
      );
    });
  };

  const isAdmin = userRoles.length > 0;

  return {
    userRoles,
    hasPermission,
    isAdmin,
    loading: loading || authLoading
  };
}
