import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface EventFinalRankingData {
  id: string;
  event_id: string;
  user_id: string;
  rank: number;
  radcoins_awarded: number;
  created_at: string;
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

export function useEventHistoryData() {
  const [historyData, setHistoryData] = useState<EventFinalRankingData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      
      console.log("📊 useEventHistoryData - Iniciando busca dos dados históricos...");
      
      const { data: finalRankings, error: rankingsError } = await supabase
        .from("event_final_rankings")
        .select("*")
        .order("created_at", { ascending: false });

      if (rankingsError) {
        console.error("📊 useEventHistoryData - Erro ao buscar histórico de rankings:", rankingsError);
        return;
      }

      if (!finalRankings || finalRankings.length === 0) {
        console.log("📊 useEventHistoryData - Nenhum ranking histórico encontrado");
        setHistoryData([]);
        return;
      }

      console.log("📊 useEventHistoryData - Rankings históricos encontrados:", finalRankings.length, finalRankings);

      const eventIds = [...new Set(finalRankings.map(r => r.event_id))];
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .in("id", eventIds);

      const userIds = [...new Set(finalRankings.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, medical_specialty")
        .in("id", userIds);

      const eventsMap = new Map((events || []).map(e => [e.id, e]));
      const profilesMap = new Map((profiles || []).map(p => [p.id, p]));

      const formattedHistory = finalRankings.map(ranking => {
        const event = eventsMap.get(ranking.event_id);
        const profile = profilesMap.get(ranking.user_id);

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

      console.log("📊 useEventHistoryData - Dados históricos formatados:", formattedHistory.length, formattedHistory);
      setHistoryData(formattedHistory);

    } catch (error) {
      console.error("Erro ao buscar dados históricos:", error);
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryData();
  }, []);

  return {
    historyData,
    loading,
    refetch: fetchHistoryData
  };
}