
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlayerRankingCard } from "./PlayerRankingCard";
import { ChevronDown, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface PublicRankingListProps {
  rankings: any[];
  userSearchResult: any;
  showUserPosition: boolean;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  currentFilter: string;
}

export function PublicRankingList({
  rankings,
  userSearchResult,
  showUserPosition,
  hasMore,
  loading,
  onLoadMore,
  currentFilter
}: PublicRankingListProps) {
  const { user } = useAuth();
  const userPositionRef = useRef<HTMLDivElement>(null);

  // Scroll to user position when found
  useEffect(() => {
    if (showUserPosition && userSearchResult && userPositionRef.current) {
      userPositionRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [showUserPosition, userSearchResult]);

  const getFilterTitle = () => {
    switch (currentFilter) {
      case 'weekly': return 'Top Jogadores - Últimos 7 Dias';
      case 'monthly': return 'Top Jogadores - Últimos 30 Dias';
      case 'accuracy': return 'Top Jogadores - Maior Precisão';
      case 'cases': return 'Top Jogadores - Casos Resolvidos';
      default: return 'Top Jogadores - Ranking Global';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-xl text-white flex items-center gap-2">
          <Users size={24} className="text-cyan-400" />
          {getFilterTitle()}
        </h2>
        <div className="text-cyan-100 text-sm">
          Mostrando {rankings.length} jogadores
        </div>
      </div>

      {/* Rankings List */}
      <div className="space-y-3">
        {rankings.length === 0 ? (
          <div className="text-center text-cyan-400 py-8">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Nenhum jogador encontrado.</p>
            <p className="text-sm opacity-75 mt-2">
              Tente ajustar os filtros ou termo de busca.
            </p>
          </div>
        ) : (
          rankings.map((player, index) => {
            const isUserPosition = userSearchResult && player.id === userSearchResult.id;
            const isCurrentUser = user?.id === player.id;
            
            return (
              <div
                key={player.id}
                ref={isUserPosition ? userPositionRef : undefined}
                className={`transition-all duration-300 ${
                  isUserPosition ? 'ring-2 ring-cyan-400 ring-opacity-60 animate-pulse' : ''
                }`}
              >
                <PlayerRankingCard 
                  player={player}
                  isCurrentUser={isCurrentUser}
                  onClick={() => {
                    console.log("Ver perfil do jogador", player.id);
                  }}
                />
              </div>
            );
          })
        )}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={onLoadMore}
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-600 text-white flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Carregando...
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Carregar Mais Jogadores
              </>
            )}
          </Button>
        </div>
      )}

      {/* End of List Message */}
      {!hasMore && rankings.length > 0 && (
        <div className="text-center text-cyan-400 py-6">
          <p className="text-sm opacity-75">
            Fim da lista • {rankings.length} jogadores mostrados
          </p>
        </div>
      )}
    </div>
  );
}
