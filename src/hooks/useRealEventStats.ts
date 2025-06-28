
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
      const userEventHistory: any[] = [];
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

          // Buscar final rankings para prêmios
          const { data: finalRankings } = await supabase
            .from('event_final_rankings')
            .select('*')
            .eq('user_id', user.id);

          totalPrizeEarned = finalRankings?.reduce((sum, r) => sum + (r.radcoins_awarded || 0), 0) || 0;

          // Histórico de eventos do usuário
          for (const ranking of userRankings) {
            // Contar participantes do evento
            const { count: participantCount } = await supabase
              .from('event_rankings')
              .select('*', { count: 'exact', head: true })
              .eq('event_id', ranking.event_id);

            const finalRanking = finalRankings?.find(f => f.event_id === ranking.event_id);

            userEventHistory.push({
              eventId: ranking.event_id,
              eventName: ranking.events?.name || 'Evento',
              rank: ranking.rank || 0,
              score: ranking.score || 0,
              participants: participantCount || 0,
              prizeEarned: finalRanking?.radcoins_awarded || 0,
              completedAt: ranking.updated_at
            });
          }
        }
      }

      // Eventos recentes com estatísticas
      for (const event of (allEvents?.slice(0, 10) || [])) {
        const { count: participantCount } = await supabase
          .from('event_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id);

        let userRank;
        let prizeEarned = 0;

        if (user?.id) {
          const { data: userRanking } = await supabase
            .from('event_rankings')
            .select('rank')
            .eq('event_id', event.id)
            .eq('user_id', user.id)
            .single();

          userRank = userRanking?.rank;

          if (userRank) {
            const { data: finalRanking } = await supabase
              .from('event_final_rankings')
              .select('radcoins_awarded')
              .eq('event_id', event.id)
              .eq('user_id', user.id)
              .single();

            prizeEarned = finalRanking?.radcoins_awarded || 0;
          }
        }

        recentEvents.push({
          id: event.id,
          name: event.name,
          status: event.status,
          participants: participantCount || 0,
          userRank,
          prizeEarned,
          scheduledStart: event.scheduled_start
        });
      }

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
