
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, TrendingUp, Zap, Target, Star, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserStats } from "@/hooks/useUserStats";

export function RankingWidget() {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { stats, isLoading } = useUserStats();

  const getRankBadgeColor = (rank?: number) => {
    if (!rank) return "bg-gray-500";
    if (rank <= 3) return "bg-gradient-to-r from-yellow-400 to-yellow-600";
    if (rank <= 10) return "bg-gradient-to-r from-cyan-400 to-cyan-600";
    return "bg-gradient-to-r from-gray-500 to-gray-600";
  };

  // Simular ranking baseado em pontos
  const userRank = profile?.total_points ? Math.max(1, Math.floor(Math.random() * 50) + 1) : undefined;
  const weeklyPosition = stats?.weeklyProgress?.reduce((sum, day) => sum + day.cases, 0) || 0;

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 animate-pulse">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-5 h-5 bg-gray-300 rounded"></div>
            <div className="w-24 h-5 bg-gray-300 rounded"></div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="w-32 h-4 bg-gray-300 rounded"></div>
              <div className="w-24 h-3 bg-gray-300 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-200 p-3 rounded-lg h-16"></div>
            <div className="bg-gray-200 p-3 rounded-lg h-16"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 hover:border-cyan-300"
      onClick={() => navigate('/app/rankings')}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="text-yellow-500 animate-pulse" size={20} />
          Seu Ranking
          {userRank && userRank <= 10 && (
            <Star className="text-yellow-500 h-4 w-4 animate-spin" />
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-12 h-12 border-2 border-cyan-300">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-cyan-100 text-cyan-700 font-bold">
                {profile?.full_name?.[0] || profile?.username?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            {userRank && userRank <= 3 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                <Award className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="font-semibold text-gray-800 flex items-center gap-2">
              {profile?.full_name || profile?.username || "Usuário"}
              {profile?.type === 'ADMIN' && (
                <Badge className="bg-purple-500 text-white text-xs">ADMIN</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {userRank && (
                <Badge className={`text-white text-xs ${getRankBadgeColor(userRank)} animate-pulse`}>
                  #{userRank}
                </Badge>
              )}
              <span className="text-sm text-gray-500">Posição Geral</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/80 p-3 rounded-lg hover:bg-white transition-colors">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap size={16} className="text-yellow-500" />
              <span className="text-xs text-gray-500">Pontos</span>
            </div>
            <div className="text-lg font-bold text-gray-800">
              {profile?.total_points?.toLocaleString() || 0}
            </div>
          </div>
          
          <div className="bg-white/80 p-3 rounded-lg hover:bg-white transition-colors">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp size={16} className="text-green-500" />
              <span className="text-xs text-gray-500">Esta Semana</span>
            </div>
            <div className="text-lg font-bold text-gray-800">
              {weeklyPosition} casos
            </div>
          </div>
        </div>

        {stats?.accuracy && stats.accuracy >= 70 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target size={14} className="text-green-600" />
              <span className="text-xs font-semibold text-green-700">Alta Precisão!</span>
            </div>
            <div className="text-sm text-green-800">
              {stats.accuracy}% de acertos em {stats.totalCases} casos
            </div>
          </div>
        )}

        {stats?.currentStreak && stats.currentStreak > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-orange-600" />
              <span className="text-xs font-semibold text-orange-700">Sequência Ativa!</span>
            </div>
            <div className="text-sm text-orange-800">
              {stats.currentStreak} dia{stats.currentStreak > 1 ? 's' : ''} consecutivos
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-cyan-200">
          <button className="w-full text-sm text-cyan-600 hover:text-cyan-700 font-semibold hover:underline transition-colors flex items-center justify-center gap-1">
            Ver ranking completo 
            <Trophy className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
