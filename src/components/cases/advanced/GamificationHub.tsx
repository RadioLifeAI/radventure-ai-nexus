
import React from "react";
import { useRealUserStats } from "@/hooks/useRealUserStats";
import { useUserRankings } from "@/hooks/useUserRankings";
import { PlayerStatusCards } from "./components/PlayerStatusCards";
import { AvailableRewards } from "./components/AvailableRewards";
import { GlobalLeaderboard } from "./components/GlobalLeaderboard";

interface Props {
  userProgress: any;
}

export function GamificationHub({ userProgress }: Props) {
  const { stats: realStats, isLoading: statsLoading } = useRealUserStats();
  const { globalRankings, userRank, loading: rankingsLoading } = useUserRankings();

  if (statsLoading || rankingsLoading || !realStats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-white/10 rounded-xl"></div>
          <div className="h-32 bg-white/10 rounded-xl"></div>
          <div className="h-32 bg-white/10 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PlayerStatusCards 
        stats={realStats} 
        userRank={userRank} 
        totalPlayers={globalRankings.length} 
      />
      <AvailableRewards stats={realStats} />
      <GlobalLeaderboard players={globalRankings} />
    </div>
  );
}
