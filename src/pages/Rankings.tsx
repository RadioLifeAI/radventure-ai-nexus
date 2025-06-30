
import React, { useState, useEffect } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { PodiumDisplay } from "@/components/rankings/PodiumDisplay";
import { PlayerRankingCard } from "@/components/rankings/PlayerRankingCard";
import { RankingFilters } from "@/components/rankings/RankingFilters";
import { MyRankingCard } from "@/components/rankings/MyRankingCard";
import { Trophy } from "lucide-react";
import { useUserRankings } from "@/hooks/useUserRankings";
import { useAuth } from "@/hooks/useAuth";

type FilterType = 'global' | 'weekly' | 'monthly' | 'accuracy' | 'cases';

export default function Rankings() {
  const { user } = useAuth();
  const {
    filteredRankings,
    userRank,
    loading,
    currentFilter,
    applyFilter
  } = useUserRankings();

  const handleFilterChange = (filter: FilterType) => {
    applyFilter(filter);
  };

  const topThree = filteredRankings.slice(0, 3);
  const remainingPlayers = filteredRankings.slice(3);
  
  // Criar dados para MyRankingCard
  const currentUserRanking = user ? filteredRankings.find(r => r.id === user.id) : null;
  const userStatsForCard = currentUserRanking ? {
    ...currentUserRanking,
    casesResolved: currentUserRanking.casesResolved || 0,
    accuracy: currentUserRanking.accuracy || 0,
    streak: currentUserRanking.current_streak || 0
  } : null;

  const getFilterDescription = () => {
    switch (currentFilter) {
      case 'weekly': return 'Pontos dos últimos 7 dias';
      case 'monthly': return 'Pontos dos últimos 30 dias';
      case 'accuracy': return 'Precisão (mín. 10 casos)';
      case 'cases': return 'Número de casos resolvidos';
      default: return 'Pontuação total de todos os tempos';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      <main className="flex-1 flex flex-col px-2 md:px-16 pt-4 pb-10">
        <div className="max-w-4xl mx-auto w-full">
          <h1 className="font-extrabold text-3xl mb-2 flex items-center gap-3 animate-fade-in">
            <Trophy className="text-yellow-400" size={36} />
            Ranking de Jogadores
          </h1>
          <p className="mb-6 text-cyan-100 text-lg">
            {getFilterDescription()}
          </p>

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

          {loading ? (
            <div className="text-cyan-400 text-center py-8 animate-fade-in">
              Carregando ranking...
            </div>
          ) : (
            <>
              {/* Pódio Top 3 */}
              {topThree.length > 0 && <PodiumDisplay topPlayers={topThree} />}

              {/* Lista dos demais jogadores */}
              <div className="space-y-3">
                <h2 className="font-bold text-xl text-white mb-4 flex items-center gap-2">
                  <Trophy size={24} className="text-cyan-400" />
                  {remainingPlayers.length > 0 ? "Demais Posições" : "Top Jogadores"}
                </h2>
                
                {filteredRankings.length === 0 ? (
                  <div className="text-center text-cyan-400 py-8">
                    <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Nenhum jogador encontrado para este filtro.</p>
                    <p className="text-sm opacity-75 mt-2">
                      Tente um filtro diferente ou resolva alguns casos para aparecer no ranking!
                    </p>
                  </div>
                ) : remainingPlayers.length === 0 && topThree.length > 0 ? (
                  <div className="text-center text-cyan-400 py-4">
                    <p>Apenas os primeiros colocados disponíveis no momento.</p>
                  </div>
                ) : (
                  remainingPlayers.map((player) => (
                    <PlayerRankingCard 
                      key={player.id} 
                      player={player}
                      isCurrentUser={user?.id === player.id}
                      onClick={() => {
                        console.log("Ver perfil do jogador", player.id);
                      }}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
