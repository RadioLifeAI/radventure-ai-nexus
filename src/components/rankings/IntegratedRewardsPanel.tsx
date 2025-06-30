
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, Award, Zap, Star } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

interface RewardsSummary {
  totalRadCoins: number;
  todayRadCoins: number;
  weeklyRadCoins: number;
  monthlyRadCoins: number;
  recentAchievements: number;
  currentStreak: number;
}

export function IntegratedRewardsPanel() {
  const { profile } = useUserProfile();

  const rewardsSummary: RewardsSummary = {
    totalRadCoins: profile?.radcoin_balance || 0,
    todayRadCoins: 0, // TODO: Implementar quando dados estiverem disponíveis
    weeklyRadCoins: 0,
    monthlyRadCoins: 0,
    recentAchievements: 0,
    currentStreak: profile?.current_streak || 0
  };

  return (
    <Card className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-200 shadow-lg animate-fade-in mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5 text-yellow-600" />
          Painel de Recompensas
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* RadCoins Totais */}
          <div className="bg-white/80 p-4 rounded-lg text-center hover:bg-white transition-colors">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Wallet className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-600">RadCoins</span>
            </div>
            <div className="text-2xl font-bold text-yellow-700">
              {rewardsSummary.totalRadCoins.toLocaleString()}
            </div>
          </div>

          {/* Streak Atual */}
          <div className="bg-white/80 p-4 rounded-lg text-center hover:bg-white transition-colors">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Zap className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Streak</span>
            </div>
            <div className="text-2xl font-bold text-orange-700">
              {rewardsSummary.currentStreak}
            </div>
            {rewardsSummary.currentStreak >= 7 && (
              <Badge className="mt-1 bg-orange-500/20 text-orange-700 border-orange-300">
                Em Chamas! 🔥
              </Badge>
            )}
          </div>

          {/* Conquistas */}
          <div className="bg-white/80 p-4 rounded-lg text-center hover:bg-white transition-colors">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Award className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Conquistas</span>
            </div>
            <div className="text-2xl font-bold text-purple-700">
              {rewardsSummary.recentAchievements}
            </div>
            <span className="text-xs text-gray-500">Recentes</span>
          </div>

          {/* Performance */}
          <div className="bg-white/80 p-4 rounded-lg text-center hover:bg-white transition-colors">
            <div className="flex items-center justify-center gap-1 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Pontos</span>
            </div>
            <div className="text-2xl font-bold text-green-700">
              {(profile?.total_points || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Resumo Rápido */}
        <div className="mt-4 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-cyan-600" />
            <span className="text-sm font-semibold text-cyan-700">Status da Temporada</span>
          </div>
          <p className="text-sm text-cyan-800">
            Você está {profile?.total_points && profile.total_points > 1000 ? "entre os top jogadores" : "progredindo bem"} nesta temporada!
            {rewardsSummary.currentStreak >= 3 && " Mantenha sua sequência ativa para bônus extras."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
