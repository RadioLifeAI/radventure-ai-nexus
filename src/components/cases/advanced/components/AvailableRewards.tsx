
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Award, Crown, Target, Flame, Gift } from "lucide-react";
import { RealUserStats } from "@/hooks/useRealUserStats";

interface Props {
  stats: RealUserStats;
}

export function AvailableRewards({ stats }: Props) {
  const availableRewards = [
    {
      id: 1,
      name: "Especialista Radiológico",
      description: "Complete 100 casos de radiologia",
      progress: Math.min((stats.specialtyBreakdown.find(s => s.specialty.toLowerCase().includes('radiologia'))?.cases || 0) / 100 * 100, 100),
      icon: Crown,
      rarity: "legendary",
      reward: "500 RadCoins + Título Especial"
    },
    {
      id: 2,
      name: "Precisão Cirúrgica",
      description: "Mantenha 90% de precisão em 50 casos",
      progress: stats.accuracy >= 90 && stats.totalCases >= 50 ? 100 : (stats.accuracy >= 90 ? (stats.totalCases / 50) * 100 : 0),
      icon: Target,
      rarity: "epic",
      reward: "300 RadCoins + Badge Precisão"
    },
    {
      id: 3,
      name: "Maratonista Médico",
      description: "Resolva casos por 30 dias consecutivos",
      progress: Math.min((stats.currentStreak / 30) * 100, 100),
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
  );
}
