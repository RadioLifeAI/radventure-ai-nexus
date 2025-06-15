
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, TrendingUp, Zap, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = {
  userRank?: number;
  totalPoints?: number;
  weeklyPosition?: number;
  recentAchievement?: string;
  avatar_url?: string;
  full_name?: string;
  username?: string;
};

export function RankingWidget({ 
  userRank, 
  totalPoints, 
  weeklyPosition, 
  recentAchievement,
  avatar_url,
  full_name,
  username 
}: Props) {
  const navigate = useNavigate();

  const getRankBadgeColor = (rank?: number) => {
    if (!rank) return "bg-gray-400";
    if (rank <= 3) return "bg-gradient-to-r from-yellow-400 to-yellow-600";
    if (rank <= 10) return "bg-gradient-to-r from-cyan-400 to-cyan-600";
    return "bg-gradient-to-r from-gray-500 to-gray-600";
  };

  return (
    <Card 
      className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
      onClick={() => navigate('/rankings')}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="text-yellow-500" size={20} />
          Seu Ranking
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-cyan-300">
            <AvatarImage src={avatar_url} />
            <AvatarFallback className="bg-cyan-100 text-cyan-700 font-bold">
              {full_name?.[0] || username?.[0] || "J"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="font-semibold text-gray-800">
              {full_name || username || "Jogador"}
            </div>
            <div className="flex items-center gap-2">
              {userRank && (
                <Badge className={`text-white text-xs ${getRankBadgeColor(userRank)}`}>
                  #{userRank}
                </Badge>
              )}
              <span className="text-sm text-gray-500">Posição Geral</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/80 p-3 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap size={16} className="text-yellow-500" />
              <span className="text-xs text-gray-500">Pontos</span>
            </div>
            <div className="text-lg font-bold text-gray-800">{totalPoints || 0}</div>
          </div>
          
          <div className="bg-white/80 p-3 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp size={16} className="text-green-500" />
              <span className="text-xs text-gray-500">Semanal</span>
            </div>
            <div className="text-lg font-bold text-gray-800">#{weeklyPosition || 'N/A'}</div>
          </div>
        </div>

        {recentAchievement && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target size={14} className="text-yellow-600" />
              <span className="text-xs font-semibold text-yellow-700">Nova Conquista!</span>
            </div>
            <div className="text-sm text-yellow-800">{recentAchievement}</div>
          </div>
        )}

        <div className="pt-2 border-t border-cyan-200">
          <button className="w-full text-sm text-cyan-600 hover:text-cyan-700 font-semibold hover:underline">
            Ver ranking completo →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
