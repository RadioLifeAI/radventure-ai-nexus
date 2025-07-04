
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserAnalytics {
  totalCases: number;
  correctAnswers: number;
  accuracy: number;
  averagePoints: number;
  specialtyPerformance: Record<string, {
    cases: number;
    correct: number;
    accuracy: number;
    points: number;
  }>;
  weeklyActivity: Record<string, number>;
  monthlyTrends: Record<string, {
    cases: number;
    points: number;
    accuracy: number;
  }>;
  streakData: {
    current: number;
    longest: number;
    lastActivity: string;
  };
  eventParticipation: {
    total: number;
    completed: number;
    averageRank: number;
  };
}

export function useUserAnalytics() {
  const { user } = useAuth();

  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ['user-analytics', user?.id],
    queryFn: async (): Promise<UserAnalytics> => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('📊 Buscando analytics otimizados para usuário:', user.id);

      // OTIMIZAÇÃO: Primeiro tentar buscar do cache
      const { data: cachedStats } = await supabase
        .from('user_stats_cache')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Se cache existe e é recente (< 30 minutos), usar dados otimizados
      if (cachedStats && 
          new Date(cachedStats.cache_updated_at) > new Date(Date.now() - 30 * 60 * 1000)) {
        console.log('✅ Usando analytics em cache (performance otimizada)');
        
        // Buscar apenas dados dinâmicos necessários
        const [eventData, rankingsData, profileData] = await Promise.all([
          supabase.from('event_registrations')
            .select('*, events (name, status)')
            .eq('user_id', user.id),
          supabase.from('event_rankings')
            .select('rank, score')
            .eq('user_id', user.id),
          supabase.from('profiles')
            .select('current_streak')
            .eq('id', user.id)
            .single()
        ]);

        // Calcular participação em eventos
        const eventParticipation = {
          total: eventData.data?.length || 0,
          completed: eventData.data?.filter(e => e.events?.status === 'FINISHED').length || 0,
          averageRank: 0
        };

        if (rankingsData.data && rankingsData.data.length > 0) {
          eventParticipation.averageRank = rankingsData.data.reduce((sum, r) => 
            sum + (r.rank || 0), 0) / rankingsData.data.length;
        }

        return {
          totalCases: cachedStats.total_cases,
          correctAnswers: cachedStats.correct_answers,
          accuracy: cachedStats.accuracy_percentage,
          averagePoints: cachedStats.total_cases > 0 ? cachedStats.total_points / cachedStats.total_cases : 0,
          specialtyPerformance: (cachedStats.specialty_stats as Record<string, {
            cases: number;
            correct: number;
            accuracy: number;
            points: number;
          }>) || {},
          weeklyActivity: {}, // Calculado dinamicamente se necessário
          monthlyTrends: {}, // Calculado dinamicamente se necessário
          streakData: {
            current: profileData.data?.current_streak || 0,
            longest: profileData.data?.current_streak || 0,
            lastActivity: cachedStats.last_activity || ''
          },
          eventParticipation
        };
      }

      // Cache não existe ou expirado - buscar dados completos
      console.log('🔄 Cache de analytics expirado, buscando dados completos...');

      // Buscar histórico de casos (dados reais)
      const { data: caseHistory, error: caseError } = await supabase
        .from('user_case_history')
        .select(`
          *,
          medical_cases (
            specialty,
            points,
            category_id
          )
        `)
        .eq('user_id', user.id);

      if (caseError) throw caseError;

      // Buscar participação em eventos (dados reais)
      const { data: eventData, error: eventError } = await supabase
        .from('event_registrations')
        .select(`
          *,
          events (name, status)
        `)
        .eq('user_id', user.id);

      if (eventError) throw eventError;

      // Buscar rankings do usuário em eventos (dados reais)
      const { data: rankingsData } = await supabase
        .from('event_rankings')
        .select('rank, score')
        .eq('user_id', user.id);

      // Buscar dados do perfil do usuário (dados reais)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('current_streak')
        .eq('id', user.id)
        .single();

      // Calcular estatísticas baseadas em dados reais
      const totalCases = caseHistory?.length || 0;
      const correctAnswers = caseHistory?.filter(h => h.is_correct).length || 0;
      const accuracy = totalCases > 0 ? (correctAnswers / totalCases) * 100 : 0;
      const averagePoints = totalCases > 0 
        ? (caseHistory?.reduce((sum, h) => sum + (h.points || 0), 0) || 0) / totalCases 
        : 0;

      // Performance por especialidade (dados reais)
      const specialtyPerformance: Record<string, any> = {};
      caseHistory?.forEach(history => {
        const specialty = history.medical_cases?.specialty || 'Outros';
        if (!specialtyPerformance[specialty]) {
          specialtyPerformance[specialty] = { cases: 0, correct: 0, points: 0 };
        }
        specialtyPerformance[specialty].cases++;
        if (history.is_correct) specialtyPerformance[specialty].correct++;
        specialtyPerformance[specialty].points += history.points || 0;
      });

      // Calcular accuracy por especialidade
      Object.keys(specialtyPerformance).forEach(specialty => {
        const data = specialtyPerformance[specialty];
        data.accuracy = data.cases > 0 ? (data.correct / data.cases) * 100 : 0;
      });

      // Atividade semanal (últimos 7 dias) - dados reais
      const weeklyActivity: Record<string, number> = {};
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        weeklyActivity[dateStr] = caseHistory?.filter(h => 
          h.answered_at?.startsWith(dateStr)
        ).length || 0;
      }

      // Tendências mensais (últimos 6 meses) - dados reais
      const monthlyTrends: Record<string, any> = {};
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const monthCases = caseHistory?.filter(h => 
          h.answered_at?.startsWith(monthStr)
        ) || [];

        monthlyTrends[monthStr] = {
          cases: monthCases.length,
          points: monthCases.reduce((sum, h) => sum + (h.points || 0), 0),
          accuracy: monthCases.length > 0 
            ? (monthCases.filter(h => h.is_correct).length / monthCases.length) * 100 
            : 0
        };
      }

      // Participação em eventos (dados reais)
      const eventParticipation = {
        total: eventData?.length || 0,
        completed: eventData?.filter(e => e.events?.status === 'FINISHED').length || 0,
        averageRank: 0
      };

      if (rankingsData && rankingsData.length > 0) {
        eventParticipation.averageRank = rankingsData.reduce((sum, r) => 
          sum + (r.rank || 0), 0) / rankingsData.length;
      }

      const analyticsData = {
        totalCases,
        correctAnswers,
        accuracy,
        averagePoints,
        specialtyPerformance,
        weeklyActivity,
        monthlyTrends,
        streakData: {
          current: profileData?.current_streak || 0,
          longest: profileData?.current_streak || 0, // TODO: implementar longest streak
          lastActivity: caseHistory?.[0]?.answered_at || ''
        },
        eventParticipation
      };

      console.log('📊 Analytics calculados com dados reais:', analyticsData);
      return analyticsData;

    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000 // 5 minutos
  });

  return {
    analytics,
    loading: isLoading,
    refetch
  };
}
