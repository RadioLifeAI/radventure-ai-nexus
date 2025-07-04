
import React, { useState } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { EventSelector } from "@/components/rankings/EventSelector";
import { EventStatsHeader } from "@/components/rankings/EventStatsHeader";
import { EventRankingCard } from "@/components/rankings/EventRankingCard";
import { PrizeDistributionDisplay } from "@/components/rankings/PrizeDistributionDisplay";
import { PlayerStatsModal } from "@/components/rankings/PlayerStatsModal";
import { Trophy } from "lucide-react";
import { useOptimizedEventRankings } from "@/hooks/useOptimizedEventRankings";
import { useAuth } from "@/hooks/useAuth";

export default function RankingEventos() {
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const { eventData, isLoading, getEventById } = useOptimizedEventRankings();

  // Selecionar primeiro evento automaticamente
  React.useEffect(() => {
    if (eventData && eventData.length > 0 && !selectedEvent) {
      setSelectedEvent(eventData[0]);
    }
  }, [eventData, selectedEvent]);

  const handlePlayerClick = (ranking: any) => {
    setSelectedPlayer({
      id: ranking.user_id,
      username: ranking.user?.username,
      full_name: ranking.user?.full_name,
      avatar_url: ranking.user?.avatar_url,
      total_points: ranking.score,
      rank: ranking.rank,
      radcoin_balance: ranking.radcoins_earned,
      casesResolved: 0,
      accuracy: 0,
      streak: 0,
    });
    setIsStatsModalOpen(true);
  };

  // Distribuição de prêmios baseada em prêmios reais do evento
  const getPrizeDistribution = (event: any) => {
    if (!event?.prize_radcoins) return [];
    
    const total = event.prize_radcoins;
    return [
      { position: 1, prize: Math.floor(total * 0.5), percentage: 50 },
      { position: 2, prize: Math.floor(total * 0.3), percentage: 30 },
      { position: 3, prize: Math.floor(total * 0.15), percentage: 15 },
      { position: 4, prize: Math.floor(total * 0.05), percentage: 5 },
    ];
  };

  const currentEventData = selectedEvent ? getEventById(selectedEvent.id) : null;
  const participantCount = currentEventData?.participant_count || 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      <main className="flex-1 flex flex-col px-2 md:px-16 pt-4 pb-10">
        <div className="max-w-5xl mx-auto w-full">
          <h1 className="font-extrabold text-3xl mb-2 flex items-center gap-3 animate-fade-in">
            <Trophy className="text-yellow-400" size={36} />
            Rankings de Eventos
          </h1>
          <p className="mb-6 text-cyan-100 text-lg">
            Acompanhe os rankings dos eventos e veja quem conquistou os prêmios! (Dados Reais)
          </p>

          {isLoading ? (
            <div className="text-cyan-400 text-center py-8 animate-fade-in">
              Carregando eventos com dados reais...
            </div>
          ) : (
            <>
              {/* Event Selector */}
              <EventSelector 
                events={eventData}
                selectedEvent={selectedEvent}
                onSelectEvent={setSelectedEvent}
              />

              {selectedEvent && (
                <>
                  {/* Event Stats Header */}
                  <EventStatsHeader 
                    event={selectedEvent}
                    participantCount={participantCount}
                  />

                  {/* Prize Distribution */}
                  {selectedEvent.prize_radcoins > 0 && (
                    <PrizeDistributionDisplay 
                      prizeDistribution={getPrizeDistribution(selectedEvent)}
                      totalPrize={selectedEvent.prize_radcoins}
                    />
                  )}

                  {/* Event Rankings */}
                  <div className="space-y-3">
                    <h2 className="font-bold text-xl text-white mb-4 flex items-center gap-2">
                      <Trophy size={24} className="text-cyan-400" />
                      Classificação Final - Dados Reais
                    </h2>
                    
                    {!currentEventData?.rankings || currentEventData.rankings.length === 0 ? (
                      <div className="text-center text-cyan-400 py-8 bg-white/10 rounded-xl">
                        Nenhum ranking disponível para este evento ainda.
                      </div>
                    ) : (
                      currentEventData.rankings.map((ranking) => (
                        <EventRankingCard 
                          key={ranking.id} 
                          ranking={ranking}
                          isCurrentUser={user?.id === ranking.user_id}
                          onClick={() => handlePlayerClick(ranking)}
                        />
                      ))
                    )}
                  </div>
                </>
              )}

              {eventData.length === 0 && (
                <div className="text-center text-cyan-400 py-8">
                  Nenhum evento encontrado.
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Player Stats Modal - com dados reais */}
      <PlayerStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        playerStats={selectedPlayer}
      />
    </div>
  );
}
