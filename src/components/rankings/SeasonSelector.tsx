
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, Clock, Star, Infinity } from "lucide-react";
import { SeasonType, SeasonInfo } from "@/hooks/useSeasonRankings";

interface SeasonSelectorProps {
  seasons: SeasonInfo[];
  currentSeason: SeasonType;
  onSeasonChange: (seasonId: SeasonType) => void;
}

export function SeasonSelector({ seasons, currentSeason, onSeasonChange }: SeasonSelectorProps) {
  const getSeasonIcon = (seasonId: SeasonType) => {
    switch (seasonId) {
      case 'current': return <Trophy className="h-4 w-4" />;
      case 'monthly': return <Calendar className="h-4 w-4" />;
      case 'quarterly': return <Clock className="h-4 w-4" />;
      case 'yearly': return <Star className="h-4 w-4" />;
      case 'all-time': return <Infinity className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const getSeasonColor = (seasonId: SeasonType) => {
    switch (seasonId) {
      case 'current': return 'from-green-400 to-green-600';
      case 'monthly': return 'from-blue-400 to-blue-600';
      case 'quarterly': return 'from-purple-400 to-purple-600';
      case 'yearly': return 'from-orange-400 to-orange-600';
      case 'all-time': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="w-full mb-6 animate-fade-in">
      <div className="flex items-center gap-2 text-white font-semibold mb-3">
        <Calendar className="h-5 w-5 text-cyan-400" />
        <span>Temporada:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {seasons.map((season) => {
          const isActive = currentSeason === season.id;
          const Icon = () => getSeasonIcon(season.id);
          
          return (
            <div key={season.id} className="relative group">
              <Button
                size="sm"
                onClick={() => onSeasonChange(season.id)}
                className={`transition-all duration-200 border-none shadow-lg hover:scale-105 ${
                  isActive 
                    ? `bg-gradient-to-r ${getSeasonColor(season.id)} text-white shadow-xl ring-2 ring-white/30` 
                    : 'bg-white/90 text-gray-700 hover:bg-white hover:shadow-xl'
                }`}
              >
                <Icon />
                <span className="ml-1 font-semibold">{season.name}</span>
              </Button>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {season.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
