
import React from "react";
import { Award } from "lucide-react";
import { RealUserStats } from "@/hooks/useRealUserStats";

interface Props {
  stats: RealUserStats;
}

export function RecentAchievements({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {stats.recentAchievements.map((achievement, index) => (
        <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-400/20">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Award className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white">{achievement.name}</h4>
            <p className="text-sm text-cyan-200">+{achievement.points} pontos conquistados</p>
            <p className="text-xs text-cyan-300 mt-1 opacity-80">
              {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
