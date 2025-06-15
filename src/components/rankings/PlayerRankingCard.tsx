
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Target, Zap, Star } from "lucide-react";

type PlayerData = {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  total_points: number;
  rank: number;
};

type Props = {
  player: PlayerData;
  isCurrentUser?: boolean;
  onClick?: () => void;
};

export function PlayerRankingCard({ player, isCurrentUser = false, onClick }: Props) {
  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Trophy size={20} className="text-yellow-500" />;
    if (rank <= 10) return <Star size={20} className="text-cyan-500" />;
    return <Target size={20} className="text-gray-400" />;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
    if (rank <= 3) return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
    if (rank <= 10) return "bg-gradient-to-r from-cyan-400 to-cyan-600 text-white";
    return "bg-gradient-to-r from-gray-600 to-gray-700 text-white";
  };

  const getPlayerLevel = (points: number) => {
    if (points >= 5000) return { level: "Expert", color: "bg-purple-500" };
    if (points >= 2000) return { level: "Especialista", color: "bg-blue-500" };
    if (points >= 500) return { level: "Intermediário", color: "bg-green-500" };
    return { level: "Iniciante", color: "bg-gray-500" };
  };

  const playerLevel = getPlayerLevel(player.total_points);

  return (
    <div 
      className={`w-full rounded-xl p-4 border transition-all duration-200 hover:scale-105 cursor-pointer animate-fade-in ${
        isCurrentUser 
          ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-300 shadow-lg ring-2 ring-cyan-200' 
          : 'bg-white/90 border-gray-200 hover:shadow-lg'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Ranking Position */}
        <div className="flex flex-col items-center min-w-[60px]">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-lg ${getRankBadgeColor(player.rank)}`}>
            #{player.rank}
          </div>
          <div className="mt-1">
            {getRankIcon(player.rank)}
          </div>
        </div>

        {/* Player Info */}
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="w-12 h-12 border-2 border-cyan-200">
            <AvatarImage src={player.avatar_url} />
            <AvatarFallback>{player.full_name?.[0] || player.username?.[0] || "J"}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800 text-lg">
                {player.full_name || player.username || "Jogador"}
              </span>
              {isCurrentUser && (
                <Badge variant="outline" className="text-xs bg-cyan-100 text-cyan-700 border-cyan-300">
                  Você
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <Badge className={`text-xs ${playerLevel.color} text-white`}>
                {playerLevel.level}
              </Badge>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <Zap size={14} />
                <span>{player.total_points} pontos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="hidden md:flex flex-col items-end text-right">
          <div className="text-sm text-gray-500">Performance</div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((player.total_points / 5000) * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs text-cyan-600 font-semibold">
              {Math.min(Math.round((player.total_points / 5000) * 100), 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
