
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Target, Zap, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { RealUserStats } from "@/hooks/useRealUserStats";

interface Props {
  stats: RealUserStats;
}

export function PerformanceOverview({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-cyan-200">Casos Resolvidos</p>
              <p className="text-2xl font-bold text-white">{stats.totalCases}</p>
            </div>
            <BookOpen className="h-8 w-8 text-cyan-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-cyan-200">Precisão</p>
              <p className="text-2xl font-bold text-white">{stats.accuracy}%</p>
            </div>
            <Target className="h-8 w-8 text-green-400" />
          </div>
          <div className="mt-2">
            <Progress value={stats.accuracy} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-cyan-200">Pontos Totais</p>
              <p className="text-2xl font-bold text-white">{stats.totalPoints.toLocaleString()}</p>
            </div>
            <Zap className="h-8 w-8 text-yellow-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-cyan-200">Sequência Atual</p>
              <p className="text-2xl font-bold text-white">{stats.currentStreak}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
