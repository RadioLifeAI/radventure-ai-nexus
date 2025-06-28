
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HeaderNav } from "@/components/HeaderNav";
import { PodiumDisplay } from "@/components/rankings/PodiumDisplay";
import { PlayerRankingCard } from "@/components/rankings/PlayerRankingCard";
import { RankingFilters } from "@/components/rankings/RankingFilters";
import { MyRankingCard } from "@/components/rankings/MyRankingCard";
import { Trophy } from "lucide-react";
import { useRealUserStats } from "@/hooks/useRealUserStats";

type FilterType = 'global' | 'weekly' | 'monthly' | 'accuracy' | 'cases';

type PlayerData = {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  total_points: number;
  radcoin_balance: number;
  current_streak: number;
  rank: number;
  casesResolved?: number;
  accuracy?: number;
};

export default function Rankings() {
  const [rankings, setRankings] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('global');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { stats: userStats } = useRealUserStats();

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
    console.log('🏆 Buscando rankings reais...');
    
    try {
      let query = supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, total_points, radcoin_balance, current_streak")
        .order("total_points", { ascending: false })
        .limit(50);

      const { data, error } = await query;
      
      if (error) throw error;

      if (data) {
        // Calcular estatísticas adicionais para cada jogador
        const rankingsWithStats = await Promise.all(
          data.map(async (player, index) => {
            // Buscar histórico de casos para calcular accuracy e casos resolvidos
            const { data: playerHistory } = await supabase
              .from('user_case_history')
              .select('is_correct')
              .eq('user_id', player.id);

            const casesResolved = playerHistory?.length || 0;
            const correctAnswers = playerHistory?.filter(h => h.is_correct).length || 0;
            const accuracy = casesResolved > 0 ? Math.round((correctAnswers / casesResolved) * 100) : 0;

            return {
              ...player,
              rank: index + 1,
              casesResolved,
              accuracy
            };
          })
        );

        setRankings(rankingsWithStats);
        console.log('✅ Rankings carregados:', rankingsWithStats.length, 'jogadores');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar rankings:', error);
    }
    
    setLoading(false);
  }

  const topThree = rankings.slice(0, 3);
  const remainingPlayers = rankings.slice(3);
  
  // Encontra usuário atual no ranking
  const currentUserRanking = currentUser ? rankings.find(r => r.id === currentUser.id) : null;
  const userStatsForCard = currentUserRanking && userStats ? {
    ...currentUserRanking,
    casesResolved: userStats.totalCases,
    accuracy: userStats.accuracy,
    streak: userStats.currentStreak
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

          {/* Meu Ranking - com dados reais */}
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
              Carregando ranking com dados reais...
            </div>
          ) : (
            <>
              {/* Pódio Top 3 - dados reais */}
              <PodiumDisplay topPlayers={topThree} />

              {/* Lista dos demais jogadores - dados reais */}
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
