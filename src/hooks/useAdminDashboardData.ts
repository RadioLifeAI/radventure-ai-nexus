import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface DashboardData {
  // Analytics reais
  total_questions: number;
  approved_questions: number;
  pending_questions: number;
  published_questions: number;
  avg_confidence: number;
  total_responses: number;
  correct_responses: number;
  accuracy_rate: number;
  weekly_generated: number;
  monthly_generated: number;
  pool_health: 'excellent' | 'good' | 'warning' | 'critical';
  last_generation: string | null;
  next_schedule: string;
  generation_trend: {
    this_week: number;
    last_week: number;
    this_month: number;
  };
  automation_status: {
    cron_active: boolean;
    last_maintenance: string | null;
    next_publish: string;
    system_health: string;
  };
}

const parseAnalyticsData = (data: any): DashboardData => {
  const parsed = data as unknown as DashboardData;
  return {
    total_questions: parsed.total_questions || 0,
    approved_questions: parsed.approved_questions || 0,
    pending_questions: parsed.pending_questions || 0,
    published_questions: parsed.published_questions || 0,
    avg_confidence: parsed.avg_confidence || 0,
    total_responses: parsed.total_responses || 0,
    correct_responses: parsed.correct_responses || 0,
    accuracy_rate: parsed.accuracy_rate || 0,
    weekly_generated: parsed.weekly_generated || 0,
    monthly_generated: parsed.monthly_generated || 0,
    pool_health: parsed.pool_health || 'good',
    last_generation: parsed.last_generation,
    next_schedule: parsed.next_schedule || new Date().toISOString(),
    generation_trend: parsed.generation_trend || {
      this_week: 0,
      last_week: 0,
      this_month: 0,
    },
    automation_status: parsed.automation_status || {
      cron_active: true,
      last_maintenance: null,
      next_publish: new Date().toISOString(),
      system_health: 'good',
    },
  };
};

export function useAdminDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      const { data: analyticsData, error } = await supabase.rpc('get_challenge_analytics', {});
      
      if (error) throw error;
      
      const parsedData = parseAnalyticsData(analyticsData);
      setData(parsedData);
    } catch (error: any) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados do dashboard',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestion = async () => {
    try {
      const { data: result, error } = await supabase.functions.invoke('generate-daily-challenge', {
        body: { mode: 'auto' }
      });

      if (error) throw error;

      toast({
        title: '🤖 Questão Gerada',
        description: `Questão sobre ${result.specialty} ${result.auto_approved ? 'aprovada automaticamente' : 'aguardando revisão'}`,
      });

      await loadData();
      return result;
    } catch (error: any) {
      toast({
        title: 'Erro na Geração',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const scheduleWeeklyBatch = async () => {
    try {
      const { data: result, error } = await supabase.functions.invoke('generate-daily-challenge', {
        body: { action: 'weekly_batch', count: 7 }
      });

      if (error) throw error;

      toast({
        title: '📅 Lote Semanal Agendado',
        description: `${result.generated_count} questões geradas para a próxima semana`,
      });

      await loadData();
      return result;
    } catch (error: any) {
      toast({
        title: 'Erro no Agendamento',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const publishTodaysChallenge = async () => {
    try {
      const { data: result, error } = await supabase.functions.invoke('daily-challenge-generator', {
        body: { action: 'publish_daily' }
      });

      if (error) throw error;

      toast({
        title: '🚀 Desafio Publicado',
        description: 'Desafio diário foi publicado com sucesso',
      });

      await loadData();
      return result;
    } catch (error: any) {
      toast({
        title: 'Erro na Publicação',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const maintainPool = async () => {
    try {
      const { data: result, error } = await supabase.functions.invoke('generate-daily-challenge', {
        body: { action: 'maintain_pool' }
      });

      if (error) throw error;

      const message = result.emergency_generation 
        ? `Pool mantido - ${result.generated_count} questões de emergência geradas`
        : 'Pool verificado - nenhuma manutenção necessária';

      toast({
        title: '🔧 Pool Mantido',
        description: message,
      });

      await loadData();
      return result;
    } catch (error: any) {
      toast({
        title: 'Erro na Manutenção',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  useEffect(() => {
    loadData();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    data,
    isLoading,
    generateQuestion,
    scheduleWeeklyBatch,
    publishTodaysChallenge,
    maintainPool,
    refreshData: loadData
  };
}