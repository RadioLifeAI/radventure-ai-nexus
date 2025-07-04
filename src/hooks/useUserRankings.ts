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
      console.log("🏆 Buscando rankings OTIMIZADOS via cache");

      // CORREÇÃO CRÍTICA: Usar user_stats_cache em vez de queries pesadas
      const { data: cachedRankings, error } = await supabase
        .from("user_stats_cache")
        .select(`
          user_id,
          total_cases,
          correct_answers,
          accuracy_percentage,
          total_points,
          current_streak,
          cache_updated_at
        `)
        .order("total_points", { ascending: false })
        .limit(50); // Reduzir limite para melhor performance

      if (error) throw error;

      if (!cachedRankings || cachedRankings.length === 0) {
        console.warn("⚠️ Cache vazio, fazendo fallback para query direta");
        await fetchRankingsFallback();
        return;
      }

      // Buscar dados dos perfis apenas para os usuários no cache
      const userIds = cachedRankings.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id, 
          full_name, 
          username, 
          avatar_url, 
          medical_specialty
        `)
        .in('id', userIds);

      if (profilesError) {
        console.warn("Aviso: Erro ao buscar perfis:", profilesError);
        return;
      }

      // OTIMIZAÇÃO: Combinar dados do cache com perfis
      const profilesMap = new Map((profiles || []).map(p => [p.id, p]));

      const rankingsWithStats = cachedRankings.map((cached, index) => {
        const profile = profilesMap.get(cached.user_id);
        
        return {
          id: cached.user_id,
          full_name: profile?.full_name || 'Usuário',
          username: profile?.username || 'user',
          avatar_url: profile?.avatar_url || '',
          total_points: cached.total_points,
          current_streak: cached.current_streak,
          medical_specialty: profile?.medical_specialty || '',
          rank: index + 1,
          casesResolved: cached.total_cases,
          accuracy: cached.accuracy_percentage,
          weeklyPoints: 0, // Será calculado depois se necessário
          monthlyPoints: 0  // Será calculado depois se necessário
        };
      });

      setGlobalRankings(rankingsWithStats);
      console.log(`✅ Rankings carregados via CACHE: ${rankingsWithStats.length} usuários`);
    } catch (error) {
      console.error("❌ Erro ao buscar rankings via cache:", error);
      await fetchRankingsFallback();
    } finally {
      setLoading(false);
    }
  };

  // Fallback para query direta quando cache falha
  const fetchRankingsFallback = async () => {
    try {
      console.log("📊 Executando fallback para query direta");
      
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
        .limit(20); // Limite menor para fallback

      if (error) throw error;

      const rankingsWithStats = (profiles || []).map((profile, index) => ({
        ...profile,
        rank: index + 1,
        casesResolved: 0, // Será preenchido por query separada se necessário
        accuracy: 0,
        weeklyPoints: 0,
        monthlyPoints: 0
      }));

      setGlobalRankings(rankingsWithStats);

      // Encontrar posição do usuário atual
      if (user) {
        const userPosition = rankingsWithStats.findIndex(p => p.id === user.id);
        setUserRank(userPosition !== -1 ? userPosition + 1 : null);
      }

      console.log("✅ Rankings fallback carregados:", rankingsWithStats.length, "usuários");
    } catch (error) {
      console.error("❌ Erro no fallback dos rankings:", error);
      setGlobalRankings([]);
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
