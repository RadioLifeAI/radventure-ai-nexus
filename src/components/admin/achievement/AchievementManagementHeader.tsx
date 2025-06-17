
import React from "react";
import { Trophy, Sparkles, Award, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AchievementManagementHeaderProps {
  totalAchievements?: number;
  activeAchievements?: number;
  unlockedToday?: number;
}

export function AchievementManagementHeader({ 
  totalAchievements = 0, 
  activeAchievements = 0, 
  unlockedToday = 0 
}: AchievementManagementHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 text-white mb-6">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative px-8 py-12">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
            <Trophy className="h-8 w-8 text-yellow-300" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              Gestão de Conquistas
              <Sparkles className="h-8 w-8 text-yellow-300" />
            </h1>
            <p className="text-yellow-100 text-lg">
              Configure conquistas e sistemas de recompensa gamificados
            </p>
            <div className="flex items-center gap-4 mt-3">
              <Badge className="bg-yellow-500/80 text-white px-3 py-1">
                <Award className="h-4 w-4 mr-1" />
                {totalAchievements} conquistas
              </Badge>
              <Badge className="bg-orange-500/80 text-white px-3 py-1">
                <Target className="h-4 w-4 mr-1" />
                {activeAchievements} ativas
              </Badge>
              <Badge className="bg-red-500/80 text-white px-3 py-1">
                <Trophy className="h-4 w-4 mr-1" />
                {unlockedToday} desbloqueadas hoje
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
