
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventFinalRankingData } from "./useEventRankingsEnhanced";

export interface PersonalEventStats {
  totalParticipations: number;
  totalRadCoinsEarned: number;
  bestRank: number;
  averageRank: number;
  recentEvents: EventFinalRankingData[];
  winCount: number;
  topThreeCount: number;
}

export function usePersonalEventStats(userId?: string) {
  const [personalStats, setPersonalStats] = useState<PersonalEventStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPersonalStats = async (userId: string) => {
    try {
      const { data: userRankings, error: rankingsError } = await supabase
        .from("event_final_rankings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (rankingsError) {
        console.error("Erro ao buscar rankings do usuário:", rankingsError);
        return;
      }

      if (!userRankings || userRankings.length === 0) {
        setPersonalStats(null);
        return;
      }

      const eventIds = [...new Set(userRankings.map(r => r.event_id))];
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .in("id", eventIds);

      const { data: userProfile } = await supabase
        .from("profiles")
        .select("full_name, username, avatar_url, medical_specialty")
        .eq("id", userId)
        .single();

      const totalRadCoinsEarned = (userRankings || []).reduce((sum, r) => sum + (r.radcoins_awarded || 0), 0);
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
          rank: ranking.rank || 999,
          radcoins_awarded: ranking.radcoins_awarded || 0,
          created_at: ranking.created_at || new Date().toISOString(),
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

    } catch (error) {
      console.error("Erro ao buscar estatísticas pessoais:", error);
      setPersonalStats(null);
    }
  };

  useEffect(() => {
    if (userId) {
      setLoading(true);
      fetchPersonalStats(userId).finally(() => setLoading(false));
    }
  }, [userId]);

  return {
    personalStats,
    loading
  };
}
