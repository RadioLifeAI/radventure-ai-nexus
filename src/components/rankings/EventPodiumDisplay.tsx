import React from "react";
import { Crown, Trophy, Medal, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Champion {
  user: {
    full_name: string;
    username: string;
    avatar_url: string;
    medical_specialty: string;
  };
  totalVictories: number;
  totalRadCoins: number;
  victories: Array<{
    event: {
      name: string;
      scheduled_start: string;
    };
  }>;
}

interface EventPodiumDisplayProps {
  topChampions: Champion[];
}

export function EventPodiumDisplay({ topChampions }: EventPodiumDisplayProps) {
  const [first, second, third] = topChampions;

  const getPodiumIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown size={40} className="text-yellow-400 drop-shadow-lg" />;
      case 2: return <Trophy size={36} className="text-gray-400 drop-shadow-lg" />;
      case 3: return <Medal size={32} className="text-amber-600 drop-shadow-lg" />;
      default: return <Star size={28} className="text-cyan-400 drop-shadow-lg" />;
    }
  };

  const getPodiumHeight = (position: number) => {
    switch (position) {
      case 1: return "h-40";
      case 2: return "h-32";
      case 3: return "h-28";
      default: return "h-24";
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

  const getCardColors = (position: number) => {
    switch (position) {
      case 1: return "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-400 shadow-yellow-300/60";
      case 2: return "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-400 shadow-gray-300/60";
      case 3: return "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-400 shadow-amber-300/60";
      default: return "bg-white border-gray-300";
    }
  };

  const getAvatarBorder = (position: number) => {
    switch (position) {
      case 1: return "border-4 border-yellow-400 shadow-xl";
      case 2: return "border-4 border-gray-400 shadow-lg";
      case 3: return "border-4 border-amber-500 shadow-lg";
      default: return "border-2 border-gray-300";
    }
  };

  const renderChampion = (champion: Champion, position: number, animationDelay: string) => {
    if (!champion) return null;

    return (
      <div 
        className={`flex flex-col items-center animate-fade-in hover:scale-105 transition-all duration-300 ${animationDelay}`}
        style={{ animationDelay }}
      >
        {/* Avatar e informações do usuário */}
        <div className="flex flex-col items-center mb-4 relative">
          <div className="relative mb-4">
            {champion.user.avatar_url ? (
              <img 
                src={champion.user.avatar_url} 
                alt="Avatar"
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ${getAvatarBorder(position)}`}
              />
            ) : (
              <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold ${getAvatarBorder(position)}`}>
                {champion.user.full_name?.charAt(0) || champion.user.username?.charAt(0) || '?'}
              </div>
            )}
            
            {/* Ícone da posição */}
            <div className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-xl">
              {getPodiumIcon(position)}
            </div>
            
            {/* Pulse animation para o primeiro lugar */}
            {position === 1 && (
              <div className="absolute inset-0 rounded-full border-4 border-yellow-400 animate-pulse opacity-75"></div>
            )}
          </div>
          
          <div className="text-center">
            <h3 className="font-bold text-lg text-gray-900 mb-1">
              {champion.user.full_name || champion.user.username}
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              {champion.user.medical_specialty}
            </p>
            
            {/* Badges de estatísticas */}
            <div className="flex flex-col gap-2 items-center">
              <Badge className="bg-yellow-200 text-yellow-800 border-yellow-400 px-3 py-1 font-semibold">
                <Crown className="h-3 w-3 mr-1" />
                {champion.totalVictories} vitória{champion.totalVictories !== 1 ? 's' : ''}
              </Badge>
              <Badge className="bg-green-200 text-green-800 border-green-400 px-3 py-1 font-semibold">
                {champion.totalRadCoins.toLocaleString()} RadCoins
              </Badge>
            </div>
          </div>
        </div>

        {/* Pódio */}
        <div className={`${getPodiumHeight(position)} ${getPodiumColors(position)} bg-gradient-to-t w-24 sm:w-28 rounded-t-xl flex flex-col items-center justify-start pt-2 sm:pt-3 shadow-2xl relative overflow-hidden`}>
          {/* Efeito de brilho */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-30"></div>
          
          {/* Número da posição */}
          <span className="text-white font-bold text-2xl drop-shadow-2xl relative z-10" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            {position}º
          </span>
          
          {/* Efeito especial para o primeiro lugar */}
          {position === 1 && (
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="w-32 h-8 bg-gradient-to-r from-transparent via-yellow-300/50 to-transparent blur-sm"></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (topChampions.length === 0) {
    return (
      <div className="w-full text-center text-gray-500 py-12">
        <Crown className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <p>Nenhum campeão histórico encontrado</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Pódio Principal */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-6 sm:gap-8 mb-8 sm:mb-12 px-4">
        {/* 2º Lugar */}
        {renderChampion(second, 2, "0.2s")}
        
        {/* 1º Lugar (centro) */}
        {renderChampion(first, 1, "0s")}
        
        {/* 3º Lugar */}
        {renderChampion(third, 3, "0.4s")}
      </div>

      {/* Detalhes dos Campeões */}
      <div className="grid gap-6 md:grid-cols-3">
        {topChampions.slice(0, 3).map((champion, index) => (
          <div 
            key={champion.user.full_name + index} 
            className={`${getCardColors(index + 1)} rounded-xl p-6 shadow-lg border-2 hover:shadow-2xl transition-all duration-300 hover:scale-105`}
          >
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getPodiumIcon(index + 1)}
                <span className="text-2xl font-bold text-gray-900">#{index + 1}</span>
              </div>
              <h4 className="font-bold text-lg text-gray-900">
                {champion.user.full_name || champion.user.username}
              </h4>
            </div>

            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-gray-700 mb-2 font-medium">Últimas Vitórias:</p>
                <div className="space-y-1">
                  {champion.victories.slice(0, 2).map((victory, vIndex) => (
                    <div key={vIndex} className="flex items-center justify-between text-xs bg-white/80 rounded-lg p-2 border border-white/40">
                      <span className="text-gray-800 truncate flex-1 mr-2 font-medium">
                        {victory.event.name}
                      </span>
                      <span className="text-gray-600 whitespace-nowrap font-medium">
                        {formatDistanceToNow(new Date(victory.event.scheduled_start), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </span>
                    </div>
                  ))}
                  {champion.victories.length > 2 && (
                    <p className="text-xs text-gray-600 italic font-medium">
                      +{champion.victories.length - 2} outras vitórias
                    </p>
                  )}
                </div>
              </div>
              
              <div className="text-center pt-2">
                <Button size="sm" variant="outline" className="hover:scale-105 transition-transform border-gray-400 text-gray-800 hover:bg-gray-100 font-medium">
                  Ver Perfil Completo
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}