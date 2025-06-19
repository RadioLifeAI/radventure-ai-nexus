
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HeaderNav } from "@/components/HeaderNav";
import { EventSelector } from "@/components/rankings/EventSelector";
import { EventStatsHeader } from "@/components/rankings/EventStatsHeader";
import { EventRankingCard } from "@/components/rankings/EventRankingCard";
import { PrizeDistributionDisplay } from "@/components/rankings/PrizeDistributionDisplay";
import { PlayerStatsModal } from "@/components/rankings/PlayerStatsModal";
import { Trophy } from "lucide-react";

export default function RankingEventos() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventRankings, setEventRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchEventRankings();
    }
  }, [selectedEvent]);

  async function fetchData() {
    setLoading(true);
    
    // Buscar usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setCurrentUser(profile);
    }

    // Buscar eventos
    const { data: eventsData, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (eventsData) {
      setEvents(eventsData);
      if (eventsData.length > 0) {
        setSelectedEvent(eventsData[0]);
      }
    }
    
    setLoading(false);
  }

  async function fetchEventRankings() {
    if (!selectedEvent) return;

    const { data, error } = await supabase
      .from("event_rankings")
      .select(`
        *,
        profiles:profiles!event_rankings_user_id_fkey(username, full_name, avatar_url)
      `)
      .eq("event_id", selectedEvent.id)
      .order("rank", { ascending: true });
    
    // Add mock RadCoins earned for demonstration
    const rankingsWithRadCoins = (data || []).map((ranking, index) => ({
      ...ranking,
      radcoins_earned: selectedEvent.prize_radcoins ? 
        Math.max(selectedEvent.prize_radcoins - (index * 50), 10) : 0,
      completion_time: Math.floor(Math.random() * 120 + 60) // Mock completion time
    }));
    
    setEventRankings(rankingsWithRadCoins);
  }

  const handlePlayerClick = (ranking: any) => {
    // Mock player stats for demonstration
    const playerStats = {
      id: ranking.user_id,
      username: ranking.profiles?.username,
      full_name: ranking.profiles?.full_name,
      avatar_url: ranking.profiles?.avatar_url,
      total_points: ranking.score,
      rank: ranking.rank,
      radcoin_balance: ranking.radcoins_earned || 0,
      casesResolved: Math.floor(Math.random() * 100 + 20),
      accuracy: Math.floor(Math.random() * 20 + 80),
      streak: Math.floor(Math.random() * 15 + 1),
    };
    
    setSelectedPlayer(playerStats);
    setIsStatsModalOpen(true);
  };

  // Generate prize distribution based on event prize
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

  const participantCount = eventRankings.length;

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
            Acompanhe os rankings dos eventos e veja quem conquistou os prêmios!
          </p>

          {loading ? (
            <div className="text-cyan-400 text-center py-8 animate-fade-in">
              Carregando eventos...
            </div>
          ) : (
            <>
              {/* Event Selector */}
              <EventSelector 
                events={events}
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
                      Classificação Final
                    </h2>
                    
                    {eventRankings.length === 0 ? (
                      <div className="text-center text-cyan-400 py-8 bg-white/10 rounded-xl">
                        Nenhum ranking disponível para este evento ainda.
                      </div>
                    ) : (
                      eventRankings.map((ranking) => (
                        <EventRankingCard 
                          key={ranking.id} 
                          ranking={ranking}
                          isCurrentUser={currentUser?.id === ranking.user_id}
                          onClick={() => handlePlayerClick(ranking)}
                        />
                      ))
                    )}
                  </div>
                </>
              )}

              {events.length === 0 && (
                <div className="text-center text-cyan-400 py-8">
                  Nenhum evento encontrado.
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Player Stats Modal */}
      <PlayerStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        playerStats={selectedPlayer}
      />
    </div>
  );
}
