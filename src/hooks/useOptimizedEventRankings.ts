import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface OptimizedEventRanking {
  id: string;
  event_id: string;
  user_id: string;
  score: number;
  rank: number;
  radcoins_earned: number;
  user: {
    full_name: string;
    username: string;
    avatar_url: string;
    medical_specialty: string;
  };
}

export interface OptimizedEventData {
  id: string;
  name: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string;
  prize_radcoins: number;
  banner_url?: string;
  participant_count: number;
  rankings: OptimizedEventRanking[];
}

export function useOptimizedEventRankings() {
  const { user } = useAuth();

  const { data: eventData, isLoading, error, refetch } = useQuery({
    queryKey: ['optimized-event-rankings'],
    queryFn: async (): Promise<OptimizedEventData[]> => {
      console.log('🚀 Carregando rankings de eventos OTIMIZADOS');

      // 1. Buscar eventos ativos e finalizados
      const { data: eventsWithStats, error: eventsError } = await supabase
        .from('events')
        .select(`
          id,
          name,
          status,
          scheduled_start,
          scheduled_end,
          prize_radcoins,
          banner_url
        `)
        .in('status', ['ACTIVE', 'FINISHED'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (eventsError) {
        console.error('❌ Erro ao buscar eventos:', eventsError);
        throw eventsError;
      }

      if (!eventsWithStats || eventsWithStats.length === 0) {
        return [];
      }

      // 1.5. Buscar cache de estatísticas dos eventos em paralelo
      const eventIds = eventsWithStats.map(e => e.id);
      const { data: eventStatsCache } = await supabase
        .from('event_stats_cache')
        .select('event_id, total_participants, average_score, completion_rate')
        .in('event_id', eventIds);

      // 2. Buscar todos os rankings dos eventos em uma única query
      const { data: allRankings, error: rankingsError } = await supabase
        .from('event_rankings')
        .select(`
          id,
          event_id,
          user_id,
          score,
          rank
        `)
        .in('event_id', eventIds)
        .order('rank', { ascending: true });

      if (rankingsError) {
        console.error('❌ Erro ao buscar rankings:', rankingsError);
        throw rankingsError;
      }

      // 3. Buscar prêmios finais em uma única query
      const { data: finalRankings } = await supabase
        .from('event_final_rankings')
        .select('user_id, event_id, radcoins_awarded')
        .in('event_id', eventIds);

      // 4. Buscar perfis de usuários únicos em uma única query
      const uniqueUserIds = [...new Set(allRankings?.map(r => r.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, medical_specialty')
        .in('id', uniqueUserIds);

      // 5. Criar mapas para acesso rápido
      const profilesMap = new Map((profiles || []).map(p => [p.id, p]));
      const finalRankingsMap = new Map(
        (finalRankings || []).map(f => [`${f.event_id}-${f.user_id}`, f.radcoins_awarded || 0])
      );
      const eventStatsCacheMap = new Map(
        (eventStatsCache || []).map(s => [s.event_id, s])
      );

      // 6. Agrupar rankings por evento
      const rankingsByEvent = new Map<string, any[]>();
      (allRankings || []).forEach(ranking => {
        if (!rankingsByEvent.has(ranking.event_id)) {
          rankingsByEvent.set(ranking.event_id, []);
        }
        rankingsByEvent.get(ranking.event_id)!.push(ranking);
      });

      // 7. Construir resultado final
      const optimizedEvents: OptimizedEventData[] = eventsWithStats.map(event => {
        const eventRankings = rankingsByEvent.get(event.id) || [];
        const eventStats = eventStatsCacheMap.get(event.id);
        
        const rankings: OptimizedEventRanking[] = eventRankings.map(ranking => {
          const profile = profilesMap.get(ranking.user_id);
          const radcoinsEarned = finalRankingsMap.get(`${event.id}-${ranking.user_id}`) || 0;

          return {
            id: ranking.id,
            event_id: ranking.event_id,
            user_id: ranking.user_id,
            score: ranking.score || 0,
            rank: ranking.rank || 999,
            radcoins_earned: radcoinsEarned,
            user: {
              full_name: profile?.full_name || profile?.username || 'Usuário',
              username: profile?.username || 'user',
              avatar_url: profile?.avatar_url || '',
              medical_specialty: profile?.medical_specialty || 'Não informado'
            }
          };
        });

        return {
          id: event.id,
          name: event.name || 'Evento',
          status: event.status || 'UNKNOWN',
          scheduled_start: event.scheduled_start || new Date().toISOString(),
          scheduled_end: event.scheduled_end || new Date().toISOString(),
          prize_radcoins: event.prize_radcoins || 0,
          banner_url: event.banner_url,
          participant_count: eventStats?.total_participants || rankings.length,
          rankings
        };
      });

      console.log(`✅ Rankings otimizados carregados: ${optimizedEvents.length} eventos`);
      return optimizedEvents;
    },
    staleTime: 3 * 60 * 1000, // 3 minutos de cache
    refetchInterval: 5 * 60 * 1000, // Refresh automático a cada 5 minutos
    refetchOnWindowFocus: false
  });

  // Função para buscar um evento específico
  const getEventById = (eventId: string) => {
    return eventData?.find(event => event.id === eventId);
  };

  // Função para buscar eventos ativos
  const getActiveEvents = () => {
    return eventData?.filter(event => event.status === 'ACTIVE') || [];
  };

  // Função para buscar eventos finalizados
  const getFinishedEvents = () => {
    return eventData?.filter(event => event.status === 'FINISHED') || [];
  };

  return {
    eventData: eventData || [],
    isLoading,
    error,
    refetch,
    getEventById,
    getActiveEvents,
    getFinishedEvents
  };
}