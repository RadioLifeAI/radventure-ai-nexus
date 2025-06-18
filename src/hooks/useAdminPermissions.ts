
import { useUserProfile } from './useUserProfile';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAdminPermissions() {
  const { profile, isLoading: profileLoading } = useUserProfile();

  const { data: adminRoles, isLoading: rolesLoading } = useQuery({
    queryKey: ['admin-roles', profile?.id],
    queryFn: async () => {
      if (!profile?.id || profile.type !== 'ADMIN') {
        return [];
      }

      const { data, error } = await supabase
        .from('admin_user_roles')
        .select('admin_role, is_active')
        .eq('user_id', profile.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching admin roles:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!profile?.id && profile.type === 'ADMIN',
  });

  const isAdmin = profile?.type === 'ADMIN';
  const isDev = adminRoles?.some(role => role.admin_role === 'DEV') || false;
  const isTechAdmin = adminRoles?.some(role => role.admin_role === 'TechAdmin') || false;

  const hasPermission = (requiredRole?: string) => {
    if (!isAdmin) return false;
    if (!requiredRole) return true;
    
    return adminRoles?.some(role => 
      role.admin_role === requiredRole && role.is_active
    ) || false;
  };

  return {
    isAdmin,
    isDev,
    isTechAdmin,
    adminRoles: adminRoles || [],
    hasPermission,
    isLoading: profileLoading || rolesLoading,
  };
}
