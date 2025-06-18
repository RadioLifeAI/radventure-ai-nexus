
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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
  const { data: events = [], isLoading: loading } = useQuery({
    queryKey: ['active-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .in("status", ["ACTIVE", "SCHEDULED"])
        .order("scheduled_start", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 2 * 60 * 1000 // Atualiza a cada 2 minutos
  });

  return { events, loading };
}
