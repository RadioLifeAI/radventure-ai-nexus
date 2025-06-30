
import { useState, useEffect } from "react";
import { useUserRankings } from "./useUserRankings";

export type SeasonType = 'current' | 'monthly' | 'quarterly' | 'yearly' | 'all-time';

export interface SeasonInfo {
  id: SeasonType;
  name: string; 
  description: string;
  startDate?: Date;
  endDate?: Date;
}

export function useSeasonRankings() {
  const { globalRankings, filteredRankings, userRank, loading, currentFilter, applyFilter } = useUserRankings();
  const [currentSeason, setCurrentSeason] = useState<SeasonType>('current');

  const seasons: SeasonInfo[] = [
    {
      id: 'current',
      name: 'Temporada Atual',
      description: 'Rankings da temporada em andamento'
    },
    {
      id: 'monthly',
      name: 'Mensal',
      description: 'Rankings dos últimos 30 dias'
    },
    {
      id: 'quarterly',
      name: 'Trimestral',
      description: 'Rankings dos últimos 3 meses'
    },
    {
      id: 'yearly',
      name: 'Anual',
      description: 'Rankings do último ano'
    },
    {
      id: 'all-time',
      name: 'Todos os Tempos',
      description: 'Rankings históricos completos'
    }
  ];

  const changeSeason = (seasonId: SeasonType) => {
    setCurrentSeason(seasonId);
    
    // Mapear temporada para filtro existente
    switch (seasonId) {
      case 'monthly':
        applyFilter('monthly');
        break;
      case 'current':
      case 'quarterly':
      case 'yearly':
        applyFilter('weekly'); // Usar weekly como base temporária
        break;
      case 'all-time':
        applyFilter('global');
        break;
    }
  };

  const getCurrentSeasonInfo = () => {
    return seasons.find(s => s.id === currentSeason) || seasons[0];
  };

  return {
    globalRankings,
    filteredRankings,
    userRank,
    loading,
    currentFilter,
    currentSeason,
    seasons,
    changeSeason,
    getCurrentSeasonInfo,
    applyFilter
  };
}
