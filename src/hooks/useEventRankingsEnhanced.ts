
import { useState } from "react";
import { useAuth } from "./useAuth";
import { useEventRankings, EventRankingData } from "./useEventRankings";
import { usePersonalEventStats, PersonalEventStats } from "./usePersonalEventStats";
import { useHallOfFame } from "./useHallOfFame";
import { useEventHistoryData, EventFinalRankingData } from "./useEventHistoryData";

export function useEventRankingsEnhanced() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active");
  
  const { activeEventRankings, loading: rankingsLoading, refetch: refetchRankings } = useEventRankings();
  const { personalStats, loading: statsLoading } = usePersonalEventStats(user?.id);
  const { hallOfFameData, loading: hallLoading, refetch: refetchHall } = useHallOfFame();
  const { historyData, loading: historyLoading, refetch: refetchHistory } = useEventHistoryData();

  const loading = rankingsLoading || statsLoading || hallLoading || historyLoading;

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

export type { EventRankingData, PersonalEventStats, EventFinalRankingData };
