
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type EventType = {
  id: string;
  name: string;
  banner_url?: string;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
  prize_radcoins: number;
  number_of_cases?: number;
  max_participants?: number;
  auto_start?: boolean;
  prize_distribution?: any;
  description?: string;
  event_type?: string;
  participant_count?: number;
};

export function useActiveEvents() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    
    async function fetchEvents() {
      setLoading(true);
      try {
        // Buscar eventos
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .in("status", ["ACTIVE", "SCHEDULED"])
          .order("scheduled_start", { ascending: true });

        if (eventsError) throw eventsError;

        // Buscar contagem de participantes para cada evento
        const eventsWithCounts = await Promise.all(
          (eventsData || []).map(async (event) => {
            const { count } = await supabase
              .from("event_registrations")
              .select("*", { count: "exact" })
              .eq("event_id", event.id);

            return {
              ...event,
              participant_count: count || 0
            };
          })
        );

        if (!ignore) {
          setEvents(eventsWithCounts);
        }
      } catch (error) {
        console.error("Erro ao buscar eventos:", error);
        if (!ignore) {
          setEvents([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchEvents();

    // Configurar subscription para updates em tempo real
    const channel = supabase
      .channel('events-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        () => {
          fetchEvents();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_registrations'
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return { events, loading };
}
