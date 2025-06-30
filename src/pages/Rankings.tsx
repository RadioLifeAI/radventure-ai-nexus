
import React, { useState, useEffect } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { PodiumDisplay } from "@/components/rankings/PodiumDisplay";
import { RankingFilters } from "@/components/rankings/RankingFilters";
import { MyRankingCard } from "@/components/rankings/MyRankingCard";
import { SeasonSelector } from "@/components/rankings/SeasonSelector";
import { IntegratedRewardsPanel } from "@/components/rankings/IntegratedRewardsPanel";
import { AnalyticsInsights } from "@/components/rankings/AnalyticsInsights";
import { UserPositionFinder } from "@/components/rankings/UserPositionFinder";
import { PublicRankingList } from "@/components/rankings/PublicRankingList";
import { Trophy } from "lucide-react";
import { useSeasonRankings } from "@/hooks/useSeasonRankings";
import { usePublicRankings } from "@/hooks/usePublicRankings";
import { useAuth } from "@/hooks/useAuth";

type FilterType = 'global' | 'weekly' | 'monthly' | 'accuracy' | 'cases';

export default function Rankings() {
  const { user } = useAuth();
  const {
    filteredRankings,
    userRank,
    loading,
    currentFilter,
    currentSeason,
    seasons,
    changeSeason,
    getCurrentSeasonInfo,
    applyFilter
  } = useSeasonRankings();

  const {
    paginatedRankings,
    userSearchResult,
    showUserPosition,
    searchQuery,
    pagination,
    searchUser,
    goToMyPosition,
    resetSearch,
    loadMore,
    totalPlayers,
    currentUserRank
  } = usePublicRankings();

  const handleFilterChange = (filter: FilterType) => {
    applyFilter(filter);
    resetSearch(); // Reset search when filter changes
  };

  // Top 3 for podium (always from filteredRankings, not paginated)
  const topThree = filteredRankings.slice(0, 3);
  
  // Criar dados para MyRankingCard
  const currentUserRanking = user ? filteredRankings.find(r => r.id === user.id) : null;
  const userStatsForCard = currentUserRanking ? {
    ...currentUserRanking,
    casesResolved: currentUserRanking.casesResolved || 0,
    accuracy: currentUserRanking.accuracy || 0,
    streak: currentUserRanking.current_streak || 0
  } : null;

  const getFilterDescription = () => {
    const seasonInfo = getCurrentSeasonInfo();
    const baseDesc = (() => {
      switch (currentFilter) {
        case 'weekly': return 'Pontos dos últimos 7 dias';
        case 'monthly': return 'Pontos dos últimos 30 dias';
        case 'accuracy': return 'Precisão (mín. 10 casos)';
        case 'cases': return 'Número de casos resolvidos';
        default: return 'Pontuação total de todos os tempos';
      }
    })();
    
    return `${baseDesc} - ${seasonInfo.name}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      <main className="flex-1 flex flex-col px-2 md:px-16 pt-4 pb-10">
        <div className="max-w-4xl mx-auto w-full">
          {/* Header Section */}
          <h1 className="font-extrabold text-3xl mb-2 flex items-center gap-3 animate-fade-in">
            <Trophy className="text-yellow-400" size={36} />
            Ranking de Jogadores
          </h1>
          <p className="mb-6 text-cyan-100 text-lg">
            {getFilterDescription()}
          </p>

          {/* Pódio Top 3 - Sempre no topo */}
          {loading ? (
            <div className="text-cyan-400 text-center py-8 animate-fade-in">
              Carregando ranking...
            </div>
          ) : (
            topThree.length > 0 && <PodiumDisplay topPlayers={topThree} />
          )}

          {/* Filtros de Ranking */}
          <RankingFilters 
            activeFilter={currentFilter} 
            onFilterChange={handleFilterChange} 
          />

          {/* Meu Ranking */}
          {userStatsForCard && (
            <MyRankingCard 
              userStats={userStatsForCard}
              onViewDetails={() => {
                console.log("Ver estatísticas detalhadas");
              }}
            />
          )}

          {/* Seletor de Temporadas */}
          <SeasonSelector 
            seasons={seasons}
            currentSeason={currentSeason}
            onSeasonChange={changeSeason}
          />

          {/* Painel de Recompensas Integrado */}
          <IntegratedRewardsPanel />

          {/* Analytics e Insights */}
          <AnalyticsInsights />

          {/* Busca de Usuários */}
          <UserPositionFinder 
            onSearch={searchUser}
            onGoToMyPosition={goToMyPosition}
            onReset={resetSearch}
            searchQuery={searchQuery}
            userSearchResult={userSearchResult}
            currentUserRank={currentUserRank}
            totalPlayers={totalPlayers}
          />

          {/* Lista Pública Completa de Rankings */}
          <PublicRankingList 
            rankings={paginatedRankings}
            userSearchResult={userSearchResult}
            showUserPosition={showUserPosition}
            hasMore={pagination.hasMore}
            loading={loading}
            onLoadMore={loadMore}
            currentFilter={currentFilter}
          />
        </div>
      </main>
    </div>
  );
}
