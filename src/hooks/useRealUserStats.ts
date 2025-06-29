
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface RealUserStats {
  totalCases: number;
  correctAnswers: number;
  accuracy: number;
  totalPoints: number;
  currentStreak: number;
  weeklyActivity: Array<{
    date: string;
    cases: number;
    points: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    cases: number;
    points: number;
    accuracy: number;
  }>;
  specialtyBreakdown: Array<{
    specialty: string;
    cases: number;
    accuracy: number;
    points: number;
  }>;
  difficultyBreakdown: Array<{
    difficulty: number;
    cases: number;
    accuracy: number;
    averagePoints: number;
  }>;
  recentAchievements: Array<{
    name: string;
    description: string;
    type: string;
    earnedAt: string;
  }>;
  performanceInsights: Array<{
    type: 'strength' | 'improvement' | 'streak' | 'milestone';
    title: string;
    description: string;
    value?: number;
    trend?: 'up' | 'down' | 'stable';
  }>;
}

export function useRealUserStats() {
  const { user } = useAuth();

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['real-user-stats', user?.id],
    queryFn: async (): Promise<RealUserStats> => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('📊 Buscando estatísticas reais completas para:', user.id);

      // Buscar histórico completo
      const { data: history, error: historyError } = await supabase
        .from('user_case_history')
        .select(`
          *,
          medical_cases (
            specialty,
            difficulty_level,
            points,
            modality
          )
        `)
        .eq('user_id', user.id)
        .order('answered_at', { ascending: false });

      if (historyError) throw historyError;

      // Buscar perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Calcular estatísticas básicas
      const totalCases = history?.length || 0;
      const correctAnswers = history?.filter(h => h.is_correct).length || 0;
      const accuracy = totalCases > 0 ? Math.round((correctAnswers / totalCases) * 100) : 0;
      const totalPoints = profile?.total_points || 0;
      const currentStreak = profile?.current_streak || 0;

      // Atividade semanal (últimos 7 dias)
      const weeklyActivity = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayCases = history?.filter(h => 
          h.answered_at.startsWith(dateStr)
        ) || [];
        
        weeklyActivity.push({
          date: dateStr,
          cases: dayCases.length,
          points: dayCases.reduce((sum, h) => sum + (h.points || 0), 0)
        });
      }

      // Tendências mensais (últimos 6 meses)
      const monthlyTrends = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const monthCases = history?.filter(h => 
          h.answered_at.startsWith(monthStr)
        ) || [];

        const monthCorrect = monthCases.filter(h => h.is_correct).length;
        
        monthlyTrends.push({
          month: monthStr,
          cases: monthCases.length,
          points: monthCases.reduce((sum, h) => sum + (h.points || 0), 0),
          accuracy: monthCases.length > 0 ? Math.round((monthCorrect / monthCases.length) * 100) : 0
        });
      }

      // Breakdown por especialidade
      const specialtyStats: Record<string, any> = {};
      history?.forEach(h => {
        const specialty = h.medical_cases?.specialty || 'Outros';
        if (!specialtyStats[specialty]) {
          specialtyStats[specialty] = { cases: 0, correct: 0, points: 0 };
        }
        specialtyStats[specialty].cases++;
        if (h.is_correct) specialtyStats[specialty].correct++;
        specialtyStats[specialty].points += h.points || 0;
      });

      const specialtyBreakdown = Object.entries(specialtyStats).map(([specialty, stats]: [string, any]) => ({
        specialty,
        cases: stats.cases,
        accuracy: stats.cases > 0 ? Math.round((stats.correct / stats.cases) * 100) : 0,
        points: stats.points
      })).sort((a, b) => b.cases - a.cases);

      // Breakdown por dificuldade
      const difficultyStats: Record<number, any> = {};
      history?.forEach(h => {
        const difficulty = h.medical_cases?.difficulty_level || 1;
        if (!difficultyStats[difficulty]) {
          difficultyStats[difficulty] = { cases: 0, correct: 0, totalPoints: 0 };
        }
        difficultyStats[difficulty].cases++;
        if (h.is_correct) difficultyStats[difficulty].correct++;
        difficultyStats[difficulty].totalPoints += h.points || 0;
      });

      const difficultyBreakdown = Object.entries(difficultyStats).map(([diff, stats]: [string, any]) => ({
        difficulty: parseInt(diff),
        cases: stats.cases,
        accuracy: stats.cases > 0 ? Math.round((stats.correct / stats.cases) * 100) : 0,
        averagePoints: stats.cases > 0 ? Math.round(stats.totalPoints / stats.cases) : 0
      })).sort((a, b) => a.difficulty - b.difficulty);

      // Conquistas recentes baseadas em dados reais
      const recentAchievements = [];
      
      if (totalCases >= 50) {
        recentAchievements.push({
          name: 'Explorador Experiente',
          description: `Resolveu ${totalCases} casos médicos`,
          type: 'milestone',
          earnedAt: new Date().toISOString()
        });
      }
      
      if (accuracy >= 85 && totalCases >= 10) {
        recentAchievements.push({
          name: 'Diagnóstico Preciso',
          description: `Mantém ${accuracy}% de precisão`,
          type: 'accuracy',
          earnedAt: new Date().toISOString()
        });
      }
      
      if (currentStreak >= 7) {
        recentAchievements.push({
          name: 'Dedicação Semanal',
          description: `${currentStreak} dias consecutivos`,
          type: 'streak',
          earnedAt: new Date().toISOString()
        });
      }

      // Insights de performance baseados em dados reais
      const performanceInsights = [];
      
      const bestSpecialty = specialtyBreakdown[0];
      if (bestSpecialty && bestSpecialty.accuracy >= 80) {
        performanceInsights.push({
          type: 'strength' as const,
          title: `Forte em ${bestSpecialty.specialty}`,
          description: `${bestSpecialty.accuracy}% de acerto em ${bestSpecialty.cases} casos`,
          value: bestSpecialty.accuracy,
          trend: 'up' as const
        });
      }

      const weakSpecialty = specialtyBreakdown.find(s => s.accuracy < 60 && s.cases >= 3);
      if (weakSpecialty) {
        performanceInsights.push({
          type: 'improvement' as const,
          title: `Melhore em ${weakSpecialty.specialty}`,
          description: `${weakSpecialty.accuracy}% de acerto - pratique mais`,
          value: weakSpecialty.accuracy,
          trend: 'down' as const
        });
      }

      if (currentStreak > 0) {
        performanceInsights.push({
          type: 'streak' as const,
          title: 'Sequência Ativa',
          description: `${currentStreak} dias seguidos de atividade`,
          value: currentStreak,
          trend: 'up' as const
        });
      }

      const recentCases = history?.slice(0, 10) || [];
      const recentAccuracy = recentCases.length > 0 
        ? Math.round((recentCases.filter(h => h.is_correct).length / recentCases.length) * 100)
        : 0;

      if (recentAccuracy >= accuracy + 10) {
        performanceInsights.push({
          type: 'milestone' as const,
          title: 'Evolução Recente',
          description: `${recentAccuracy}% nos últimos casos (↑${recentAccuracy - accuracy}%)`,
          value: recentAccuracy,
          trend: 'up' as const
        });
      }

      const result = {
        totalCases,
        correctAnswers,
        accuracy,
        totalPoints,
        currentStreak,
        weeklyActivity,
        monthlyTrends,
        specialtyBreakdown,
        difficultyBreakdown,
        recentAchievements,
        performanceInsights
      };

      console.log('✅ Estatísticas reais calculadas:', result);
      return result;
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000 // 5 minutos
  });

  return {
    stats,
    isLoading,
    error,
    refetch
  };
}
