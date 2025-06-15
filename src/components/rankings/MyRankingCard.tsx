
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, TrendingUp, Target, Zap, Star } from "lucide-react";

type UserStats = {
  rank: number;
  total_points: number;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  // Mock data - seria buscado da API
  casesResolved?: number;
  accuracy?: number;
  streak?: number;
};

type Props = {
  userStats: UserStats | null;
  onViewDetails?: () => void;
};

export function MyRankingCard({ userStats, onViewDetails }: Props) {
  if (!userStats) {
    return (
      <Card className="w-full bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 mb-6">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Trophy size={32} className="mx-auto mb-2 text-gray-400" />
            <p>Você ainda não está no ranking. Resolva alguns casos para aparecer aqui!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPositionText = (rank: number) => {
    if (rank === 1) return { text: "🥇 Você está em 1º lugar!", color: "text-yellow-600" };
    if (rank <= 3) return { text: `🏆 Você está no Top 3! (#${rank})`, color: "text-yellow-600" };
    if (rank <= 10) return { text: `⭐ Você está no Top 10! (#${rank})`, color: "text-cyan-600" };
    return { text: `#${rank} no ranking`, color: "text-gray-600" };
  };

  const position = getPositionText(userStats.rank);

  return (
    <Card className="w-full bg-gradient-to-r from-cyan-50 via-blue-50 to-purple-50 border-2 border-cyan-200 shadow-lg mb-6 hover:shadow-xl transition-all duration-200 animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-4 border-cyan-300 shadow-lg">
              <AvatarImage src={userStats.avatar_url} />
              <AvatarFallback className="bg-cyan-100 text-cyan-700 font-bold text-lg">
                {userStats.full_name?.[0] || userStats.username?.[0] || "J"}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-xl text-gray-800">
                  {userStats.full_name || userStats.username || "Jogador"}
                </span>
                <Badge className="bg-cyan-100 text-cyan-700 border-cyan-300">
                  Você
                </Badge>
              </div>
              <p className={`font-semibold text-lg ${position.color}`}>
                {position.text}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={20} className="text-yellow-500" />
              <span className="text-2xl font-bold text-gray-800">{userStats.total_points}</span>
              <span className="text-gray-500">pontos</span>
            </div>
            
            {onViewDetails && (
              <button 
                onClick={onViewDetails}
                className="text-sm text-cyan-600 hover:text-cyan-700 font-semibold hover:underline"
              >
                Ver estatísticas detalhadas →
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-cyan-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target size={16} className="text-green-500" />
              <span className="text-sm text-gray-500">Casos</span>
            </div>
            <span className="text-lg font-bold text-gray-800">{userStats.casesResolved || 0}</span>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp size={16} className="text-blue-500" />
              <span className="text-sm text-gray-500">Precisão</span>
            </div>
            <span className="text-lg font-bold text-gray-800">{userStats.accuracy || 0}%</span>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star size={16} className="text-purple-500" />
              <span className="text-sm text-gray-500">Sequência</span>
            </div>
            <span className="text-lg font-bold text-gray-800">{userStats.streak || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
