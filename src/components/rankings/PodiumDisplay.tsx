
import React from "react";
import { Trophy, Crown, Medal, Star } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type TopPlayer = {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  total_points: number;
  rank: number;
};

type Props = {
  topPlayers: TopPlayer[];
};

export function PodiumDisplay({ topPlayers }: Props) {
  const [first, second, third] = topPlayers;

  const getPodiumIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown size={32} className="text-yellow-400" />;
      case 2: return <Trophy size={28} className="text-gray-400" />;
      case 3: return <Medal size={24} className="text-amber-600" />;
      default: return <Star size={20} className="text-cyan-400" />;
    }
  };

  const getPodiumHeight = (position: number) => {
    switch (position) {
      case 1: return "h-32";
      case 2: return "h-24";
      case 3: return "h-20";
      default: return "h-16";
    }
  };

  const getPodiumColors = (position: number) => {
    switch (position) {
      case 1: return "from-yellow-400 via-yellow-500 to-yellow-600";
      case 2: return "from-gray-300 via-gray-400 to-gray-500";
      case 3: return "from-amber-500 via-amber-600 to-amber-700";
      default: return "from-cyan-400 via-cyan-500 to-cyan-600";
    }
  };

  if (topPlayers.length === 0) {
    return (
      <div className="w-full text-center text-cyan-400 py-8">
        Nenhum ranking disponível ainda
      </div>
    );
  }

  return (
    <div className="w-full flex items-end justify-center gap-4 mb-8 animate-fade-in">
      {/* 2º Lugar */}
      {second && (
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center mb-3">
            <Avatar className="w-16 h-16 mb-2 border-4 border-gray-300 shadow-lg">
              <AvatarImage src={second.avatar_url} />
              <AvatarFallback>{second.full_name?.[0] || second.username?.[0] || "J"}</AvatarFallback>
            </Avatar>
            <span className="font-bold text-white text-sm">{second.full_name || second.username}</span>
            <span className="text-cyan-200 text-xs">{second.total_points} pontos</span>
          </div>
          <div className={`${getPodiumHeight(2)} ${getPodiumColors(2)} bg-gradient-to-t w-20 rounded-t-lg flex flex-col items-center justify-start pt-2 shadow-xl relative`}>
            <div className="absolute -top-4 bg-white rounded-full p-1 shadow-lg">
              {getPodiumIcon(2)}
            </div>
            <span className="text-white font-bold text-lg mt-4">2º</span>
          </div>
        </div>
      )}

      {/* 1º Lugar */}
      {first && (
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center mb-3">
            <Avatar className="w-20 h-20 mb-2 border-4 border-yellow-400 shadow-xl">
              <AvatarImage src={first.avatar_url} />
              <AvatarFallback>{first.full_name?.[0] || first.username?.[0] || "J"}</AvatarFallback>
            </Avatar>
            <span className="font-bold text-white text-base">{first.full_name || first.username}</span>
            <span className="text-yellow-200 text-sm">{first.total_points} pontos</span>
          </div>
          <div className={`${getPodiumHeight(1)} ${getPodiumColors(1)} bg-gradient-to-t w-24 rounded-t-lg flex flex-col items-center justify-start pt-2 shadow-xl relative animate-pulse`}>
            <div className="absolute -top-6 bg-white rounded-full p-2 shadow-xl">
              {getPodiumIcon(1)}
            </div>
            <span className="text-white font-bold text-xl mt-6">1º</span>
          </div>
        </div>
      )}

      {/* 3º Lugar */}
      {third && (
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center mb-3">
            <Avatar className="w-14 h-14 mb-2 border-4 border-amber-500 shadow-lg">
              <AvatarImage src={third.avatar_url} />
              <AvatarFallback>{third.full_name?.[0] || third.username?.[0] || "J"}</AvatarFallback>
            </Avatar>
            <span className="font-bold text-white text-sm">{third.full_name || third.username}</span>
            <span className="text-amber-200 text-xs">{third.total_points} pontos</span>
          </div>
          <div className={`${getPodiumHeight(3)} ${getPodiumColors(3)} bg-gradient-to-t w-18 rounded-t-lg flex flex-col items-center justify-start pt-2 shadow-xl relative`}>
            <div className="absolute -top-3 bg-white rounded-full p-1 shadow-lg">
              {getPodiumIcon(3)}
            </div>
            <span className="text-white font-bold text-lg mt-3">3º</span>
          </div>
        </div>
      )}
    </div>
  );
}
