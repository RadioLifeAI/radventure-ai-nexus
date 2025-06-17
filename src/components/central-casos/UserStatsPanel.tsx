
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Zap, TrendingUp, Calendar, Star } from "lucide-react";

interface UserStatsPanelProps {
  userStats: {
    totalCases: number;
    correctCases: number;
    totalPoints: number;
    accuracy: number;
    history: any[];
  } | null;
}

export function UserStatsPanel({ userStats }: UserStatsPanelProps) {
  if (!userStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-white/20 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const recentStreak = calculateStreak(userStats.history);
  const averagePoints = userStats.totalCases > 0 ? Math.round(userStats.totalPoints / userStats.totalCases) : 0;
  const todayCases = userStats.history.filter(h => 
    new Date(h.answered_at).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm border-green-400/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-100">
              <Trophy className="h-5 w-5 text-green-400" />
              Total de Casos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {userStats.totalCases}
            </div>
            <p className="text-green-200 text-sm">
              {userStats.correctCases} acertos de {userStats.totalCases}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-sm border-blue-400/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-100">
              <Target className="h-5 w-5 text-blue-400" />
              Taxa de Acerto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {userStats.accuracy}%
            </div>
            <Progress value={userStats.accuracy} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-violet-600/20 backdrop-blur-sm border-purple-400/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-100">
              <Star className="h-5 w-5 text-purple-400" />
              Total de Pontos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {userStats.totalPoints.toLocaleString()}
            </div>
            <p className="text-purple-200 text-sm">
              Média: {averagePoints} pts/caso
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-sm border-orange-400/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-100">
              <Zap className="h-5 w-5 text-orange-400" />
              Sequência Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {recentStreak}
            </div>
            <p className="text-orange-200 text-sm">
              casos seguidos corretos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 backdrop-blur-sm border-yellow-400/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-100">
              <Calendar className="h-5 w-5 text-yellow-400" />
              Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {todayCases}
            </div>
            <p className="text-yellow-200 text-sm">
              casos resolvidos hoje
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/20 to-rose-600/20 backdrop-blur-sm border-pink-400/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-pink-100">
              <TrendingUp className="h-5 w-5 text-pink-400" />
              Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              #7
            </div>
            <Badge className="bg-pink-500/20 text-pink-200 border-pink-400">
              Top 10
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Progresso por especialidade */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Progresso por Especialidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getSpecialtyProgress(userStats.history).map((specialty) => (
              <div key={specialty.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white">{specialty.name}</span>
                  <span className="text-cyan-200">
                    {specialty.correct}/{specialty.total} ({specialty.accuracy}%)
                  </span>
                </div>
                <Progress value={specialty.accuracy} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function calculateStreak(history: any[]): number {
  if (!history || history.length === 0) return 0;
  
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.answered_at).getTime() - new Date(a.answered_at).getTime()
  );
  
  let streak = 0;
  for (const record of sortedHistory) {
    if (record.is_correct) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function getSpecialtyProgress(history: any[]): any[] {
  if (!history || history.length === 0) return [];
  
  const specialtyMap = new Map();
  
  history.forEach(record => {
    const specialty = record.specialty || 'Outros';
    if (!specialtyMap.has(specialty)) {
      specialtyMap.set(specialty, { total: 0, correct: 0 });
    }
    
    const stats = specialtyMap.get(specialty);
    stats.total++;
    if (record.is_correct) stats.correct++;
  });
  
  return Array.from(specialtyMap.entries()).map(([name, stats]) => ({
    name,
    total: stats.total,
    correct: stats.correct,
    accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
  })).sort((a, b) => b.total - a.total);
}
