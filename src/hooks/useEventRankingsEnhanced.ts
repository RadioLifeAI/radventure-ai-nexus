
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
      
      // Buscar eventos ativos primeiro com tratamento de erro
      const { data: activeEvents, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("status", "ACTIVE");

      if (eventsError) {
        console.error("Erro ao buscar eventos ativos:", eventsError);
        throw eventsError;
      }

      if (activeEvents && activeEvents.length > 0) {
        await fetchActiveEventRankings(activeEvents);
      } else {
        console.log("Nenhum evento ativo encontrado");
        setActiveEventRankings([]);
      }

      // Buscar estatísticas pessoais se usuário logado
      if (user) {
        await fetchPersonalStats(user.id);
      }

      // Buscar Hall of Fame
      await fetchHallOfFame();

    } catch (error) {
      console.error("Erro ao buscar dados de rankings de eventos:", error);
      // Em caso de erro, definir estados vazios para evitar crash
      setActiveEventRankings([]);
      setPersonalStats(null);
      setHallOfFameData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveEventRankings = async (activeEvents: any[]) => {
    try {
      // Buscar rankings para eventos ativos
      const { data: rankings, error: rankingsError } = await supabase
        .from("event_rankings")
        .select("*")
        .in("event_id", activeEvents.map(e => e.id))
        .order("rank", { ascending: true });

      if (rankingsError) {
        console.error("Erro ao buscar rankings:", rankingsError);
        return;
      }

      if (!rankings || rankings.length === 0) {
        console.log("Nenhum ranking encontrado para eventos ativos");
        setActiveEventRankings([]);
        return;
      }

      // Buscar perfis dos usuários únicos
      const userIds = [...new Set(rankings.map(r => r.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, medical_specialty")
        .in("id", userIds);

      if (profilesError) {
        console.error("Erro ao buscar perfis:", profilesError);
        // Continuar mesmo com erro de perfis, usando dados padrão
      }

      // Criar mapa de perfis para lookup rápido
      const profilesMap = new Map((profiles || []).map(p => [p.id, p]));

      // Combinar dados com tratamento robusto de erros
      const formattedActiveRankings = rankings.map(ranking => {
        const event = activeEvents.find(e => e.id === ranking.event_id);
        const profile = profilesMap.get(ranking.user_id);
        
        return {
          id: ranking.id,
          event_id: ranking.event_id,
          user_id: ranking.user_id,
          score: ranking.score || 0,
          rank: ranking.rank || 999,
          event: event ? {
            id: event.id,
            name: event.name || "Evento",
            status: event.status || "UNKNOWN",
            scheduled_start: event.scheduled_start || new Date().toISOString(),
            scheduled_end: event.scheduled_end || new Date().toISOString(),
            prize_radcoins: event.prize_radcoins || 0,
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
      console.log(`${formattedActiveRankings.length} rankings de eventos ativos carregados`);

    } catch (error) {
      console.error("Erro interno ao processar rankings ativos:", error);
      setActiveEventRankings([]);
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

      if (rankingsError) {
        console.error("Erro ao buscar rankings do usuário:", rankingsError);
        return;
      }

      if (!userRankings || userRankings.length === 0) {
        console.log("Nenhum ranking pessoal encontrado");
        setPersonalStats(null);
        return;
      }

      // Buscar eventos relacionados
      const eventIds = [...new Set(userRankings.map(r => r.event_id))];
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .in("id", eventIds);

      if (eventsError) {
        console.error("Erro ao buscar eventos do usuário:", eventsError);
      }

      // Buscar perfil do usuário
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, username, avatar_url, medical_specialty")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Erro ao buscar perfil do usuário:", profileError);
      }

      // Buscar RadCoins ganhos em eventos
      const { data: finalRankings } = await supabase
        .from("event_final_rankings")
        .select("radcoins_awarded")
        .eq("user_id", userId);

      const totalRadCoinsEarned = (finalRankings || []).reduce((sum, r) => sum + (r.radcoins_awarded || 0), 0);

      // Criar mapa de eventos
      const eventsMap = new Map((events || []).map(e => [e.id, e]));

      const ranks = userRankings.map(r => r.rank || 999).filter(rank => rank < 999);
      const bestRank = ranks.length > 0 ? Math.min(...ranks) : 0;
      const averageRank = ranks.length > 0 ? Math.round(ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length) : 0;
      const winCount = userRankings.filter(r => r.rank === 1).length;
      const topThreeCount = userRankings.filter(r => r.rank && r.rank <= 3).length;

      const formattedUserRankings = userRankings.slice(0, 5).map(ranking => {
        const event = eventsMap.get(ranking.event_id);
        
        return {
          id: ranking.id,
          event_id: ranking.event_id,
          user_id: ranking.user_id,
          score: ranking.score || 0,
          rank: ranking.rank || 999,
          event: event ? {
            id: event.id,
            name: event.name || "Evento",
            status: event.status || "UNKNOWN",
            scheduled_start: event.scheduled_start || new Date().toISOString(),
            scheduled_end: event.scheduled_end || new Date().toISOString(),
            prize_radcoins: event.prize_radcoins || 0,
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
        averageRank,
        recentEvents: formattedUserRankings,
        winCount,
        topThreeCount
      });

      console.log(`Estatísticas pessoais carregadas: ${userRankings.length} participações`);

    } catch (error) {
      console.error("Erro ao buscar estatísticas pessoais:", error);
      setPersonalStats(null);
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

      if (rankingsError) {
        console.error("Erro ao buscar Hall of Fame:", rankingsError);
        return;
      }

      if (!topRankings || topRankings.length === 0) {
        console.log("Nenhum dado encontrado para Hall of Fame");
        setHallOfFameData([]);
        return;
      }

      // Buscar eventos relacionados
      const eventIds = [...new Set(topRankings.map(r => r.event_id))];
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .in("id", eventIds);

      if (eventsError) {
        console.error("Erro ao buscar eventos do Hall of Fame:", eventsError);
      }

      // Buscar perfis dos usuários
      const userIds = [...new Set(topRankings.map(r => r.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, medical_specialty")
        .in("id", userIds);

      if (profilesError) {
        console.error("Erro ao buscar perfis do Hall of Fame:", profilesError);
      }

      // Criar mapas para lookup
      const eventsMap = new Map((events || []).map(e => [e.id, e]));
      const profilesMap = new Map((profiles || []).map(p => [p.id, p]));

      const formattedHallOfFame = topRankings.map(ranking => {
        const event = eventsMap.get(ranking.event_id);
        const profile = profilesMap.get(ranking.user_id);

        return {
          id: ranking.id,
          event_id: ranking.event_id,
          user_id: ranking.user_id,
          score: ranking.score || 0,
          rank: ranking.rank || 1,
          event: event ? {
            id: event.id,
            name: event.name || "Evento",
            status: event.status || "FINISHED",
            scheduled_start: event.scheduled_start || new Date().toISOString(),
            scheduled_end: event.scheduled_end || new Date().toISOString(),
            prize_radcoins: event.prize_radcoins || 0,
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
      console.log(`${formattedHallOfFame.length} entradas do Hall of Fame carregadas`);

    } catch (error) {
      console.error("Erro ao buscar Hall of Fame:", error);
      setHallOfFameData([]);
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
