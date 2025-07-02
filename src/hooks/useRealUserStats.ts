
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface RealUserStats {
  totalCases: number;
  correctAnswers: number;
  accuracy: number;
  totalPoints: number;
  currentStreak: number;
  radcoinBalance: number;
  reviewCases: number;
  recentActivity: Array<{
    caseId: string;
    isCorrect: boolean;
    points: number;
    specialty: string;
    answeredAt: string;
    isReview: boolean;
  }>;
  specialtyBreakdown: Record<string, {
    total: number;
    correct: number;
    accuracy: number;
    points: number;
  }>;
  difficultyBreakdown: Record<number, {
    total: number;
    correct: number;
    accuracy: number;
    points: number;
  }>;
  recentAchievements: Array<{
    name: string;
    unlockedAt: string;
    points: number;
  }>;
}

export function useRealUserStats() {
  const { user } = useAuth();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['real-user-stats', user?.id],
    queryFn: async (): Promise<RealUserStats> => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('📊 Carregando estatísticas reais do usuário...');

      // 1. Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('total_points, current_streak, radcoin_balance')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
        throw profileError;
      }

      // 2. CORREÇÃO CRÍTICA: Buscar histórico com separação entre primeiras tentativas e revisões
      const { data: allHistory, error: historyError } = await supabase
        .from('user_case_history')
        .select(`
          case_id,
          is_correct,
          points,
          answered_at,
          review_count,
          medical_cases!inner(
            specialty,
            difficulty_level,
            title
          )
        `)
        .eq('user_id', user.id)
        .order('answered_at', { ascending: false });

      if (historyError) {
        console.error('❌ Erro ao buscar histórico:', historyError);
        throw historyError;
      }

      if (!allHistory || allHistory.length === 0) {
        return {
          totalCases: 0,
          correctAnswers: 0,
          accuracy: 0,
          totalPoints: profile?.total_points || 0,
          currentStreak: profile?.current_streak || 0,
          radcoinBalance: profile?.radcoin_balance || 0,
          reviewCases: 0,
          recentActivity: [],
          specialtyBreakdown: {},
          difficultyBreakdown: {},
          recentAchievements: []
        };
      }

      // 3. CORREÇÃO PRINCIPAL: Separar primeiras tentativas de revisões
      // Filtrar apenas primeiras tentativas (review_count = 0 ou null) para cálculos de precisão
      const firstAttempts = allHistory.filter(h => (h.review_count || 0) === 0);
      const reviews = allHistory.filter(h => (h.review_count || 0) > 0);

      // Estatísticas baseadas APENAS em primeiras tentativas
      const totalCases = firstAttempts.length;
      const correctAnswers = firstAttempts.filter(h => h.is_correct).length;
      const accuracy = totalCases > 0 ? Math.round((correctAnswers / totalCases) * 100) : 0;
      const reviewCases = reviews.length;

      console.log('📊 Estatísticas corrigidas:', {
        totalHistory: allHistory.length,
        firstAttempts: firstAttempts.length,
        reviews: reviews.length,
        accuracy: `${accuracy}% (${correctAnswers}/${totalCases})`
      });

      // 4. Atividade recente (todos os 10 mais recentes incluindo revisões)
      const recentActivity = allHistory.slice(0, 10).map(h => ({
        caseId: h.case_id,
        isCorrect: h.is_correct,
        points: h.points || 0,
        specialty: h.medical_cases?.specialty || 'Outros',
        answeredAt: h.answered_at,
        isReview: (h.review_count || 0) > 0
      }));

      // 5. CORREÇÃO: Breakdown por especialidade baseado APENAS em primeiras tentativas
      const specialtyBreakdown = firstAttempts
        .reduce((acc, h) => {
          const specialty = h.medical_cases?.specialty || 'Outros';
          if (!acc[specialty]) {
            acc[specialty] = { total: 0, correct: 0, accuracy: 0, points: 0 };
          }
          acc[specialty].total++;
          if (h.is_correct) acc[specialty].correct++;
          acc[specialty].points += h.points || 0;
          acc[specialty].accuracy = Math.round((acc[specialty].correct / acc[specialty].total) * 100);
          return acc;
        }, {} as Record<string, { total: number; correct: number; accuracy: number; points: number }>);

      // 6. CORREÇÃO: Breakdown por dificuldade baseado APENAS em primeiras tentativas
      const difficultyBreakdown = firstAttempts
        .reduce((acc, h) => {
          const difficulty = h.medical_cases?.difficulty_level || 1;
          if (!acc[difficulty]) {
            acc[difficulty] = { total: 0, correct: 0, accuracy: 0, points: 0 };
          }
          acc[difficulty].total++;
          if (h.is_correct) acc[difficulty].correct++;
          acc[difficulty].points += h.points || 0;
          acc[difficulty].accuracy = Math.round((acc[difficulty].correct / acc[difficulty].total) * 100);
          return acc;
        }, {} as Record<number, { total: number; correct: number; accuracy: number; points: number }>);

      // 7. Buscar conquistas recentes (se houver)
      const { data: achievements } = await supabase
        .from('user_achievements_progress')
        .select(`
          completed_at,
          achievement_system!inner(name, rewards)
        `)
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .order('completed_at', { ascending: false })
        .limit(5);

      const recentAchievements = achievements?.map(a => ({
        name: a.achievement_system?.name || 'Conquista',
        unlockedAt: a.completed_at || '',
        points: (a.achievement_system?.rewards as any)?.points || 0
      })) || [];

      const finalStats: RealUserStats = {
        totalCases,
        correctAnswers,
        accuracy,
        totalPoints: profile?.total_points || 0,
        currentStreak: profile?.current_streak || 0,
        radcoinBalance: profile?.radcoin_balance || 0,
        reviewCases,
        recentActivity,
        specialtyBreakdown,
        difficultyBreakdown,
        recentAchievements
      };

      console.log('✅ Estatísticas carregadas:', finalStats);
      return finalStats;
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: false
  });

  return {
    stats,
    isLoading,
    error
  };
}
