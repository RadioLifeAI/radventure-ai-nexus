
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './useAuth';

interface ValidationResult {
  check_name: string;
  status: string;
  details: string;
  count_affected: number;
}

interface SyncResult {
  user_id: string;
  old_points: number;
  new_points: number;
  difference: number;
}

export function usePointsValidation() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const validatePointsSystem = async (): Promise<ValidationResult[]> => {
    try {
      setLoading(true);
      console.log('🔍 Validando sistema de pontos...');

      const { data, error } = await supabase.rpc('validate_points_system');

      if (error) {
        console.error('❌ Erro na validação:', error);
        throw error;
      }

      console.log('✅ Validação concluída:', data);
      return data || [];
    } catch (error: any) {
      console.error('❌ Erro ao validar pontos:', error);
      toast({
        title: "Erro na validação",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const syncUserPoints = async (userId?: string): Promise<SyncResult[]> => {
    try {
      setLoading(true);
      const targetUserId = userId || user?.id;
      
      console.log('🔄 Sincronizando pontos para usuário:', targetUserId);

      const { data, error } = await supabase.rpc('sync_user_total_points', {
        p_user_id: targetUserId || null
      });

      if (error) {
        console.error('❌ Erro na sincronização:', error);
        throw error;
      }

      const results = data || [];
      console.log('✅ Sincronização concluída:', results);

      if (results.length > 0) {
        const totalFixed = results.length;
        const totalDifference = results.reduce((sum: number, r: SyncResult) => sum + r.difference, 0);
        
        toast({
          title: "Pontos sincronizados",
          description: `${totalFixed} perfil(s) corrigido(s). Diferença total: ${totalDifference} pontos.`,
        });
      } else {
        toast({
          title: "Pontos já sincronizados",
          description: "Não foram encontradas inconsistências.",
        });
      }

      return results;
    } catch (error: any) {
      console.error('❌ Erro ao sincronizar pontos:', error);
      toast({
        title: "Erro na sincronização",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const runFullValidation = async () => {
    console.log('🚀 Executando validação completa do sistema de pontos...');
    
    const validationResults = await validatePointsSystem();
    const syncResults = await syncUserPoints();
    
    return {
      validation: validationResults,
      sync: syncResults,
      hasIssues: validationResults.some(r => r.status === 'PROBLEMA'),
      summary: {
        totalChecks: validationResults.length,
        problemsFound: validationResults.filter(r => r.status === 'PROBLEMA').length,
        profilesSynced: syncResults.length
      }
    };
  };

  return {
    loading,
    validatePointsSystem,
    syncUserPoints,
    runFullValidation
  };
}
