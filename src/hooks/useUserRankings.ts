
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserRanking {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  total_points: number;
  current_streak: number;
  medical_specialty: string;
  rank: number;
}

export interface EventRanking {
  id: string;
  event_id: string;
  user_id: string;
  score: number;
  rank: number;
  user: {
    full_name: string;
    username: string;
    avatar_url: string;
    medical_specialty: string;
  };
}

export function useUserRankings() {
  const { user } = useAuth();
  const [globalRankings, setGlobalRankings] = useState<UserRanking[]>([]);
  const [specialtyRankings, setSpecialtyRankings] = useState<UserRanking[]>([]);
  const [eventRankings, setEventRankings] = useState<Record<string, EventRanking[]>>({});
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, [user]);

  const fetchRankings = async () => {
    try {
      setLoading(true);

      // Ranking global por pontos
      const { data: globalData, error: globalError } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, total_points, current_streak, medical_specialty")
        .order("total_points", { ascending: false })
        .limit(100);

      if (globalError) throw globalError;

      const globalWithRank = (globalData || []).map((profile, index) => ({
        ...profile,
        rank: index + 1
      }));

      setGlobalRankings(globalWithRank);

      // Encontrar posição do usuário atual
      if (user) {
        const userPosition = globalWithRank.findIndex(p => p.id === user.id);
        setUserRank(userPosition !== -1 ? userPosition + 1 : null);
      }

      // Ranking por especialidade (se usuário tem especialidade)
      if (user?.medical_specialty) {
        const { data: specialtyData, error: specialtyError } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url, total_points, current_streak, medical_specialty")
          .eq("medical_specialty", user.medical_specialty)
          .order("total_points", { ascending: false })
          .limit(50);

        if (specialtyError) throw specialtyError;

        const specialtyWithRank = (specialtyData || []).map((profile, index) => ({
          ...profile,
          rank: index + 1
        }));

        setSpecialtyRankings(specialtyWithRank);
      }
    } catch (error) {
      console.error("Erro ao buscar rankings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventRanking = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from("event_rankings")
        .select(`
          *,
          profiles (
            full_name,
            username,
            avatar_url,
            medical_specialty
          )
        `)
        .eq("event_id", eventId)
        .order("rank", { ascending: true });

      if (error) throw error;

      const rankings = (data || []).map(ranking => ({
        id: ranking.id,
        event_id: ranking.event_id,
        user_id: ranking.user_id,
        score: ranking.score,
        rank: ranking.rank,
        user: {
          full_name: ranking.profiles?.full_name || '',
          username: ranking.profiles?.username || '',
          avatar_url: ranking.profiles?.avatar_url || '',
          medical_specialty: ranking.profiles?.medical_specialty || ''
        }
      }));

      setEventRankings(prev => ({
        ...prev,
        [eventId]: rankings
      }));

      return rankings;
    } catch (error) {
      console.error("Erro ao buscar ranking do evento:", error);
      return [];
    }
  };

  return {
    globalRankings,
    specialtyRankings,
    eventRankings,
    userRank,
    loading,
    fetchEventRanking,
    refetch: fetchRankings
  };
}
