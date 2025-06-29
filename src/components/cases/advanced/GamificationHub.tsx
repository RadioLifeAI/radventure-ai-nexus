
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Star,
  Target,
  Flame,
  Award,
  Zap,
  Crown,
  Medal,
  Gift
} from "lucide-react";
import { useRealUserStats } from "@/hooks/useRealUserStats";
import { useUserRankings } from "@/hooks/useUserRankings";

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

  // Calcular nível baseado em pontos
  const level = Math.floor(realStats.totalPoints / 100) + 1;
  const pointsForNextLevel = ((level) * 100) - realStats.totalPoints;
  const levelProgress = ((realStats.totalPoints % 100) / 100) * 100;

  // Calcular recompensas disponíveis
  const availableRewards = [
    {
      id: 1,
      name: "Especialista Radiológico",
      description: "Complete 100 casos de radiologia",
      progress: Math.min((realStats.specialtyBreakdown.find(s => s.specialty.toLowerCase().includes('radiologia'))?.cases || 0) / 100 * 100, 100),
      icon: Crown,
      rarity: "legendary",
      reward: "500 RadCoins + Título Especial"
    },
    {
      id: 2,
      name: "Precisão Cirúrgica",
      description: "Mantenha 90% de precisão em 50 casos",
      progress: realStats.accuracy >= 90 && realStats.totalCases >= 50 ? 100 : (realStats.accuracy >= 90 ? (realStats.totalCases / 50) * 100 : 0),
      icon: Target,
      rarity: "epic",
      reward: "300 RadCoins + Badge Precisão"
    },
    {
      id: 3,
      name: "Maratonista Médico",
      description: "Resolva casos por 30 dias consecutivos",
      progress: Math.min((realStats.currentStreak / 30) * 100, 100),
      icon: Flame,
      rarity: "rare",
      reward: "200 RadCoins + Multiplicador 2x"
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400';
      case 'epic': return 'border-purple-400';
      case 'rare': return 'border-blue-400';
      default: return 'border-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status do Jogador */}
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
                de {globalRankings.length}+ jogadores
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
              <div className="text-4xl font-bold text-white mb-2">{realStats.currentStreak}</div>
              <p className="text-orange-200 text-sm">
                dias consecutivos
              </p>
              {realStats.currentStreak >= 7 && (
                <Badge className="mt-2 bg-orange-500/20 text-orange-400 border-orange-400">
                  Em Chamas!
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conquistas Disponíveis */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-400" />
            Conquistas Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableRewards.map((reward) => {
              const IconComponent = reward.icon;
              const isCompleted = reward.progress >= 100;
              
              return (
                <div 
                  key={reward.id}
                  className={`relative p-4 rounded-lg border-2 ${getRarityBorder(reward.rarity)} ${
                    isCompleted 
                      ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' 
                      : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-full bg-gradient-to-r ${getRarityColor(reward.rarity)}`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm">{reward.name}</h3>
                      <p className="text-xs text-gray-300 mt-1">{reward.description}</p>
                    </div>
                    {isCompleted && (
                      <Badge className="bg-green-500 text-white text-xs">
                        Completo!
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-300">Progresso</span>
                      <span className="text-white font-medium">{Math.round(reward.progress)}%</span>
                    </div>
                    <Progress value={reward.progress} className="h-2" />
                  </div>
                  
                  <div className="mt-3 p-2 bg-white/5 rounded text-xs">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Gift className="h-3 w-3" />
                      <span>{reward.reward}</span>
                    </div>
                  </div>
                  
                  {isCompleted && (
                    <Button 
                      size="sm" 
                      className="w-full mt-3 bg-green-600 hover:bg-green-700"
                    >
                      <Award className="h-4 w-4 mr-1" />
                      Resgatar
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-400" />
            Top Jogadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {globalRankings.slice(0, 10).map((player, index) => (
              <div 
                key={player.id}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  index < 3 
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30' 
                    : 'bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  {index === 0 && <Crown className="h-5 w-5 text-yellow-400" />}
                  {index === 1 && <Medal className="h-5 w-5 text-gray-400" />}
                  {index === 2 && <Medal className="h-5 w-5 text-amber-600" />}
                  <span className="font-bold text-white w-6 text-center">
                    #{index + 1}
                  </span>
                </div>
                
                <img 
                  src={player.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.id}`}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border-2 border-white/20"
                />
                
                <div className="flex-1">
                  <div className="font-semibold text-white">
                    {player.full_name || player.username}
                  </div>
                  {player.medical_specialty && (
                    <div className="text-xs text-gray-300">
                      {player.medical_specialty}
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-white">
                    {player.total_points.toLocaleString()} pts
                  </div>
                  {player.current_streak > 0 && (
                    <div className="text-xs text-orange-400 flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      {player.current_streak}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
