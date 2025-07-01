
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

export function useEventRankings() {
  const { user } = useAuth();
  const [activeEventRankings, setActiveEventRankings] = useState<EventRankingData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveEventRankings = async (activeEvents: any[]) => {
    try {
      const { data: rankings, error: rankingsError } = await supabase
        .from("event_rankings")
        .select("*")
        .in("event_id", activeEvents.map(e => e.id))
        .order("rank", { ascending: true });

      if (rankingsError) {
        console.error("Erro ao buscar rankings:", rankingsError);
        return [];
      }

      if (!rankings || rankings.length === 0) {
        return [];
      }

      const userIds = [...new Set(rankings.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, medical_specialty")
        .in("id", userIds);

      const profilesMap = new Map((profiles || []).map(p => [p.id, p]));

      return rankings.map(ranking => {
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
    } catch (error) {
      console.error("Erro interno ao processar rankings ativos:", error);
      return [];
    }
  };

  const fetchEventRankingsData = async () => {
    try {
      setLoading(true);
      
      const { data: activeEvents, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("status", "ACTIVE");

      if (eventsError) {
        console.error("Erro ao buscar eventos ativos:", eventsError);
        throw eventsError;
      }

      if (activeEvents && activeEvents.length > 0) {
        const rankings = await fetchActiveEventRankings(activeEvents);
        setActiveEventRankings(rankings);
      } else {
        setActiveEventRankings([]);
      }

    } catch (error) {
      console.error("Erro ao buscar dados de rankings de eventos:", error);
      setActiveEventRankings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventRankingsData();
  }, [user]);

  return {
    activeEventRankings,
    loading,
    refetch: fetchEventRankingsData
  };
}
