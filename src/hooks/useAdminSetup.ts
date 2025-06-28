
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
    refetchInterval: 5000,
    staleTime: 1000 * 30, // FASE 2: Cache de 30 segundos para performance
  });

  // FASE 1: Função simplificada para setup inicial
  const setupFirstAdmin = async () => {
    try {
      console.log('Configurando primeiro admin do sistema...');
      
      const { data, error } = await supabase
        .rpc('setup_initial_admin');

      if (error) throw error;

      if (data) {
        toast({
          title: '🎉 Admin Configurado!',
          description: 'Você agora tem privilégios administrativos.',
        });
      } else {
        toast({
          title: 'ℹ️ Sistema já configurado',
          description: 'Já existem administradores no sistema.',
        });
      }

      await refetch();
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao configurar admin:', error);
      
      toast({
        title: '❌ Erro na Configuração',
        description: error.message || 'Falha ao configurar administrador',
        variant: 'destructive'
      });
      
      return { success: false, error: error.message };
    }
  };

  return {
    needsSetup,
    adminExists,
    isLoading,
    setupFirstAdmin,
    refetch
  };
}
