
import React from "react";
import { useRealUserStats } from "@/hooks/useRealUserStats";
import { PerformanceOverview } from "./components/PerformanceOverview";
import { PerformanceInsights } from "./components/PerformanceInsights";
import { WeeklyActivityChart } from "./components/WeeklyActivityChart";
import { SpecialtyPerformance } from "./components/SpecialtyPerformance";
import { RecentAchievements } from "./components/RecentAchievements";

interface Props {
  userProgress: any;
  casesStats: any;
}

export function IntelligentKnowledgeDashboard({ userProgress, casesStats }: Props) {
  const { stats: realStats, isLoading } = useRealUserStats();

  if (isLoading || !realStats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-white/10 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-white/10 rounded-xl"></div>
          <div className="h-32 bg-white/10 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PerformanceOverview stats={realStats} />
      <PerformanceInsights stats={realStats} />
      <WeeklyActivityChart stats={realStats} />
      <SpecialtyPerformance stats={realStats} />
      <RecentAchievements stats={realStats} />
    </div>
  );
}
