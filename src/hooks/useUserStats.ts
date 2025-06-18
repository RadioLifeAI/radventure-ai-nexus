
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserStats {
  totalCases: number;
  correctAnswers: number;
  accuracy: number;
  totalPoints: number;
  currentStreak: number;
  specialtyStats: Record<string, {
    total: number;
    correct: number;
    accuracy: number;
    points: number;
  }>;
  weeklyProgress: Array<{
    date: string;
    cases: number;
    points: number;
  }>;
  achievements: Array<{
    name: string;
    description: string;
    earnedAt: string;
  }>;
  radcoinHistory: Array<{
    date: string;
    amount: number;
    type: string;
    balance: number;
  }>;
}

export function useUserStats() {
  const { user } = useAuth();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async (): Promise<UserStats> => {
      if (!user?.id) {
        throw new Error('No user ID');
      }

      // Buscar histórico de casos
      const { data: caseHistory, error: caseError } = await supabase
        .from('user_case_history')
        .select(`
          *,
          medical_cases!inner(
            specialty,
            modality,
            points
          )
        `)
        .eq('user_id', user.id)
        .order('answered_at', { ascending: false });

      if (caseError) throw caseError;

      // Buscar perfil para dados básicos
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Buscar transações RadCoin
      const { data: radcoinHistory, error: radcoinError } = await supabase
        .from('radcoin_transactions_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (radcoinError) throw radcoinError;

      // Calcular estatísticas
      const totalCases = caseHistory?.length || 0;
      const correctAnswers = caseHistory?.filter(h => h.is_correct).length || 0;
      const accuracy = totalCases > 0 ? Math.round((correctAnswers / totalCases) * 100) : 0;

      // Estatísticas por especialidade
      const specialtyStats: Record<string, any> = {};
      caseHistory?.forEach(history => {
        const specialty = history.medical_cases?.specialty || 'Outros';
        if (!specialtyStats[specialty]) {
          specialtyStats[specialty] = {
            total: 0,
            correct: 0,
            accuracy: 0,
            points: 0
          };
        }
        specialtyStats[specialty].total++;
        if (history.is_correct) {
          specialtyStats[specialty].correct++;
        }
        specialtyStats[specialty].points += history.points || 0;
      });

      // Calcular accuracy por especialidade
      Object.keys(specialtyStats).forEach(specialty => {
        const stats = specialtyStats[specialty];
        stats.accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      });

      // Progresso semanal (últimos 7 dias)
      const weeklyProgress = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayCases = caseHistory?.filter(h => 
          h.answered_at.startsWith(dateStr)
        ) || [];
        
        weeklyProgress.push({
          date: dateStr,
          cases: dayCases.length,
          points: dayCases.reduce((sum, h) => sum + (h.points || 0), 0)
        });
      }

      // Conquistas simuladas baseadas em estatísticas reais
      const achievements = [];
      if (totalCases >= 10) {
        achievements.push({
          name: 'Explorador Médico',
          description: 'Resolveu 10 casos médicos',
          earnedAt: caseHistory?.[9]?.answered_at || new Date().toISOString()
        });
      }
      if (correctAnswers >= 5) {
        achievements.push({
          name: 'Diagnóstico Certeiro',
          description: 'Acertou 5 diagnósticos',
          earnedAt: caseHistory?.find(h => h.is_correct)?.answered_at || new Date().toISOString()
        });
      }
      if (accuracy >= 80 && totalCases >= 5) {
        achievements.push({
          name: 'Expert em Precisão',
          description: 'Mantém 80% de precisão',
          earnedAt: new Date().toISOString()
        });
      }

      // Formatar histórico RadCoin
      const formattedRadcoinHistory = radcoinHistory?.map(tx => ({
        date: tx.created_at,
        amount: tx.amount,
        type: tx.tx_type,
        balance: tx.balance_after
      })) || [];

      return {
        totalCases,
        correctAnswers,
        accuracy,
        totalPoints: profile?.total_points || 0,
        currentStreak: profile?.current_streak || 0,
        specialtyStats,
        weeklyProgress,
        achievements,
        radcoinHistory: formattedRadcoinHistory
      };
    },
    enabled: !!user?.id,
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  return {
    stats,
    isLoading,
    error
  };
}
