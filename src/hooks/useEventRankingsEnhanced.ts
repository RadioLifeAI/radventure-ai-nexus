
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface EventRankingData {
  id: string;
  event_id: string;
  user_id: string;
  score: number;
  rank: number;
  event: {
    id: string;
    name: string;
    status: string;
    scheduled_start: string;
    scheduled_end: string;
    prize_radcoins: number;
    banner_url?: string;
  };
  user: {
    full_name: string;
    username: string;
    avatar_url: string;
    medical_specialty: string;
  };
}

export interface PersonalEventStats {
  totalParticipations: number;
  totalRadCoinsEarned: number;
  bestRank: number;
  averageRank: number;
  recentEvents: EventRankingData[];
  winCount: number;
  topThreeCount: number;
}

export function useEventRankingsEnhanced() {
  const { user } = useAuth();
  const [activeEventRankings, setActiveEventRankings] = useState<EventRankingData[]>([]);
  const [personalStats, setPersonalStats] = useState<PersonalEventStats | null>(null);
  const [hallOfFameData, setHallOfFameData] = useState<EventRankingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    fetchEventRankingsData();
  }, [user]);

  const fetchEventRankingsData = async () => {
    try {
      setLoading(true);
      
      // Buscar rankings de eventos ativos
      const { data: activeRankings, error: activeError } = await supabase
        .from("event_rankings")
        .select(`
          *,
          events!inner(*),
          profiles!inner(full_name, username, avatar_url, medical_specialty)
        `)
        .eq("events.status", "ACTIVE")
        .order("rank", { ascending: true });

      if (activeError) throw activeError;

      // Transformar dados para o formato esperado
      const formattedActiveRankings = (activeRankings || []).map(ranking => ({
        id: ranking.id,
        event_id: ranking.event_id,
        user_id: ranking.user_id,
        score: ranking.score,
        rank: ranking.rank,
        event: {
          id: ranking.events.id,
          name: ranking.events.name,
          status: ranking.events.status,
          scheduled_start: ranking.events.scheduled_start,
          scheduled_end: ranking.events.scheduled_end,
          prize_radcoins: ranking.events.prize_radcoins,
          banner_url: ranking.events.banner_url
        },
        user: {
          full_name: ranking.profiles.full_name,
          username: ranking.profiles.username,
          avatar_url: ranking.profiles.avatar_url,
          medical_specialty: ranking.profiles.medical_specialty
        }
      }));

      setActiveEventRankings(formattedActiveRankings);

      // Buscar estatísticas pessoais se usuário logado
      if (user) {
        await fetchPersonalStats(user.id);
      }

      // Buscar Hall of Fame (top performers históricos)
      await fetchHallOfFame();

    } catch (error) {
      console.error("Erro ao buscar dados de rankings de eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalStats = async (userId: string) => {
    try {
      // Buscar todas as participações do usuário
      const { data: userRankings, error } = await supabase
        .from("event_rankings")
        .select(`
          *,
          events(*),
          profiles(full_name, username, avatar_url, medical_specialty)
        `)
        .eq("user_id", userId)
        .order("events.scheduled_start", { ascending: false });

      if (error) throw error;

      // Buscar RadCoins ganhos em eventos
      const { data: finalRankings } = await supabase
        .from("event_final_rankings")
        .select("radcoins_awarded")
        .eq("user_id", userId);

      const totalRadCoinsEarned = finalRankings?.reduce((sum, r) => sum + (r.radcoins_awarded || 0), 0) || 0;

      if (userRankings && userRankings.length > 0) {
        const ranks = userRankings.map(r => r.rank || 999);
        const bestRank = Math.min(...ranks);
        const averageRank = ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length;
        const winCount = userRankings.filter(r => r.rank === 1).length;
        const topThreeCount = userRankings.filter(r => r.rank <= 3).length;

        const formattedUserRankings = userRankings.slice(0, 5).map(ranking => ({
          id: ranking.id,
          event_id: ranking.event_id,
          user_id: ranking.user_id,
          score: ranking.score,
          rank: ranking.rank,
          event: {
            id: ranking.events.id,
            name: ranking.events.name,
            status: ranking.events.status,
            scheduled_start: ranking.events.scheduled_start,
            scheduled_end: ranking.events.scheduled_end,
            prize_radcoins: ranking.events.prize_radcoins,
            banner_url: ranking.events.banner_url
          },
          user: {
            full_name: ranking.profiles.full_name,
            username: ranking.profiles.username,
            avatar_url: ranking.profiles.avatar_url,
            medical_specialty: ranking.profiles.medical_specialty
          }
        }));

        setPersonalStats({
          totalParticipations: userRankings.length,
          totalRadCoinsEarned,
          bestRank,
          averageRank: Math.round(averageRank),
          recentEvents: formattedUserRankings,
          winCount,
          topThreeCount
        });
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas pessoais:", error);
    }
  };

  const fetchHallOfFame = async () => {
    try {
      // Buscar top performers (mais vitórias, melhor ranking médio, etc.)
      const { data: topRankings, error } = await supabase
        .from("event_rankings")
        .select(`
          *,
          events(*),
          profiles(full_name, username, avatar_url, medical_specialty)
        `)
        .eq("rank", 1)
        .limit(20)
        .order("events.scheduled_start", { ascending: false });

      if (error) throw error;

      const formattedHallOfFame = (topRankings || []).map(ranking => ({
        id: ranking.id,
        event_id: ranking.event_id,
        user_id: ranking.user_id,
        score: ranking.score,
        rank: ranking.rank,
        event: {
          id: ranking.events.id,
          name: ranking.events.name,
          status: ranking.events.status,
          scheduled_start: ranking.events.scheduled_start,
          scheduled_end: ranking.events.scheduled_end,
          prize_radcoins: ranking.events.prize_radcoins,
          banner_url: ranking.events.banner_url
        },
        user: {
          full_name: ranking.profiles.full_name,
          username: ranking.profiles.username,
          avatar_url: ranking.profiles.avatar_url,
          medical_specialty: ranking.profiles.medical_specialty
        }
      }));

      setHallOfFameData(formattedHallOfFame);
    } catch (error) {
      console.error("Erro ao buscar Hall of Fame:", error);
    }
  };

  return {
    activeEventRankings,
    personalStats,
    hallOfFameData,
    loading,
    activeTab,
    setActiveTab,
    refetch: fetchEventRankingsData
  };
}
