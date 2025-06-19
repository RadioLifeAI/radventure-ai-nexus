import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import HeaderNav from "@/components/HeaderNav";
import { PodiumDisplay } from "@/components/rankings/PodiumDisplay";
import { PlayerRankingCard } from "@/components/rankings/PlayerRankingCard";
import { RankingFilters } from "@/components/rankings/RankingFilters";
import { MyRankingCard } from "@/components/rankings/MyRankingCard";
import { Trophy } from "lucide-react";

type FilterType = 'global' | 'weekly' | 'monthly' | 'accuracy' | 'cases';

type PlayerData = {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  total_points: number;
  rank: number;
};

export default function Rankings() {
  const [rankings, setRankings] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('global');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchRankings();
  }, [activeFilter]);

  async function fetchCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setCurrentUser(profile);
    }
  }

  async function fetchRankings() {
    setLoading(true);
    
    // Por enquanto, apenas ranking global
    // TODO: Implementar filtros de weekly, monthly, accuracy, cases
    let query = supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, total_points")
      .order("total_points", { ascending: false })
      .limit(50);

    const { data, error } = await query;
    
    if (data) {
      // Adiciona ranking position
      const rankingsWithPosition = data.map((player, index) => ({
        ...player,
        rank: index + 1
      }));
      setRankings(rankingsWithPosition);
    }
    
    setLoading(false);
  }

  const topThree = rankings.slice(0, 3);
  const remainingPlayers = rankings.slice(3);
  
  // Encontra usuário atual no ranking
  const currentUserRanking = currentUser ? rankings.find(r => r.id === currentUser.id) : null;
  const userStats = currentUserRanking ? {
    ...currentUserRanking,
    casesResolved: 42, // Mock data
    accuracy: 78, // Mock data  
    streak: 5 // Mock data
  } : null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      <main className="flex-1 flex flex-col px-2 md:px-16 pt-4 pb-10">
        <div className="max-w-4xl mx-auto w-full">
          <h1 className="font-extrabold text-3xl mb-2 flex items-center gap-3 animate-fade-in">
            <Trophy className="text-yellow-400" size={36} />
            Ranking Geral de Jogadores
          </h1>
          <p className="mb-6 text-cyan-100 text-lg">
            Veja como você se compara com outros médicos da comunidade RadVenture!
          </p>

          <RankingFilters 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter} 
          />

          {/* Meu Ranking */}
          <MyRankingCard 
            userStats={userStats}
            onViewDetails={() => {
              // TODO: Abrir modal de estatísticas detalhadas
              console.log("Ver estatísticas detalhadas");
            }}
          />

          {loading ? (
            <div className="text-cyan-400 text-center py-8 animate-fade-in">
              Carregando ranking...
            </div>
          ) : (
            <>
              {/* Pódio Top 3 */}
              <PodiumDisplay topPlayers={topThree} />

              {/* Lista dos demais jogadores */}
              <div className="space-y-3">
                <h2 className="font-bold text-xl text-white mb-4 flex items-center gap-2">
                  <Trophy size={24} className="text-cyan-400" />
                  Demais Posições
                </h2>
                
                {remainingPlayers.length === 0 && rankings.length <= 3 ? (
                  <div className="text-center text-cyan-400 py-8">
                    {rankings.length === 0 
                      ? "Nenhum jogador encontrado." 
                      : "Apenas os primeiros colocados no momento."
                    }
                  </div>
                ) : (
                  remainingPlayers.map((player) => (
                    <PlayerRankingCard 
                      key={player.id} 
                      player={player}
                      isCurrentUser={currentUser?.id === player.id}
                      onClick={() => {
                        // TODO: Abrir modal de estatísticas do jogador
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
