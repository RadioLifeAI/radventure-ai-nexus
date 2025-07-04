import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface OptimizationResult {
  optimization_completed: boolean;
  timestamp: string;
  stats_refreshed: number;
  status: string;
}

interface CleanupResult {
  records_cleaned: number;
  cleanup_date: string;
}

interface SystemMetrics {
  id: string;
  metric_type: string;
  metric_value: number;
  metric_metadata: any;
  recorded_at: string;
}

export function useSystemOptimization() {
  const { toast } = useToast();

  // Query para buscar métricas do sistema
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: async (): Promise<SystemMetrics[]> => {
      const { data, error } = await supabase
        .from('system_metrics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  // Mutation para executar otimização de performance
  const optimizePerformance = useMutation({
    mutationFn: async (): Promise<OptimizationResult> => {
      const { data, error } = await supabase.rpc('optimize_database_performance');
      
      if (error) throw error;
      return data as unknown as OptimizationResult;
    },
    onSuccess: (result) => {
      toast({
        title: "✅ Otimização Concluída",
        description: `Performance otimizada com sucesso! ${result.stats_refreshed} estatísticas atualizadas.`,
      });
      refetchMetrics();
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erro na Otimização",
        description: `Falha ao otimizar performance: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Mutation para executar limpeza de dados antigos
  const cleanupOldData = useMutation({
    mutationFn: async (): Promise<CleanupResult> => {
      const { data, error } = await supabase.rpc('cleanup_old_data');
      
      if (error) throw error;
      return { records_cleaned: data as number, cleanup_date: new Date().toISOString() };
    },
    onSuccess: (result) => {
      toast({
        title: "🧹 Limpeza Concluída",
        description: `${result.records_cleaned} registros antigos removidos com sucesso.`,
      });
      refetchMetrics();
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erro na Limpeza",
        description: `Falha ao limpar dados: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Mutation para atualizar cache de estatísticas de um usuário específico
  const refreshUserStatsCache = useMutation({
    mutationFn: async (userId: string): Promise<void> => {
      const { error } = await supabase.rpc('refresh_user_stats_cache', {
        p_user_id: userId
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "📊 Cache Atualizado",
        description: "Cache de estatísticas do usuário atualizado com sucesso.",
      });
      refetchMetrics();
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erro no Cache",
        description: `Falha ao atualizar cache: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Mutation para criar partições mensais
  const createMonthlyPartitions = useMutation({
    mutationFn: async (): Promise<void> => {
      const { error } = await supabase.rpc('create_monthly_partitions');
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "📅 Partições Criadas",
        description: "Partições mensais criadas com sucesso.",
      });
      refetchMetrics();
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erro nas Partições",
        description: `Falha ao criar partições: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Função para obter métricas agregadas
  const getAggregatedMetrics = () => {
    if (!metrics) return null;

    const performanceOptimizations = metrics.filter(m => m.metric_type === 'performance_optimization');
    const dataCleanups = metrics.filter(m => m.metric_type === 'data_cleanup');
    
    return {
      totalOptimizations: performanceOptimizations.length,
      lastOptimization: performanceOptimizations[0]?.recorded_at,
      totalCleanups: dataCleanups.length,
      lastCleanup: dataCleanups[0]?.recorded_at,
      totalRecordsCleaned: dataCleanups.reduce((sum, cleanup) => 
        sum + (cleanup.metric_value || 0), 0),
      recentMetrics: metrics.slice(0, 10)
    };
  };

  return {
    // Dados
    metrics,
    aggregatedMetrics: getAggregatedMetrics(),
    
    // Estados de loading
    metricsLoading,
    isOptimizing: optimizePerformance.isPending,
    isCleaning: cleanupOldData.isPending,
    isRefreshingCache: refreshUserStatsCache.isPending,
    isCreatingPartitions: createMonthlyPartitions.isPending,
    
    // Funções
    executeOptimization: optimizePerformance.mutate,
    executeCleanup: cleanupOldData.mutate,
    refreshCache: refreshUserStatsCache.mutate,
    createPartitions: createMonthlyPartitions.mutate,
    refetchMetrics,
    
    // Status geral
    isAnyOperationRunning: (
      optimizePerformance.isPending || 
      cleanupOldData.isPending || 
      refreshUserStatsCache.isPending ||
      createMonthlyPartitions.isPending
    )
  };
}