
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AdminRole = 
  | 'DEV'
  | 'TechAdmin'
  | 'WebSecuritySpecialist'
  | 'ContentEditor'
  | 'WebPerformanceSpecialist'
  | 'WebAnalyticsManager'
  | 'DigitalMarketingSpecialist'
  | 'EcommerceManager'
  | 'CustomerSupportCoordinator'
  | 'ComplianceOfficer';

export type PermissionAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'MANAGE';
export type ResourceType = 'USERS' | 'CASES' | 'EVENTS' | 'SUBSCRIPTIONS' | 'ANALYTICS' | 'SETTINGS' | 'AI_TUTOR' | 'CONTENT' | 'PAYMENTS' | 'SUPPORT';

export function useAdminPermissions() {
  const [userRoles, setUserRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRoles() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('admin_roles')
          .select('role')
          .eq('profile_id', user.id);

        if (error) {
          console.error('Error fetching user roles:', error);
          return;
        }

        setUserRoles(data?.map(r => r.role) || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserRoles();
  }, []);

  const hasPermission = (resource: ResourceType, action: PermissionAction): boolean => {
    // DEV e TechAdmin têm acesso total
    if (userRoles.includes('DEV') || userRoles.includes('TechAdmin')) {
      return true;
    }

    // Mapeamento específico de roles para recursos
    const rolePermissions: Record<AdminRole, Array<{resource: ResourceType, actions: PermissionAction[]}>> = {
      'DEV': [{ resource: 'USERS', actions: ['MANAGE'] }],
      'TechAdmin': [{ resource: 'USERS', actions: ['MANAGE'] }],
      'WebSecuritySpecialist': [
        { resource: 'USERS', actions: ['READ', 'UPDATE'] },
        { resource: 'SETTINGS', actions: ['MANAGE'] }
      ],
      'ContentEditor': [
        { resource: 'CASES', actions: ['MANAGE'] },
        { resource: 'CONTENT', actions: ['MANAGE'] },
        { resource: 'EVENTS', actions: ['CREATE', 'UPDATE'] }
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
    loading
  };
}
