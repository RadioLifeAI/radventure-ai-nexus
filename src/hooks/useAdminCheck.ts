
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useAdminCheck() {
  const { user, isAuthenticated } = useAuth();

  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      console.log('Verificando permissões de admin para:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('type')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erro ao verificar admin:', error);
        return false;
      }

      const isUserAdmin = data?.type === 'ADMIN';
      console.log('Usuário é admin:', isUserAdmin);
      
      return isUserAdmin;
    },
    enabled: !!user?.id && isAuthenticated,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    isAdmin,
    isLoading,
    isAuthenticated
  };
}
