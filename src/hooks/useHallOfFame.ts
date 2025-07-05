
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventFinalRankingData } from "./useEventRankingsEnhanced";

export function useHallOfFame() {
  const [hallOfFameData, setHallOfFameData] = useState<EventFinalRankingData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHallOfFame = async () => {
    try {
      setLoading(true);
      console.log("🏆 useHallOfFame - Iniciando busca do Hall da Fama...");
      
      const { data: topRankings, error: rankingsError } = await supabase
        .from("event_final_rankings")
        .select("*")
        .eq("rank", 1)
        .limit(20)
        .order("created_at", { ascending: false });

      if (rankingsError) {
        console.error("Erro ao buscar Hall of Fame:", rankingsError);
        return;
      }

      if (!topRankings || topRankings.length === 0) {
        console.log("🏆 useHallOfFame - Nenhum campeão encontrado (rank=1)");
        setHallOfFameData([]);
        return;
      }

      console.log("🏆 useHallOfFame - Campeões encontrados:", topRankings.length, topRankings);

      const eventIds = [...new Set(topRankings.map(r => r.event_id))];
      console.log("🏆 useHallOfFame - IDs dos eventos para buscar:", eventIds);
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .in("id", eventIds);

      if (eventsError) {
        console.error("🏆 useHallOfFame - Erro ao buscar eventos:", eventsError);
      }
      console.log("🏆 useHallOfFame - Eventos encontrados:", events?.length || 0, events);

      const userIds = [...new Set(topRankings.map(r => r.user_id))];
      console.log("🏆 useHallOfFame - IDs dos usuários para buscar:", userIds);
      
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, medical_specialty")
        .in("id", userIds);

      if (profilesError) {
        console.error("🏆 useHallOfFame - Erro ao buscar perfis:", profilesError);
      }
      console.log("🏆 useHallOfFame - Perfis encontrados:", profiles?.length || 0, profiles);

      const eventsMap = new Map((events || []).map(e => [e.id, e]));
      const profilesMap = new Map((profiles || []).map(p => [p.id, p]));

      const formattedHallOfFame = topRankings.map(ranking => {
        const event = eventsMap.get(ranking.event_id);
        const profile = profilesMap.get(ranking.user_id);

        return {
          id: ranking.id,
          event_id: ranking.event_id,
          user_id: ranking.user_id,
          rank: ranking.rank || 1,
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

      console.log("🏆 useHallOfFame - Dados formatados finais:", formattedHallOfFame.length, formattedHallOfFame);
      setHallOfFameData(formattedHallOfFame);

    } catch (error) {
      console.error("Erro ao buscar Hall of Fame:", error);
      setHallOfFameData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHallOfFame();
  }, []);

  return {
    hallOfFameData,
    loading,
    refetch: fetchHallOfFame
  };
}
