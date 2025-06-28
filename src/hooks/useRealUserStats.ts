
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface RealUserStats {
  totalCases: number;
  correctAnswers: number;
  accuracy: number;
  totalPoints: number;
  radcoinBalance: number;
  currentStreak: number;
  specialtyBreakdown: Record<string, {
    attempted: number;
    correct: number;
    accuracy: number;
    points: number;
  }>;
  difficultyBreakdown: Record<string, {
    attempted: number;
    correct: number;
    accuracy: number;
    avgPoints: number;
  }>;
  weeklyActivity: Array<{
    date: string;
    cases: number;
    points: number;
    accuracy: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    cases: number;
    points: number;
    accuracy: number;
  }>;
  recentAchievements: Array<{
    name: string;
    description: string;
    earnedAt: string;
    rarity: string;
  }>;
  rankingPosition: {
    global: number;
    specialty: number;
    totalUsers: number;
  };
}

export function useRealUserStats() {
  const { user } = useAuth();

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['real-user-stats', user?.id],
    queryFn: async (): Promise<RealUserStats> => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('🔍 Buscando estatísticas reais para:', user.id);

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Buscar histórico completo de casos
      const { data: caseHistory, error: historyError } = await supabase
        .from('user_case_history')
        .select(`
          *,
          medical_cases!inner(
            specialty,
            difficulty_level,
            points,
            modality
          )
        `)
        .eq('user_id', user.id)
        .order('answered_at', { ascending: false });

      if (historyError) throw historyError;

      // Calcular estatísticas básicas
      const totalCases = caseHistory?.length || 0;
      const correctAnswers = caseHistory?.filter(h => h.is_correct).length || 0;
      const accuracy = totalCases > 0 ? Math.round((correctAnswers / totalCases) * 100) : 0;
      const totalPoints = caseHistory?.reduce((sum, h) => sum + (h.points || 0), 0) || 0;

      // Breakdown por especialidade
      const specialtyBreakdown: Record<string, any> = {};
      caseHistory?.forEach(history => {
        const specialty = history.medical_cases?.specialty || 'Outros';
        if (!specialtyBreakdown[specialty]) {
          specialtyBreakdown[specialty] = {
            attempted: 0,
            correct: 0,
            accuracy: 0,
            points: 0
          };
        }
        specialtyBreakdown[specialty].attempted++;
        if (history.is_correct) specialtyBreakdown[specialty].correct++;
        specialtyBreakdown[specialty].points += history.points || 0;
      });

      // Calcular accuracy por especialidade
      Object.keys(specialtyBreakdown).forEach(specialty => {
        const data = specialtyBreakdown[specialty];
        data.accuracy = data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0;
      });

      // Breakdown por dificuldade
      const difficultyBreakdown: Record<string, any> = {};
      caseHistory?.forEach(history => {
        const level = history.medical_cases?.difficulty_level?.toString() || '1';
        const difficultyKey = `Nível ${level}`;
        if (!difficultyBreakdown[difficultyKey]) {
          difficultyBreakdown[difficultyKey] = {
            attempted: 0,
            correct: 0,
            accuracy: 0,
            totalPoints: 0,
            avgPoints: 0
          };
        }
        difficultyBreakdown[difficultyKey].attempted++;
        if (history.is_correct) difficultyBreakdown[difficultyKey].correct++;
        difficultyBreakdown[difficultyKey].totalPoints += history.points || 0;
      });

      // Calcular médias por dificuldade
      Object.keys(difficultyBreakdown).forEach(difficulty => {
        const data = difficultyBreakdown[difficulty];
        data.accuracy = data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0;
        data.avgPoints = data.attempted > 0 ? Math.round(data.totalPoints / data.attempted) : 0;
      });

      // Atividade semanal (últimos 7 dias)
      const weeklyActivity = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayCases = caseHistory?.filter(h => 
          h.answered_at.startsWith(dateStr)
        ) || [];
        
        const dayCorrect = dayCases.filter(h => h.is_correct).length;
        const dayPoints = dayCases.reduce((sum, h) => sum + (h.points || 0), 0);
        const dayAccuracy = dayCases.length > 0 ? Math.round((dayCorrect / dayCases.length) * 100) : 0;

        weeklyActivity.push({
          date: date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
          cases: dayCases.length,
          points: dayPoints,
          accuracy: dayAccuracy
        });
      }

      // Tendências mensais (últimos 6 meses)
      const monthlyTrends = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const monthCases = caseHistory?.filter(h => 
          h.answered_at.startsWith(monthStr)
        ) || [];
        
        const monthCorrect = monthCases.filter(h => h.is_correct).length;
        const monthPoints = monthCases.reduce((sum, h) => sum + (h.points || 0), 0);
        const monthAccuracy = monthCases.length > 0 ? Math.round((monthCorrect / monthCases.length) * 100) : 0;

        monthlyTrends.push({
          month: date.toLocaleDateString('pt-BR', { month: 'short' }),
          cases: monthCases.length,
          points: monthPoints,
          accuracy: monthAccuracy
        });
      }

      // Conquistas baseadas em dados reais
      const recentAchievements = [];
      if (totalCases >= 1) {
        recentAchievements.push({
          name: 'Primeiro Caso',
          description: 'Resolveu seu primeiro caso médico',
          earnedAt: caseHistory?.[caseHistory.length - 1]?.answered_at || new Date().toISOString(),
          rarity: 'comum'
        });
      }
      if (totalCases >= 10) {
        recentAchievements.push({
          name: 'Explorador Médico',
          description: 'Completou 10 casos médicos',
          earnedAt: caseHistory?.[totalCases - 10]?.answered_at || new Date().toISOString(),
          rarity: 'raro'
        });
      }
      if (correctAnswers >= 5) {
        recentAchievements.push({
          name: 'Diagnóstico Certeiro',
          description: 'Acertou 5 diagnósticos consecutivos',
          earnedAt: caseHistory?.find(h => h.is_correct)?.answered_at || new Date().toISOString(),
          rarity: 'comum'
        });
      }
      if (accuracy >= 80 && totalCases >= 5) {
        recentAchievements.push({
          name: 'Expert em Precisão',
          description: 'Mantém 80% de precisão com pelo menos 5 casos',
          earnedAt: new Date().toISOString(),
          rarity: 'épico'
        });
      }

      // Buscar posição no ranking global
      const { data: allProfiles, error: rankingError } = await supabase
        .from('profiles')
        .select('id, total_points')
        .order('total_points', { ascending: false });

      if (rankingError) throw rankingError;

      const globalRank = allProfiles?.findIndex(p => p.id === user.id) + 1 || 0;
      const totalUsers = allProfiles?.length || 1;

      // Ranking por especialidade (usando a especialidade mais jogada)
      const topSpecialty = Object.keys(specialtyBreakdown).sort((a, b) => 
        specialtyBreakdown[b].attempted - specialtyBreakdown[a].attempted
      )[0];

      let specialtyRank = 0;
      if (topSpecialty && profile.medical_specialty) {
        const { data: specialtyProfiles } = await supabase
          .from('profiles')
          .select('id, total_points')
          .eq('medical_specialty', profile.medical_specialty)
          .order('total_points', { ascending: false });

        specialtyRank = specialtyProfiles?.findIndex(p => p.id === user.id) + 1 || 0;
      }

      console.log('✅ Estatísticas reais calculadas:', {
        totalCases,
        correctAnswers,
        accuracy,
        totalPoints,
        globalRank
      });

      return {
        totalCases,
        correctAnswers,
        accuracy,
        totalPoints,
        radcoinBalance: profile.radcoin_balance || 0,
        currentStreak: profile.current_streak || 0,
        specialtyBreakdown,
        difficultyBreakdown,
        weeklyActivity,
        monthlyTrends,
        recentAchievements,
        rankingPosition: {
          global: globalRank,
          specialty: specialtyRank,
          totalUsers
        }
      };
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
