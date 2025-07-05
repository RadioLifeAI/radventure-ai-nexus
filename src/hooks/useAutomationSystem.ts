import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AutomationMetrics {
  questionsInPool: number;
  scheduledQuestions: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'error';
  lastExecution: string | null;
  approvedToday: number;
  pendingReview: number;
}

export function useAutomationSystem() {
  const [metrics, setMetrics] = useState<AutomationMetrics>({
    questionsInPool: 0,
    scheduledQuestions: 0,
    systemHealth: 'good',
    lastExecution: null,
    approvedToday: 0,
    pendingReview: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadMetrics = async () => {
    try {
      // Buscar status do pool
      const { data: poolStatus, error: poolError } = await supabase
        .rpc('get_daily_challenge_pool_status');

      if (poolError) throw poolError;

      // Buscar questões aprovadas hoje
      const today = new Date().toISOString().split('T')[0];
      const { data: todayQuestions, error: todayError } = await supabase
        .from('daily_quiz_questions')
        .select('*')
        .gte('created_at', today);

      if (todayError) throw todayError;

      // Buscar questões pendentes de revisão
      const { data: pendingQuestions, error: pendingError } = await supabase
        .from('daily_quiz_questions')
        .select('*')
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Buscar último log de automação
      const { data: lastLog, error: logError } = await supabase
        .from('automation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (logError) throw logError;

      setMetrics({
        questionsInPool: (poolStatus as any)?.approved_questions || 0,
        scheduledQuestions: (poolStatus as any)?.scheduled_challenges || 0,
        systemHealth: (poolStatus as any)?.pool_health || 'good',
        lastExecution: lastLog?.[0]?.created_at || null,
        approvedToday: todayQuestions?.filter(q => q.status === 'approved').length || 0,
        pendingReview: pendingQuestions?.length || 0
      });

    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      toast({
        title: 'Erro ao carregar métricas',
        description: 'Não foi possível carregar os dados do sistema',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleQuestions = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-daily-challenge', {
        body: { action: 'weekly_batch', count: 7 }
      });

      if (error) throw error;

      toast({
        title: '📅 Questões Agendadas',
        description: `${data.generated_count} questões geradas para a próxima semana`,
      });

      await loadMetrics();
    } catch (error: any) {
      console.error('Erro ao agendar questões:', error);
      toast({
        title: 'Erro no Agendamento',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const publishTodaysChallenge = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('daily-challenge-generator', {
        body: { action: 'publish_daily' }
      });

      if (error) throw error;

      toast({
        title: '🚀 Desafio Publicado',
        description: 'Desafio diário foi publicado com sucesso',
      });

      await loadMetrics();
    } catch (error: any) {
      console.error('Erro ao publicar desafio:', error);
      toast({
        title: 'Erro na Publicação',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const maintainQuestionPool = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-daily-challenge', {
        body: { action: 'maintain_pool' }
      });

      if (error) throw error;

      const message = data.emergency_generation 
        ? `Pool mantido - ${data.generated_count} questões de emergência geradas`
        : 'Pool verificado - nenhuma manutenção necessária';

      toast({
        title: '🔧 Pool Mantido',
        description: message,
      });

      await loadMetrics();
    } catch (error: any) {
      console.error('Erro ao manter pool:', error);
      toast({
        title: 'Erro na Manutenção',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestionAuto = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-daily-challenge', {
        body: { mode: 'auto' }
      });

      if (error) throw error;

      toast({
        title: '🤖 Questão Gerada',
        description: `Questão sobre ${data.specialty} ${data.auto_approved ? 'aprovada automaticamente' : 'aguardando revisão'}`,
      });

      await loadMetrics();
    } catch (error: any) {
      console.error('Erro ao gerar questão:', error);
      toast({
        title: 'Erro na Geração',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    
    // Atualizar métricas a cada 30 segundos
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    isLoading,
    scheduleQuestions,
    publishTodaysChallenge,
    maintainQuestionPool,
    generateQuestionAuto,
    refreshMetrics: loadMetrics
  };
}