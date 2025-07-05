
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventRankingData } from "./useEventRankings";

export function useHallOfFame() {
  const [hallOfFameData, setHallOfFameData] = useState<EventRankingData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHallOfFame = async () => {
    try {
      setLoading(true);
      
      const { data: topRankings, error: rankingsError } = await supabase
        .from("event_final_rankings")
        .select(`
          *,
          events:event_id (
            id, name, status, scheduled_start, scheduled_end, prize_radcoins, banner_url
          ),
          profiles:user_id (
            id, full_name, username, avatar_url, medical_specialty
          )
        `)
        .eq("rank", 1)
        .limit(20)
        .order("created_at", { ascending: false });

      if (rankingsError) {
        console.error("Erro ao buscar Hall of Fame:", rankingsError);
        return;
      }

      if (!topRankings || topRankings.length === 0) {
        setHallOfFameData([]);
        return;
      }

      const formattedHallOfFame = topRankings.map(ranking => {
        const event = ranking.events;
        const profile = ranking.profiles;

        return {
          id: ranking.id,
          event_id: ranking.event_id,
          user_id: ranking.user_id,
          score: 0, // Final rankings não têm score
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
