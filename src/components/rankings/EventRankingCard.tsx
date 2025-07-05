
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Target, Zap, Star, Clock } from "lucide-react";

type EventRanking = {
  rank: number;
  score: number;
  user_id: string;
  profiles?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
  radcoins_earned?: number;
  completion_time?: string;
};

type Props = {
  ranking: EventRanking;
  isCurrentUser?: boolean;
  onClick?: () => void;
};

export function EventRankingCard({ ranking, isCurrentUser = false, onClick }: Props) {
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

  const formatTime = (timeString?: string) => {
    if (!timeString) return "N/A";
    // Assuming time is in minutes
    const minutes = parseInt(timeString);
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  return (
    <div 
      className={`w-full rounded-xl p-3 md:p-4 border cursor-pointer relative ${
        isCurrentUser 
          ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-300 shadow-lg ring-2 ring-cyan-200' 
          : 'bg-white/90 border-gray-200 hover:shadow-lg'
      }`}
      onClick={onClick}
    >
      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Ranking Position - Top Right */}
        <div className="absolute top-2 right-2 flex flex-col items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm ${getRankBadgeColor(ranking.rank)}`}>
            #{ranking.rank}
          </div>
          <div className="mt-1">
            {getRankIcon(ranking.rank)}
          </div>
        </div>

        <div className="flex flex-col gap-3 pr-12">
          {/* Player Info */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-cyan-200 flex-shrink-0">
              <AvatarImage src={ranking.profiles?.avatar_url} />
              <AvatarFallback>{ranking.profiles?.full_name?.[0] || ranking.profiles?.username?.[0] || "J"}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800 text-sm truncate">
                  {ranking.profiles?.full_name || ranking.profiles?.username || "Jogador"}
                </span>
                {isCurrentUser && (
                  <Badge variant="outline" className="text-xs bg-cyan-100 text-cyan-700 border-cyan-300 flex-shrink-0">
                    Você
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-gray-500">
              <Zap size={12} />
              <span>{ranking.score} pts</span>
            </div>
            {ranking.radcoins_earned && (
              <div className="flex items-center gap-1 text-yellow-600">
                <Trophy size={12} />
                <span>{ranking.radcoins_earned} RC</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-cyan-600">
              <Clock size={12} />
              <span>{formatTime(ranking.completion_time)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center gap-4">
        {/* Ranking Position */}
        <div className="flex flex-col items-center min-w-[60px]">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-lg ${getRankBadgeColor(ranking.rank)}`}>
            #{ranking.rank}
          </div>
          <div className="mt-1">
            {getRankIcon(ranking.rank)}
          </div>
        </div>

        {/* Player Info */}
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="w-12 h-12 border-2 border-cyan-200">
            <AvatarImage src={ranking.profiles?.avatar_url} />
            <AvatarFallback>{ranking.profiles?.full_name?.[0] || ranking.profiles?.username?.[0] || "J"}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800 text-lg">
                {ranking.profiles?.full_name || ranking.profiles?.username || "Jogador"}
              </span>
              {isCurrentUser && (
                <Badge variant="outline" className="text-xs bg-cyan-100 text-cyan-700 border-cyan-300">
                  Você
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <Zap size={14} />
                <span>{ranking.score} pontos</span>
              </div>
              {ranking.radcoins_earned && (
                <div className="flex items-center gap-1 text-yellow-600 text-sm">
                  <Trophy size={14} />
                  <span>{ranking.radcoins_earned} RC</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="flex flex-col items-end text-right">
          <div className="text-sm text-gray-500">Tempo</div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-cyan-600" />
            <span className="text-sm text-cyan-600 font-semibold">
              {formatTime(ranking.completion_time)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
