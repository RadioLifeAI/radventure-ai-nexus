import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DailyChallengeStats {
  activePrompts: number;
  pendingQuestions: number;
  scheduledChallenges: number;
  engagementRate: number;
  isLoading: boolean;
}

export function useDailyChallengeStats() {
  const [stats, setStats] = useState<DailyChallengeStats>({
    activePrompts: 0,
    pendingQuestions: 0,
    scheduledChallenges: 0,
    engagementRate: 0,
    isLoading: true
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setStats(prev => ({ ...prev, isLoading: true }));

      // Buscar prompts ativos
      const { data: prompts, error: promptsError } = await supabase
        .from('quiz_prompt_controls')
        .select('id')
        .eq('is_active', true);

      if (promptsError) throw promptsError;

      // Buscar questões pendentes
      const { data: questions, error: questionsError } = await supabase
        .from('daily_quiz_questions')
        .select('id')
        .eq('status', 'draft');

      if (questionsError) throw questionsError;

      // Buscar desafios agendados
      const { data: challenges, error: challengesError } = await supabase
        .from('daily_challenges')
        .select('id')
        .eq('is_active', true)
        .gte('challenge_date', new Date().toISOString().split('T')[0]);

      if (challengesError) throw challengesError;

      // Calcular taxa de engajamento (usuários que responderam hoje)
      const today = new Date().toISOString().split('T')[0];
      const { data: todayChallenge } = await supabase
        .from('daily_challenges')
        .select('id, community_stats')
        .eq('challenge_date', today)
        .single();

      let engagementRate = 0;
      if (todayChallenge?.community_stats) {
        const stats = todayChallenge.community_stats as any;
        const totalUsers = await supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('type', 'USER');
        
        if (totalUsers.count && stats.total_responses) {
          engagementRate = Math.round((stats.total_responses / totalUsers.count) * 100);
        }
      }

      setStats({
        activePrompts: prompts?.length || 0,
        pendingQuestions: questions?.length || 0,
        scheduledChallenges: challenges?.length || 0,
        engagementRate,
        isLoading: false
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  return { stats, refreshStats: loadStats };
}