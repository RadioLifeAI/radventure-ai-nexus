
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
      
      // Buscar eventos ativos primeiro
      const { data: activeEvents, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("status", "ACTIVE");

      if (eventsError) throw eventsError;

      if (activeEvents && activeEvents.length > 0) {
        // Buscar rankings para eventos ativos
        const { data: rankings, error: rankingsError } = await supabase
          .from("event_rankings")
          .select("*")
          .in("event_id", activeEvents.map(e => e.id))
          .order("rank", { ascending: true });

        if (rankingsError) throw rankingsError;

        // Buscar perfis dos usuários únicos
        const userIds = [...new Set(rankings?.map(r => r.user_id) || [])];
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url, medical_specialty")
          .in("id", userIds);

        if (profilesError) throw profilesError;

        // Criar mapa de perfis para lookup rápido
        const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

        // Combinar dados
        const formattedActiveRankings = (rankings || []).map(ranking => {
          const event = activeEvents.find(e => e.id === ranking.event_id);
          const profile = profilesMap.get(ranking.user_id);
          
          return {
            id: ranking.id,
            event_id: ranking.event_id,
            user_id: ranking.user_id,
            score: ranking.score,
            rank: ranking.rank,
            event: event ? {
              id: event.id,
              name: event.name,
              status: event.status,
              scheduled_start: event.scheduled_start,
              scheduled_end: event.scheduled_end,
              prize_radcoins: event.prize_radcoins,
              banner_url: event.banner_url
            } : {
              id: ranking.event_id,
              name: "Evento não encontrado",
              status: "UNKNOWN",
              scheduled_start: new Date().toISOString(),
              scheduled_end: new Date().toISOString(),
              prize_radcoins: 0
            },
            user: profile ? {
              full_name: profile.full_name || profile.username || "Usuário",
              username: profile.username || "user",
              avatar_url: profile.avatar_url || "",
              medical_specialty: profile.medical_specialty || "Não informado"
            } : {
              full_name: "Usuário não encontrado",
              username: "unknown",
              avatar_url: "",
              medical_specialty: "Não informado"
            }
          };
        });

        setActiveEventRankings(formattedActiveRankings);
      }

      // Buscar estatísticas pessoais se usuário logado
      if (user) {
        await fetchPersonalStats(user.id);
      }

      // Buscar Hall of Fame
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
      const { data: userRankings, error: rankingsError } = await supabase
        .from("event_rankings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (rankingsError) throw rankingsError;

      if (userRankings && userRankings.length > 0) {
        // Buscar eventos relacionados
        const eventIds = [...new Set(userRankings.map(r => r.event_id))];
        const { data: events, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .in("id", eventIds);

        if (eventsError) throw eventsError;

        // Buscar perfil do usuário
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, username, avatar_url, medical_specialty")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;

        // Buscar RadCoins ganhos em eventos
        const { data: finalRankings } = await supabase
          .from("event_final_rankings")
          .select("radcoins_awarded")
          .eq("user_id", userId);

        const totalRadCoinsEarned = finalRankings?.reduce((sum, r) => sum + (r.radcoins_awarded || 0), 0) || 0;

        // Criar mapa de eventos
        const eventsMap = new Map(events?.map(e => [e.id, e]) || []);

        const ranks = userRankings.map(r => r.rank || 999);
        const bestRank = Math.min(...ranks);
        const averageRank = ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length;
        const winCount = userRankings.filter(r => r.rank === 1).length;
        const topThreeCount = userRankings.filter(r => r.rank <= 3).length;

        const formattedUserRankings = userRankings.slice(0, 5).map(ranking => {
          const event = eventsMap.get(ranking.event_id);
          
          return {
            id: ranking.id,
            event_id: ranking.event_id,
            user_id: ranking.user_id,
            score: ranking.score,
            rank: ranking.rank,
            event: event ? {
              id: event.id,
              name: event.name,
              status: event.status,
              scheduled_start: event.scheduled_start,
              scheduled_end: event.scheduled_end,
              prize_radcoins: event.prize_radcoins,
              banner_url: event.banner_url
            } : {
              id: ranking.event_id,
              name: "Evento não encontrado",
              status: "UNKNOWN",
              scheduled_start: new Date().toISOString(),
              scheduled_end: new Date().toISOString(),
              prize_radcoins: 0
            },
            user: {
              full_name: userProfile?.full_name || userProfile?.username || "Usuário",
              username: userProfile?.username || "user",
              avatar_url: userProfile?.avatar_url || "",
              medical_specialty: userProfile?.medical_specialty || "Não informado"
            }
          };
        });

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
      // Buscar top performers (mais vitórias)
      const { data: topRankings, error: rankingsError } = await supabase
        .from("event_rankings")
        .select("*")
        .eq("rank", 1)
        .limit(20)
        .order("created_at", { ascending: false });

      if (rankingsError) throw rankingsError;

      if (topRankings && topRankings.length > 0) {
        // Buscar eventos relacionados
        const eventIds = [...new Set(topRankings.map(r => r.event_id))];
        const { data: events, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .in("id", eventIds);

        if (eventsError) throw eventsError;

        // Buscar perfis dos usuários
        const userIds = [...new Set(topRankings.map(r => r.user_id))];
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url, medical_specialty")
          .in("id", userIds);

        if (profilesError) throw profilesError;

        // Criar mapas para lookup
        const eventsMap = new Map(events?.map(e => [e.id, e]) || []);
        const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

        const formattedHallOfFame = topRankings.map(ranking => {
          const event = eventsMap.get(ranking.event_id);
          const profile = profilesMap.get(ranking.user_id);

          return {
            id: ranking.id,
            event_id: ranking.event_id,
            user_id: ranking.user_id,
            score: ranking.score,
            rank: ranking.rank,
            event: event ? {
              id: event.id,
              name: event.name,
              status: event.status,
              scheduled_start: event.scheduled_start,
              scheduled_end: event.scheduled_end,
              prize_radcoins: event.prize_radcoins,
              banner_url: event.banner_url
            } : {
              id: ranking.event_id,
              name: "Evento não encontrado",
              status: "UNKNOWN",
              scheduled_start: new Date().toISOString(),
              scheduled_end: new Date().toISOString(),
              prize_radcoins: 0
            },
            user: profile ? {
              full_name: profile.full_name || profile.username || "Usuário",
              username: profile.username || "user",
              avatar_url: profile.avatar_url || "",
              medical_specialty: profile.medical_specialty || "Não informado"
            } : {
              full_name: "Usuário não encontrado",
              username: "unknown",
              avatar_url: "",
              medical_specialty: "Não informado"
            }
          };
        });

        setHallOfFameData(formattedHallOfFame);
      }
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
