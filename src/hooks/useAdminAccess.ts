
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useAdminAccess() {
  const { user } = useAuth();

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['admin-access', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      console.log('Verificando acesso admin para usuário:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('type')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Erro ao verificar admin:', error);
        return false;
      }
      
      const isAdminUser = data?.type === 'ADMIN';
      console.log('Usuário é admin:', isAdminUser);
      
      return isAdminUser;
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: false,
  });

  return {
    isAdmin: isAdmin || false,
    isLoading,
    canAccessAdmin: isAdmin || false
  };
}
