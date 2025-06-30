
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useUserProgress() {
  const { user } = useAuth();

  const { data: userProgress, isLoading } = useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Buscar histórico do usuário
      const { data: history, error } = await supabase
        .from('user_case_history')
        .select(`
          case_id,
          is_correct,
          points,
          answered_at,
          medical_cases!inner(specialty, difficulty_level)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      if (!history || history.length === 0) {
        return {
          totalAttempts: 0,
          correctAnswers: 0,
          totalPoints: 0,
          accuracy: 0,
          bySpecialty: {}
        };
      }

      const totalAttempts = history.length;
      const correctAnswers = history.filter(h => h.is_correct).length;
      const totalPoints = history.reduce((sum, h) => sum + (h.points || 0), 0);
      const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;

      // Progresso por especialidade
      const bySpecialty = history.reduce((acc, h) => {
        const specialty = h.medical_cases?.specialty || 'Outros';
        if (!acc[specialty]) {
          acc[specialty] = { total: 0, correct: 0, progress: 0 };
        }
        acc[specialty].total++;
        if (h.is_correct) acc[specialty].correct++;
        acc[specialty].progress = acc[specialty].total > 0 
          ? Math.round((acc[specialty].correct / acc[specialty].total) * 100) 
          : 0;
        return acc;
      }, {} as Record<string, { total: number; correct: number; progress: number }>);

      return {
        totalAttempts,
        correctAnswers,
        totalPoints,
        accuracy,
        bySpecialty
      };
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000 // 2 minutos
  });

  return {
    userProgress,
    isLoading
  };
}
