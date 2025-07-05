
import { useState } from "react";
import { useAuth } from "./useAuth";
import { useEventRankings, EventRankingData } from "./useEventRankings";
import { usePersonalEventStats, PersonalEventStats } from "./usePersonalEventStats";
import { useHallOfFame } from "./useHallOfFame";
import { useEventHistoryData } from "./useEventHistoryData";

export interface EventFinalRankingData {
  id: string;
  event_id: string;
  user_id: string;
  rank: number;
  radcoins_awarded: number;
  created_at: string;
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

export function useEventRankingsEnhanced() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active");
  
  const { activeEventRankings, loading: rankingsLoading, refetch: refetchRankings } = useEventRankings();
  const { personalStats, loading: statsLoading } = usePersonalEventStats(user?.id);
  const { hallOfFameData, loading: hallLoading, refetch: refetchHall } = useHallOfFame();
  const { historyData, loading: historyLoading, refetch: refetchHistory } = useEventHistoryData();

  // Loading independente - não bloquear interface se um hook falhar
  const loading = {
    rankings: rankingsLoading,
    stats: statsLoading,
    hall: hallLoading,
    history: historyLoading,
    global: rankingsLoading && statsLoading && hallLoading && historyLoading
  };

  const refetch = async () => {
    await Promise.all([
      refetchRankings(),
      refetchHall(),
      refetchHistory()
    ]);
  };

  return {
    activeEventRankings,
    personalStats,
    hallOfFameData,
    historyData,
    loading,
    activeTab,
    setActiveTab,
    refetch
  };
}

export type { EventRankingData, PersonalEventStats };
