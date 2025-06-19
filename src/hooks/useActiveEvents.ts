
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
    let channel: any = null;
    
    async function fetchEvents() {
      if (ignore) return;
      
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

    // Fetch initial data
    fetchEvents();

    // Create a unique channel name to avoid conflicts
    const channelName = `events-realtime-${Date.now()}`;
    
    // Configurar subscription para updates em tempo real
    channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        () => {
          if (!ignore) {
            fetchEvents();
          }
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
          if (!ignore) {
            fetchEvents();
          }
        }
      );

    // Subscribe to the channel
    channel.subscribe((status: string) => {
      console.log('Events subscription status:', status);
    });

    return () => {
      ignore = true;
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
    };
  }, []); // Empty dependency array to ensure effect runs only once

  return { events, loading };
}
