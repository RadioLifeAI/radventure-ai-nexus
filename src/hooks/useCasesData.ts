
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useCasesData() {
  const { user } = useAuth();

  // Estatísticas gerais dos casos
  const { data: casesStats, isLoading: casesStatsLoading } = useQuery({
    queryKey: ['cases-stats'],
    queryFn: async () => {
      const { data: cases, error } = await supabase
        .from('medical_cases')
        .select('specialty, difficulty_level, points');

      if (error) throw error;

      const totalCases = cases?.length || 0;
      const bySpecialty = cases?.reduce((acc, case_) => {
        const specialty = case_.specialty || 'Outros';
        acc[specialty] = (acc[specialty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const byDifficulty = cases?.reduce((acc, case_) => {
        const difficulty = case_.difficulty_level || 1;
        acc[difficulty] = (acc[difficulty] || 0) + 1;
        return acc;
      }, {} as Record<number, number>) || {};

      return {
        totalCases,
        bySpecialty,
        byDifficulty
      };
    },
    staleTime: 5 * 60 * 1000 // 5 minutos
  });

  // CORREÇÃO: Progresso real do usuário baseado no banco de dados
  const { data: userProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Buscar histórico completo do usuário
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
          bySpecialty: {},
          byDifficulty: {},
          recentActivity: []
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
          acc[specialty] = { total: 0, correct: 0 };
        }
        acc[specialty].total++;
        if (h.is_correct) acc[specialty].correct++;
        return acc;
      }, {} as Record<string, { total: number; correct: number }>);

      // Progresso por dificuldade
      const byDifficulty = history.reduce((acc, h) => {
        const difficulty = h.medical_cases?.difficulty_level || 1;
        if (!acc[difficulty]) {
          acc[difficulty] = { total: 0, correct: 0 };
        }
        acc[difficulty].total++;
        if (h.is_correct) acc[difficulty].correct++;
        return acc;
      }, {} as Record<number, { total: number; correct: number }>);

      // Atividade recente (últimos 10)
      const recentActivity = history
        .sort((a, b) => new Date(b.answered_at).getTime() - new Date(a.answered_at).getTime())
        .slice(0, 10)
        .map(h => ({
          caseId: h.case_id,
          isCorrect: h.is_correct,
          points: h.points || 0,
          specialty: h.medical_cases?.specialty || 'Outros',
          answeredAt: h.answered_at
        }));

      return {
        totalAttempts,
        correctAnswers,
        totalPoints,
        accuracy,
        bySpecialty,
        byDifficulty,
        recentActivity
      };
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000 // 2 minutos
  });

  return {
    casesStats,
    userProgress,
    isLoading: casesStatsLoading || progressLoading
  };
}
