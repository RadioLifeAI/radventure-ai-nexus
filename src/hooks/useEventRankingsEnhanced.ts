
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

  // Estados de loading individuais para melhor controle
  const loading = rankingsLoading && statsLoading && hallLoading;
  
  const refetch = async () => {
    console.log("Refetch completo dos rankings de eventos iniciado...");
    try {
      await Promise.all([
        refetchRankings(),
        refetchHall()
      ]);
      console.log("Refetch completo dos rankings concluído com sucesso");
    } catch (error) {
      console.error("Erro durante refetch completo:", error);
    }
  };

  return {
    activeEventRankings,
    personalStats,
    hallOfFameData,
    loading,
    activeTab,
    setActiveTab,
    refetch,
    // Estados individuais para diagnóstico
    loadingStates: {
      rankings: rankingsLoading,
      stats: statsLoading,
      hall: hallLoading
    }
  };
}

export type { EventRankingData, PersonalEventStats };
