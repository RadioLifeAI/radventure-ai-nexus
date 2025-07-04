import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AutomationMetrics {
  questionsInPool: number;
  scheduledQuestions: number;
  todayQuestion: any;
  systemHealth: 'excellent' | 'good' | 'warning' | 'error';
  lastExecution: string | null;
  automationLogs: any[];
}

export function useAutomationSystem() {
  const [metrics, setMetrics] = useState<AutomationMetrics>({
    questionsInPool: 0,
    scheduledQuestions: 0,
    todayQuestion: null,
    systemHealth: 'good',
    lastExecution: null,
    automationLogs: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadMetrics = useCallback(async () => {
    try {
      // Questões no pool (aprovadas e não agendadas)
      const { data: poolQuestions } = await supabase
        .from('daily_quiz_questions')
        .select('id')
        .eq('status', 'approved')
        .is('published_date', null);

      // Questões agendadas (futuras)
      const { data: scheduledQuestions } = await supabase
        .from('daily_quiz_questions')
        .select('id, published_date')
        .not('published_date', 'is', null)
        .gte('published_date', new Date().toISOString().split('T')[0]);

      // Questão de hoje
      const today = new Date().toISOString().split('T')[0];
      const { data: todayChallenge } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('challenge_date', today)
        .eq('is_active', true)
        .single();

      // Logs de automação
      const { data: logs } = await supabase
        .from('automation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const questionsInPool = poolQuestions?.length || 0;
      const scheduledCount = scheduledQuestions?.length || 0;

      // Calcular health do sistema
      let systemHealth: AutomationMetrics['systemHealth'] = 'excellent';
      
      if (questionsInPool === 0) {
        systemHealth = 'error';
      } else if (questionsInPool < 3) {
        systemHealth = 'warning';
      } else if (scheduledCount < 5) {
        systemHealth = questionsInPool > 7 ? 'good' : 'warning';
      }

      setMetrics({
        questionsInPool,
        scheduledQuestions: scheduledCount,
        todayQuestion: todayChallenge,
        systemHealth,
        lastExecution: logs?.[0]?.created_at || null,
        automationLogs: logs || []
      });

    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const executeAutomationFunction = useCallback(async (functionName: 'auto_schedule_daily_questions' | 'auto_publish_daily_challenge' | 'maintain_question_pool', params: any = {}) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc(functionName, params);
      
      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Função ${functionName} executada com sucesso`,
      });

      // Recarregar métricas
      await loadMetrics();
      
      return { success: true, data };
    } catch (error: any) {
      console.error(`Erro ao executar ${functionName}:`, error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [loadMetrics, toast]);

  const scheduleQuestions = useCallback(() => {
    return executeAutomationFunction('auto_schedule_daily_questions');
  }, [executeAutomationFunction]);

  const publishTodaysChallenge = useCallback(() => {
    return executeAutomationFunction('auto_publish_daily_challenge');
  }, [executeAutomationFunction]);

  const maintainQuestionPool = useCallback(() => {
    return executeAutomationFunction('maintain_question_pool');
  }, [executeAutomationFunction]);

  const generateQuestionAuto = useCallback(async (category?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-daily-challenge', {
        body: { 
          mode: 'auto',
          category: category || 'Cardiologia'
        }
      });

      if (error) throw error;

      toast({
        title: 'Questão Gerada',
        description: 'Nova questão gerada automaticamente',
      });

      await loadMetrics();
      return { success: true, data };
    } catch (error: any) {
      console.error('Erro ao gerar questão:', error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    }
  }, [loadMetrics, toast]);

  useEffect(() => {
    loadMetrics();
    
    // Atualizar métricas a cada 30 segundos
    const interval = setInterval(loadMetrics, 30000);
    
    return () => clearInterval(interval);
  }, [loadMetrics]);

  return {
    metrics,
    isLoading,
    loadMetrics,
    scheduleQuestions,
    publishTodaysChallenge,
    maintainQuestionPool,
    generateQuestionAuto,
    executeAutomationFunction
  };
}