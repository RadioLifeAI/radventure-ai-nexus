
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDailyChallengeStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["daily-challenge-stats"],
    queryFn: async () => {
      // Buscar prompts ativos
      const { data: promptsData, error: promptsError } = await supabase
        .from('quiz_prompt_controls')
        .select('id')
        .eq('is_active', true);

      if (promptsError) throw promptsError;

      // Buscar questões pendentes
      const { data: pendingData, error: pendingError } = await supabase
        .from('daily_quiz_questions')
        .select('id')
        .eq('status', 'draft');

      if (pendingError) throw pendingError;

      // Buscar desafios agendados (próximos 30 dias)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data: scheduledData, error: scheduledError } = await supabase
        .from('daily_challenges')
        .select('id')
        .gte('challenge_date', new Date().toISOString().split('T')[0])
        .lte('challenge_date', thirtyDaysFromNow.toISOString().split('T')[0])
        .eq('is_active', true);

      if (scheduledError) throw scheduledError;

      // Calcular taxa de engajamento (simulada por enquanto)
      const engagementRate = Math.floor(Math.random() * 30) + 70; // 70-100%

      return {
        activePrompts: promptsData?.length || 0,
        pendingQuestions: pendingData?.length || 0,
        scheduledChallenges: scheduledData?.length || 0,
        engagementRate
      };
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  return {
    stats: stats || {
      activePrompts: 0,
      pendingQuestions: 0,
      scheduledChallenges: 0,
      engagementRate: 0
    },
    isLoading
  };
}
