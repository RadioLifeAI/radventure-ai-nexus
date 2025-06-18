
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useAdminSetup() {
  const [needsSetup, setNeedsSetup] = useState(false);
  const { toast } = useToast();

  const { data: adminExists, isLoading, refetch } = useQuery({
    queryKey: ['admin-exists'],
    queryFn: async () => {
      console.log('Verificando se existem admins no sistema...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, type')
        .eq('type', 'ADMIN')
        .limit(1);
      
      if (error) {
        console.error('Erro ao verificar admins:', error);
        return false;
      }
      
      const hasAdmin = data && data.length > 0;
      console.log('Admins encontrados:', hasAdmin ? data : 'Nenhum');
      
      setNeedsSetup(!hasAdmin);
      return hasAdmin;
    },
    refetchInterval: 5000, // Verificar a cada 5 segundos se ainda precisa de setup
  });

  const createFirstAdmin = async (email: string, fullName: string) => {
    try {
      console.log('Criando primeiro admin do sistema...');
      
      const { data, error } = await supabase
        .rpc('create_dev_user_simple', {
          p_email: email,
          p_full_name: fullName,
          p_type: 'ADMIN'
        });

      if (error) throw error;

      console.log('Primeiro admin criado com ID:', data);
      
      toast({
        title: '🎉 Primeiro Admin Criado!',
        description: `Sistema configurado com sucesso. Admin: ${fullName}`,
      });

      // Recarregar verificação
      await refetch();
      
      return { success: true, userId: data };
    } catch (error: any) {
      console.error('Erro ao criar primeiro admin:', error);
      
      toast({
        title: '❌ Erro na Configuração',
        description: error.message || 'Falha ao criar primeiro admin',
        variant: 'destructive'
      });
      
      return { success: false, error: error.message };
    }
  };

  return {
    needsSetup,
    adminExists,
    isLoading,
    createFirstAdmin,
    refetch
  };
}
