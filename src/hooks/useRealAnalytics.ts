import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface RealAnalyticsData {
  performanceTrend: 'up' | 'down' | 'stable';
  bestSpecialty: string;
  weakestSpecialty: string;
  progressThisWeek: number;
  rankImprovement: number;
  totalRadCoinsEarned: number;
  averageScore: number;
  bestRank: number;
  participationRate: number;
  specialtyBreakdown: Array<{
    specialty: string;
    accuracy: number;
    participations: number;
  }>;
}

export function useRealAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<RealAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchRealAnalytics();
  }, [user]);

  const fetchRealAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 1. Buscar rankings do usuário
      const { data: userRankings } = await supabase
        .from("event_rankings")
        .select(`
          *,
          events:event_id (
            name,
            scheduled_start,
            status
          )
        `)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      // 2. Buscar prêmios distribuídos
      const { data: finalRankings } = await supabase
        .from("event_final_rankings")
        .select("radcoins_awarded, rank")
        .eq("user_id", user.id);

      // 3. Buscar histórico de casos para análise de especialidades
      const { data: caseHistory } = await supabase
        .from("user_case_history")
        .select(`
          *,
          medical_cases:case_id (
            specialty,
            points
          )
        `)
        .eq("user_id", user.id)
        .gte("answered_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // 4. Buscar perfil atualizado
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_points, current_streak, radcoin_balance")
        .eq("id", user.id)
        .single();

      // PROCESSAMENTO DOS DADOS
      const totalRadCoinsEarned = (finalRankings || []).reduce((sum, r) => sum + (r.radcoins_awarded || 0), 0);
      const ranks = (userRankings || []).map(r => r.rank).filter(rank => rank && rank > 0);
      const bestRank = ranks.length > 0 ? Math.min(...ranks) : 0;
      const averageScore = (userRankings || []).length > 0 
        ? Math.round((userRankings || []).reduce((sum, r) => sum + (r.score || 0), 0) / userRankings.length)
        : 0;

      // Análise de especialidades
      const specialtyMap = new Map<string, { correct: number; total: number; points: number }>();
      
      (caseHistory || []).forEach(history => {
        const specialty = history.medical_cases?.specialty || "Geral";
        const current = specialtyMap.get(specialty) || { correct: 0, total: 0, points: 0 };
        
        current.total += 1;
        if (history.is_correct) current.correct += 1;
        current.points += history.medical_cases?.points || 0;
        
        specialtyMap.set(specialty, current);
      });

      const specialtyBreakdown = Array.from(specialtyMap.entries())
        .map(([specialty, data]) => ({
          specialty,
          accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
          participations: data.total
        }))
        .sort((a, b) => b.accuracy - a.accuracy);

      const bestSpecialty = specialtyBreakdown[0]?.specialty || "Nenhuma";
      const weakestSpecialty = specialtyBreakdown[specialtyBreakdown.length - 1]?.specialty || "Nenhuma";

      // Cálculo de tendência baseado nos últimos 7 dias vs 7-14 dias atrás
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const recentCases = (caseHistory || []).filter(h => new Date(h.answered_at) >= sevenDaysAgo);
      const previousCases = (caseHistory || []).filter(h => {
        const date = new Date(h.answered_at);
        return date >= fourteenDaysAgo && date < sevenDaysAgo;
      });

      const recentAccuracy = recentCases.length > 0 
        ? recentCases.filter(h => h.is_correct).length / recentCases.length 
        : 0;
      const previousAccuracy = previousCases.length > 0 
        ? previousCases.filter(h => h.is_correct).length / previousCases.length 
        : 0;

      const performanceTrend: 'up' | 'down' | 'stable' = 
        recentAccuracy > previousAccuracy + 0.1 ? 'up' : 
        recentAccuracy < previousAccuracy - 0.1 ? 'down' : 'stable';

      const progressThisWeek = recentCases.reduce((sum, h) => sum + (h.points || 0), 0);

      // Melhoria de ranking (diferença entre melhor rank dos últimos 30 dias vs histórico)
      const recentRankings = (userRankings || []).filter(r => 
        new Date(r.updated_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );
      const recentBestRank = recentRankings.length > 0 
        ? Math.min(...recentRankings.map(r => r.rank).filter(rank => rank > 0))
        : bestRank;
      
      const rankImprovement = bestRank > 0 && recentBestRank > 0 ? bestRank - recentBestRank : 0;

      const participationRate = (userRankings || []).length;

      setAnalytics({
        performanceTrend,
        bestSpecialty,
        weakestSpecialty,
        progressThisWeek,
        rankImprovement,
        totalRadCoinsEarned,
        averageScore,
        bestRank,
        participationRate,
        specialtyBreakdown
      });

    } catch (error) {
      console.error("Erro ao buscar analytics reais:", error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    analytics,
    loading,
    refetch: fetchRealAnalytics
  };
}