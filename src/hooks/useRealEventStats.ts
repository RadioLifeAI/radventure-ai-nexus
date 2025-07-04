
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface RealEventStats {
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  upcomingEvents: number;
  userParticipations: number;
  userWins: number;
  bestRank: number;
  totalPrizeEarned: number;
  recentEvents: Array<{
    id: string;
    name: string;
    status: string;
    participants: number;
    userRank?: number;
    prizeEarned?: number;
    scheduledStart: string;
  }>;
  userEventHistory: Array<{
    eventId: string;
    eventName: string;
    rank: number;
    score: number;
    participants: number;
    prizeEarned: number;
    completedAt: string;
  }>;
}

export function useRealEventStats() {
  const { user } = useAuth();

  const { data: eventStats, isLoading, error, refetch } = useQuery({
    queryKey: ['real-event-stats', user?.id],
    queryFn: async (): Promise<RealEventStats> => {
      console.log('🎯 Buscando estatísticas reais de eventos...');

      // Buscar todos os eventos
      const { data: allEvents, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Estatísticas básicas de eventos
      const totalEvents = allEvents?.length || 0;
      const activeEvents = allEvents?.filter(e => e.status === 'ACTIVE').length || 0;
      const completedEvents = allEvents?.filter(e => e.status === 'FINISHED').length || 0;
      const upcomingEvents = allEvents?.filter(e => e.status === 'SCHEDULED').length || 0;

      let userParticipations = 0;
      let userWins = 0;
      let bestRank = 0;
      let totalPrizeEarned = 0;
      let userEventHistory: any[] = [];
      const recentEvents: any[] = [];

      if (user?.id) {
        // Buscar participações do usuário
        const { data: userRegistrations, error: registrationsError } = await supabase
          .from('event_registrations')
          .select(`
            *,
            events!inner(*)
          `)
          .eq('user_id', user.id);

        if (registrationsError) throw registrationsError;

        userParticipations = userRegistrations?.length || 0;

        // Buscar rankings do usuário
        const { data: userRankings, error: rankingsError } = await supabase
          .from('event_rankings')
          .select(`
            *,
            events!inner(*)
          `)
          .eq('user_id', user.id)
          .order('rank', { ascending: true });

        if (rankingsError) throw rankingsError;

        // Calcular estatísticas do usuário
        if (userRankings && userRankings.length > 0) {
          userWins = userRankings.filter(r => r.rank === 1).length;
          bestRank = Math.min(...userRankings.map(r => r.rank || 999));

          // Buscar final rankings para prêmios em uma única query
          const { data: finalRankings } = await supabase
            .from('event_final_rankings')
            .select('*')
            .eq('user_id', user.id);

          totalPrizeEarned = finalRankings?.reduce((sum, r) => sum + (r.radcoins_awarded || 0), 0) || 0;

          // OTIMIZAÇÃO: Contar participantes por evento em batch usando view ou query otimizada
          const eventIdsForCounting = userRankings.map(r => r.event_id);
          const { data: participantCounts } = await supabase
            .from('event_rankings') 
            .select('event_id')
            .in('event_id', eventIdsForCounting);

          // Contar participantes por evento
          const participantCountsMap = new Map<string, number>();
          participantCounts?.forEach(p => {
            const count = participantCountsMap.get(p.event_id) || 0;
            participantCountsMap.set(p.event_id, count + 1);
          });

          // Histórico de eventos do usuário (sem loop de queries individuais)
          userEventHistory = userRankings.map(ranking => {
            const finalRanking = finalRankings?.find(f => f.event_id === ranking.event_id);
            const participantCount = participantCountsMap.get(ranking.event_id) || 0;

            return {
              eventId: ranking.event_id,
              eventName: ranking.events?.name || 'Evento',
              rank: ranking.rank || 0,
              score: ranking.score || 0,
              participants: participantCount,
              prizeEarned: finalRanking?.radcoins_awarded || 0,
              completedAt: ranking.updated_at
            };
          });
        }
      }

      // OTIMIZAÇÃO: Eventos recentes com estatísticas (sem loops de queries)
      const recentEventsData = allEvents?.slice(0, 10) || [];
      const recentEventIds = recentEventsData.map(e => e.id);
      
      // Buscar contagem de registrações de forma otimizada
      const { data: allRegistrations } = await supabase
        .from('event_registrations')
        .select('event_id')
        .in('event_id', recentEventIds);

      // Contar registrações por evento
      const registrationCountsMap = new Map<string, number>();
      allRegistrations?.forEach(reg => {
        const count = registrationCountsMap.get(reg.event_id) || 0;
        registrationCountsMap.set(reg.event_id, count + 1);
      });

      let userRankingsForRecent: any[] = [];
      let userFinalRankingsForRecent: any[] = [];

      if (user?.id) {
        // Buscar rankings do usuário para eventos recentes
        const { data: userRankingsData } = await supabase
          .from('event_rankings')
          .select('event_id, rank')
          .eq('user_id', user.id)
          .in('event_id', recentEventIds);

        userRankingsForRecent = userRankingsData || [];

        // Buscar prêmios finais do usuário para eventos recentes
        const { data: userFinalData } = await supabase
          .from('event_final_rankings')
          .select('event_id, radcoins_awarded')
          .eq('user_id', user.id)
          .in('event_id', recentEventIds);

        userFinalRankingsForRecent = userFinalData || [];
      }

      // Construir eventos recentes sem loop de queries
      recentEventsData.forEach(event => {
        const registrationCount = registrationCountsMap.get(event.id) || 0;
        const userRankingData = userRankingsForRecent.find(r => r.event_id === event.id);
        const userFinalData = userFinalRankingsForRecent.find(f => f.event_id === event.id);

        recentEvents.push({
          id: event.id,
          name: event.name,
          status: event.status,
          participants: registrationCount,
          userRank: userRankingData?.rank,
          prizeEarned: userFinalData?.radcoins_awarded || 0,
          scheduledStart: event.scheduled_start
        });
      });

      console.log('✅ Estatísticas de eventos calculadas:', {
        totalEvents,
        activeEvents,
        userParticipations,
        userWins
      });

      return {
        totalEvents,
        activeEvents,
        completedEvents,
        upcomingEvents,
        userParticipations,
        userWins,
        bestRank,
        totalPrizeEarned,
        recentEvents,
        userEventHistory
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000 // 5 minutos
  });

  return {
    eventStats,
    isLoading,
    error,
    refetch
  };
}
