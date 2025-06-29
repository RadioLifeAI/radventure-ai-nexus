
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Trophy, Flame } from "lucide-react";
import { RealUserStats } from "@/hooks/useRealUserStats";

interface Props {
  stats: RealUserStats;
  userRank?: number;
  totalPlayers: number;
}

export function PlayerStatusCards({ stats, userRank, totalPlayers }: Props) {
  const level = Math.floor(stats.totalPoints / 100) + 1;
  const pointsForNextLevel = ((level) * 100) - stats.totalPoints;
  const levelProgress = ((stats.totalPoints % 100) / 100) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-purple-300/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-yellow-400" />
            Nível Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">{level}</div>
            <p className="text-purple-200 text-sm mb-3">
              {pointsForNextLevel} pontos para próximo nível
            </p>
            <Progress value={levelProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border-blue-300/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Ranking Global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">
              #{userRank || '?'}
            </div>
            <p className="text-blue-200 text-sm">
              de {totalPlayers}+ jogadores
            </p>
            {userRank && userRank <= 100 && (
              <Badge className="mt-2 bg-yellow-500/20 text-yellow-400 border-yellow-400">
                Top 100
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border-orange-300/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Flame className="h-5 w-5 text-orange-400" />
            Sequência Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">{stats.currentStreak}</div>
            <p className="text-orange-200 text-sm">
              dias consecutivos
            </p>
            {stats.currentStreak >= 7 && (
              <Badge className="mt-2 bg-orange-500/20 text-orange-400 border-orange-400">
                Em Chamas!
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
