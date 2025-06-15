
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
};

export function useActiveEvents() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchEvents() {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .in("status", ["ACTIVE", "SCHEDULED"])
        .order("scheduled_start", { ascending: true });
      if (!ignore) {
        setEvents(data || []);
        setLoading(false);
      }
    }
    fetchEvents();
    return () => {
      ignore = true;
    };
  }, []);

  return { events, loading };
}
