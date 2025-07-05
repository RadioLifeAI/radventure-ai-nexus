
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface EventMetrics {
  totalEvents: number;
  activeEvents: number;
  scheduledEvents: number;
  totalParticipants: number;
  userRegistrations: number;
  userCompletedEvents: number;
  totalPrizePool: number;
  avgParticipantsPerEvent: number;
}

export function useEventMetrics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<EventMetrics>({
    totalEvents: 0,
    activeEvents: 0,
    scheduledEvents: 0,
    totalParticipants: 0,
    userRegistrations: 0,
    userCompletedEvents: 0,
    totalPrizePool: 0,
    avgParticipantsPerEvent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const fetchMetrics = async () => {
      if (ignore) return;
      
      setLoading(true);
      try {
        // Buscar eventos gerais
        const { data: events, error: eventsError } = await supabase
          .from("events")
          .select("*");

        if (eventsError) throw eventsError;

        // Buscar total de registrations
        const { count: totalRegistrations, error: registrationsError } = await supabase
          .from("event_registrations")
          .select("*", { count: "exact" });

        if (registrationsError) throw registrationsError;

        // Buscar registrations do usuário atual (se logado)
        let userRegistrations = 0;
        if (user) {
          const { count, error } = await supabase
            .from("event_registrations")
            .select("*", { count: "exact" })
            .eq("user_id", user.id);

          if (!error) userRegistrations = count || 0;
        }

        // Buscar eventos finalizados que o usuário participou
        let userCompletedEvents = 0;
        if (user) {
          const { count, error } = await supabase
            .from("event_registrations")
            .select("event_id")
            .eq("user_id", user.id)
            .in("event_id", 
              events
                ?.filter(e => e.status === "FINISHED")
                .map(e => e.id) || []
            );

          if (!error) userCompletedEvents = count || 0;
        }

      // Buscar total de RadCoins realmente distribuídos
      const { data: distributedCoins } = await supabase
        .from("event_final_rankings")
        .select("radcoins_awarded");

      const totalRadCoinsDistributed = (distributedCoins || []).reduce((sum, r) => sum + (r.radcoins_awarded || 0), 0);

      // Calcular métricas
      const totalEvents = events?.length || 0;
      const activeEvents = events?.filter(e => e.status === "ACTIVE").length || 0;
      const scheduledEvents = events?.filter(e => e.status === "SCHEDULED").length || 0;
      const finishedEvents = events?.filter(e => e.status === "FINISHED").length || 0;
      const totalPrizePool = events?.reduce((sum, event) => sum + event.prize_radcoins, 0) || 0;
      const avgParticipantsPerEvent = totalEvents > 0 ? Math.round((totalRegistrations || 0) / totalEvents) : 0;

        if (!ignore) {
        setMetrics({
          totalEvents,
          activeEvents,
          scheduledEvents,
          totalParticipants: totalRegistrations || 0,
          userRegistrations,
          userCompletedEvents,
          totalPrizePool: totalRadCoinsDistributed,
          avgParticipantsPerEvent
        });
        }
      } catch (error) {
        console.error("Erro ao buscar métricas:", error);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchMetrics();

    return () => {
      ignore = true;
    };
  }, [user]); // Only depend on user changes

  const refetch = async () => {
    setLoading(true);
    try {
      // Buscar eventos gerais
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*");

      if (eventsError) throw eventsError;

      // Buscar total de registrations
      const { count: totalRegistrations, error: registrationsError } = await supabase
        .from("event_registrations")
        .select("*", { count: "exact" });

      if (registrationsError) throw registrationsError;

      // Buscar registrations do usuário atual (se logado)
      let userRegistrations = 0;
      if (user) {
        const { count, error } = await supabase
          .from("event_registrations")
          .select("*", { count: "exact" })
          .eq("user_id", user.id);

        if (!error) userRegistrations = count || 0;
      }

      // Buscar eventos finalizados que o usuário participou
      let userCompletedEvents = 0;
      if (user) {
        const { count, error } = await supabase
          .from("event_registrations")
          .select("event_id")
          .eq("user_id", user.id)
          .in("event_id", 
            events
              ?.filter(e => e.status === "FINISHED")
              .map(e => e.id) || []
          );

        if (!error) userCompletedEvents = count || 0;
      }

    // Buscar total de RadCoins realmente distribuídos
    const { data: distributedCoins } = await supabase
      .from("event_final_rankings")
      .select("radcoins_awarded");

    const totalRadCoinsDistributed = (distributedCoins || []).reduce((sum, r) => sum + (r.radcoins_awarded || 0), 0);

    // Calcular métricas
    const totalEvents = events?.length || 0;
    const activeEvents = events?.filter(e => e.status === "ACTIVE").length || 0;
    const scheduledEvents = events?.filter(e => e.status === "SCHEDULED").length || 0;
    const totalPrizePool = events?.reduce((sum, event) => sum + event.prize_radcoins, 0) || 0;
    const avgParticipantsPerEvent = totalEvents > 0 ? Math.round((totalRegistrations || 0) / totalEvents) : 0;

      setMetrics({
        totalEvents,
        activeEvents,
        scheduledEvents,
        totalParticipants: totalRegistrations || 0,
        userRegistrations,
        userCompletedEvents,
        totalPrizePool: totalRadCoinsDistributed,
        avgParticipantsPerEvent
      });
    } catch (error) {
      console.error("Erro ao refetch métricas:", error);
    } finally {
      setLoading(false);
    }
  };

  return { metrics, loading, refetch };
}
