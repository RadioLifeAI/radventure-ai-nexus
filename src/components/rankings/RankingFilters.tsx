
import React from "react";
import { Button } from "@/components/ui/button";
import { Filter, Trophy, Calendar, Target, TrendingUp, Clock } from "lucide-react";

type FilterType = 'global' | 'weekly' | 'monthly' | 'accuracy' | 'cases';

type Props = {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
};

export function RankingFilters({ activeFilter, onFilterChange }: Props) {
  const filters = [
    { 
      key: 'global' as FilterType, 
      label: 'Global', 
      icon: Trophy, 
      color: 'from-yellow-400 to-yellow-600',
      description: 'Pontuação total'
    },
    { 
      key: 'weekly' as FilterType, 
      label: 'Semanal', 
      icon: Calendar, 
      color: 'from-green-400 to-green-600',
      description: 'Últimos 7 dias'
    },
    { 
      key: 'monthly' as FilterType, 
      label: 'Mensal', 
      icon: Clock, 
      color: 'from-blue-400 to-blue-600',
      description: 'Últimos 30 dias'
    },
    { 
      key: 'accuracy' as FilterType, 
      label: 'Precisão', 
      icon: Target, 
      color: 'from-purple-400 to-purple-600',
      description: 'Taxa de acerto'
    },
    { 
      key: 'cases' as FilterType, 
      label: 'Casos', 
      icon: TrendingUp, 
      color: 'from-cyan-400 to-cyan-600',
      description: 'Casos resolvidos'
    },
  ];

  return (
    <div className="w-full flex flex-wrap gap-3 items-center mb-6 animate-fade-in">
      <div className="flex items-center gap-2 text-white font-semibold">
        <Filter size={20} className="text-cyan-400" />
        <span>Filtrar por:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.key;
          
          return (
            <div key={filter.key} className="relative group">
              <Button
                size="sm"
                onClick={() => onFilterChange(filter.key)}
                className={`transition-all duration-200 border-none shadow-lg hover:scale-105 ${
                  isActive 
                    ? `bg-gradient-to-r ${filter.color} text-white shadow-xl ring-2 ring-white/30` 
                    : 'bg-white/90 text-gray-700 hover:bg-white hover:shadow-xl'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-gray-600'} />
                <span className="ml-1 font-semibold">{filter.label}</span>
              </Button>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {filter.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
