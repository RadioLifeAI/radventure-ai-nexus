
import { useEffect, useState, useRef } from "react";
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
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    let ignore = false;
    
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

    // Função para limpar canal existente
    const cleanupChannel = () => {
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.log('Channel cleanup error (expected):', error);
        }
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };

    // Função para configurar subscription
    const setupSubscription = () => {
      if (ignore || isSubscribedRef.current) return;

      // Limpar canal anterior se existir
      cleanupChannel();

      // Criar novo canal com nome único
      const channelName = `events-realtime-${Date.now()}-${Math.random()}`;
      
      const newChannel = supabase
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
              console.log('Events table changed, refetching...');
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
              console.log('Event registrations changed, refetching...');
              fetchEvents();
            }
          }
        );

      // Subscrever apenas uma vez
      newChannel.subscribe((status: string) => {
        console.log('Events subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          isSubscribedRef.current = false;
        }
      });

      channelRef.current = newChannel;
    };

    // Fetch inicial
    fetchEvents();

    // Configurar subscription após um pequeno delay para evitar problemas de timing
    const timeoutId = setTimeout(() => {
      if (!ignore) {
        setupSubscription();
      }
    }, 100);

    return () => {
      ignore = true;
      clearTimeout(timeoutId);
      cleanupChannel();
    };
  }, []); // Empty dependency array - effect runs only once

  return { events, loading };
}
