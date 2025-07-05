
import { useState } from "react";
import { useAuth } from "./useAuth";
import { useEventRankings, EventRankingData } from "./useEventRankings";
import { usePersonalEventStats, PersonalEventStats } from "./usePersonalEventStats";
import { useHallOfFame } from "./useHallOfFame";

export function useEventRankingsEnhanced() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active");
  
  const { activeEventRankings, loading: rankingsLoading, refetch: refetchRankings } = useEventRankings();
  const { personalStats, loading: statsLoading } = usePersonalEventStats(user?.id);
  const { hallOfFameData, loading: hallLoading, refetch: refetchHall } = useHallOfFame();

  const loading = rankingsLoading || statsLoading || hallLoading;

  const refetch = async () => {
    await Promise.all([
      refetchRankings(),
      refetchHall()
    ]);
  };

  return {
    activeEventRankings,
    personalStats,
    hallOfFameData,
    loading,
    activeTab,
    setActiveTab,
    refetch
  };
}

export type { EventRankingData, PersonalEventStats };
