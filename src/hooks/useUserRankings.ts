import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserRanking {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  total_points: number;
  current_streak: number;
  medical_specialty: string;
  rank: number;
  casesResolved?: number;
  accuracy?: number;
  weeklyPoints?: number;
  monthlyPoints?: number;
}

export interface EventRanking {
  id: string;
  event_id: string;
  user_id: string;
  score: number;
  rank: number;
  user: {
    full_name: string;
    username: string;
    avatar_url: string;
    medical_specialty: string;
  };
}

type FilterType = 'global' | 'weekly' | 'monthly' | 'accuracy' | 'cases';

export function useUserRankings() {
  const { user } = useAuth();
  const [globalRankings, setGlobalRankings] = useState<UserRanking[]>([]);
  const [filteredRankings, setFilteredRankings] = useState<UserRanking[]>([]);
  const [eventRankings, setEventRankings] = useState<Record<string, EventRanking[]>>({});
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('global');

  useEffect(() => {
    fetchRankings();
  }, [user]);

  useEffect(() => {
    applyFilter(currentFilter);
  }, [globalRankings, currentFilter]);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      console.log("🏆 Buscando rankings com dados reais otimizados");

      // Query otimizada que busca todos os dados necessários de uma vez
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select(`
          id, 
          full_name, 
          username, 
          avatar_url, 
          total_points, 
          current_streak, 
          medical_specialty
        `)
        .order("total_points", { ascending: false })
        .limit(100);

      if (error) throw error;

      if (!profiles) {
        setGlobalRankings([]);
        return;
      }

      // Buscar estatísticas de casos para todos os usuários de uma vez
      const userIds = profiles.map(p => p.id);
      const { data: caseStats, error: caseError } = await supabase
        .from('user_case_history')
        .select('user_id, is_correct, points, answered_at')
        .in('user_id', userIds);

      if (caseError) {
        console.warn("Aviso: Não foi possível carregar estatísticas de casos:", caseError);
      }

      // Processar estatísticas por usuário
      const userStatsMap = new Map();
      
      if (caseStats) {
        caseStats.forEach(stat => {
          if (!userStatsMap.has(stat.user_id)) {
            userStatsMap.set(stat.user_id, {
              total: 0,
              correct: 0,
              weeklyPoints: 0,
              monthlyPoints: 0
            });
          }
          
          const userStat = userStatsMap.get(stat.user_id);
          userStat.total++;
          
          if (stat.is_correct) {
            userStat.correct++;
          }

          // Calcular pontos semanais e mensais
          const answeredDate = new Date(stat.answered_at);
          const now = new Date();
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

          if (answeredDate >= weekAgo) {
            userStat.weeklyPoints += stat.points || 0;
          }
          
          if (answeredDate >= monthAgo) {
            userStat.monthlyPoints += stat.points || 0;
          }
        });
      }

      // Criar rankings com estatísticas calculadas
      const rankingsWithStats = profiles.map((profile, index) => {
        const stats = userStatsMap.get(profile.id) || { total: 0, correct: 0, weeklyPoints: 0, monthlyPoints: 0 };
        const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

        return {
          ...profile,
          rank: index + 1,
          casesResolved: stats.total,
          accuracy,
          weeklyPoints: stats.weeklyPoints,
          monthlyPoints: stats.monthlyPoints
        };
      });

      setGlobalRankings(rankingsWithStats);

      // Encontrar posição do usuário atual
      if (user) {
        const userPosition = rankingsWithStats.findIndex(p => p.id === user.id);
        setUserRank(userPosition !== -1 ? userPosition + 1 : null);
      }

      console.log("✅ Rankings carregados com sucesso:", rankingsWithStats.length, "usuários");
    } catch (error) {
      console.error("❌ Erro ao buscar rankings:", error);
      setGlobalRankings([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (filterType: FilterType) => {
    if (!globalRankings.length) return;

    let filtered = [...globalRankings];

    // CORREÇÃO: Remover todos os .filter() que eliminam usuários
    // Apenas alterar a ordenação baseada no filtro selecionado
    switch (filterType) {
      case 'global':
        // Já ordenado por total_points
        break;
      
      case 'weekly':
        // Ordenar por weeklyPoints, mas manter todos os usuários
        filtered = filtered.sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0));
        break;
      
      case 'monthly':
        // Ordenar por monthlyPoints, mas manter todos os usuários
        filtered = filtered.sort((a, b) => (b.monthlyPoints || 0) - (a.monthlyPoints || 0));
        break;
      
      case 'accuracy':
        // Ordenar por accuracy, mas manter todos os usuários
        filtered = filtered.sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0));
        break;
      
      case 'cases':
        // Ordenar por casesResolved, mas manter todos os usuários
        filtered = filtered.sort((a, b) => (b.casesResolved || 0) - (a.casesResolved || 0));
        break;
    }

    // Recalcular ranks baseado no filtro (todos os usuários sempre presentes)
    const rankedFiltered = filtered.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    setFilteredRankings(rankedFiltered);
    setCurrentFilter(filterType);

    // Atualizar posição do usuário atual baseada no filtro
    if (user) {
      const userPosition = rankedFiltered.findIndex(p => p.id === user.id);
      setUserRank(userPosition !== -1 ? userPosition + 1 : null);
    }
  };

  const fetchEventRanking = async (eventId: string) => {
    try {
      console.log("🏆 Buscando ranking do evento:", eventId);
      
      const { data, error } = await supabase
        .from("event_rankings")
        .select(`
          id,
          event_id,
          user_id,
          score,
          rank
        `)
        .eq("event_id", eventId)
        .order("rank", { ascending: true });

      if (error) throw error;

      // Buscar dados dos usuários separadamente
      const userIds = (data || []).map(ranking => ranking.user_id);
      const { data: usersData } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, medical_specialty")
        .in("id", userIds);

      const rankings = (data || []).map(ranking => {
        const userData = usersData?.find(u => u.id === ranking.user_id);
        return {
          ...ranking,
          user: {
            full_name: userData?.full_name || '',
            username: userData?.username || '',
            avatar_url: userData?.avatar_url || '',
            medical_specialty: userData?.medical_specialty || ''
          }
        };
      });

      setEventRankings(prev => ({
        ...prev,
        [eventId]: rankings
      }));

      console.log("🏆 Ranking do evento carregado:", rankings.slice(0, 3));
      return rankings;
    } catch (error) {
      console.error("❌ Erro ao buscar ranking do evento:", error);
      return [];
    }
  };

  return {
    globalRankings,
    filteredRankings: filteredRankings.length > 0 ? filteredRankings : globalRankings,
    eventRankings,
    userRank,
    loading,
    currentFilter,
    fetchEventRanking,
    applyFilter,
    refetch: fetchRankings
  };
}
