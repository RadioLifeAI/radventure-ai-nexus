
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventRankingData } from "./useEventRankings";

export interface PersonalEventStats {
  totalParticipations: number;
  totalRadCoinsEarned: number;
  bestRank: number;
  averageRank: number;
  recentEvents: EventRankingData[];
  winCount: number;
  topThreeCount: number;
}

export function usePersonalEventStats(userId?: string) {
  const [personalStats, setPersonalStats] = useState<PersonalEventStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPersonalStats = async (userId: string) => {
    try {
      console.log("🔍 PERSONAL STATS: Buscando dados para usuário:", userId);
      
      // CORREÇÃO: Incluir dados do evento na query
      const { data: userRankings, error: rankingsError } = await supabase
        .from("event_rankings")
        .select(`
          *,
          events!inner(id, name, status, scheduled_start, scheduled_end, prize_radcoins, banner_url)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (rankingsError) {
        console.error("❌ PERSONAL STATS: Erro ao buscar rankings:", rankingsError);
        setPersonalStats(null);
        return;
      }

      console.log("📊 PERSONAL STATS: Rankings encontrados:", userRankings?.length || 0);

      if (!userRankings || userRankings.length === 0) {
        console.log("⚠️ PERSONAL STATS: Nenhum ranking encontrado para o usuário");
        setPersonalStats(null);
        return;
      }

      const { data: userProfile } = await supabase
        .from("profiles")
        .select("full_name, username, avatar_url, medical_specialty")
        .eq("id", userId)
        .single();

      const { data: finalRankings } = await supabase
        .from("event_final_rankings")
        .select("radcoins_awarded")
        .eq("user_id", userId);

      const totalRadCoinsEarned = (finalRankings || []).reduce((sum, r) => sum + (r.radcoins_awarded || 0), 0);
      const ranks = userRankings.map(r => r.rank || 999).filter(rank => rank < 999);
      const bestRank = ranks.length > 0 ? Math.min(...ranks) : 0;
      const averageRank = ranks.length > 0 ? Math.round(ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length) : 0;
      const winCount = userRankings.filter(r => r.rank === 1).length;
      const topThreeCount = userRankings.filter(r => r.rank && r.rank <= 3).length;
      
      console.log("📈 PERSONAL STATS: Estatísticas calculadas:", {
        totalParticipations: userRankings.length,
        totalRadCoinsEarned,
        bestRank,
        winCount,
        topThreeCount
      });

      const formattedUserRankings = userRankings.slice(0, 5).map(ranking => {
        const event = ranking.events; // Dados já vêm do JOIN
        
        return {
          id: ranking.id,
          event_id: ranking.event_id,
          user_id: ranking.user_id,
          score: ranking.score || 0,
          rank: ranking.rank || 999,
          event: {
            id: event.id,
            name: event.name || "Evento",
            status: event.status || "UNKNOWN",
            scheduled_start: event.scheduled_start || new Date().toISOString(),
            scheduled_end: event.scheduled_end || new Date().toISOString(),
            prize_radcoins: event.prize_radcoins || 0,
            banner_url: event.banner_url
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
