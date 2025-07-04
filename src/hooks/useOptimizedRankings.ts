import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface OptimizedRanking {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  total_points: number;
  current_streak: number;
  accuracy: number;
  rank: number;
  casesResolved: number;
}

export function useOptimizedRankings() {
  const { user } = useAuth();

  const { data: rankings, isLoading, error } = useQuery({
    queryKey: ['optimized-rankings'],
    queryFn: async (): Promise<{ rankings: OptimizedRanking[]; userRank: number | null }> => {
      console.log("🚀 Carregando rankings SUPER OTIMIZADOS via cache");

      // 1. Buscar cache de estatísticas
      const { data: cacheResults, error: cacheError } = await supabase
        .from("user_stats_cache")
        .select(`
          user_id,
          total_cases,
          correct_answers,
          accuracy_percentage,
          total_points,
          current_streak
        `)
        .order("total_points", { ascending: false })
        .limit(20); // Limite pequeno para máxima performance

      if (cacheError) {
        console.error("❌ Erro na query de cache:", cacheError);
        throw cacheError;
      }

      if (!cacheResults || cacheResults.length === 0) {
        return { rankings: [], userRank: null };
      }

      // 2. Buscar profiles para os usuários no cache
      const userIds = cacheResults.map(r => r.user_id);
      const { data: profileResults, error: profileError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          username,
          avatar_url
        `)
        .in('id', userIds);

      if (profileError) {
        console.error("❌ Erro na query de profiles:", profileError);
        throw profileError;
      }

      // 3. Combinar dados
      const profilesMap = new Map((profileResults || []).map(p => [p.id, p]));
      
      const rankings: OptimizedRanking[] = cacheResults.map((result, index) => {
        const profile = profilesMap.get(result.user_id);
        return {
          id: result.user_id,
          full_name: profile?.full_name || 'Usuário',
          username: profile?.username || 'user',
          avatar_url: profile?.avatar_url || '',
          total_points: result.total_points || 0,
          current_streak: result.current_streak || 0,
          accuracy: Math.round(result.accuracy_percentage || 0),
          rank: index + 1,
          casesResolved: result.total_cases || 0
        };
      });

      // Encontrar rank do usuário atual
      const userRank = user ? 
        rankings.findIndex(r => r.id === user.id) + 1 || null : 
        null;

      console.log(`✅ Rankings otimizados carregados: ${rankings.length} usuários, user rank: ${userRank}`);
      
      return { rankings, userRank };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000 // Refresh automático a cada 10 minutos
  });

  return {
    rankings: rankings?.rankings || [],
    userRank: rankings?.userRank || null,
    isLoading,
    error
  };
}