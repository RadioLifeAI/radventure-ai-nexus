
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCasesData() {
  // Buscar dados de casos com estatísticas
  const { data: casesStats, isLoading: casesLoading } = useQuery({
    queryKey: ['cases-dashboard-stats'],
    queryFn: async () => {
      const { data: cases, error } = await supabase
        .from('medical_cases')
        .select('id, specialty, modality, difficulty_level, created_at, points, title, description, patient_clinical_info, findings');

      if (error) throw error;

      // Calcular estatísticas
      const totalCases = cases?.length || 0;
      const bySpecialty = cases?.reduce((acc: any, case_: any) => {
        acc[case_.specialty] = (acc[case_.specialty] || 0) + 1;
        return acc;
      }, {}) || {};

      const byDifficulty = cases?.reduce((acc: any, case_: any) => {
        const level = case_.difficulty_level || 1;
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {}) || {};

      const byModality = cases?.reduce((acc: any, case_: any) => {
        acc[case_.modality] = (acc[case_.modality] || 0) + 1;
        return acc;
      }, {}) || {};

      return {
        totalCases,
        bySpecialty,
        byDifficulty,
        byModality,
        cases: cases || []
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchInterval: 5 * 60 * 1000 // Atualiza a cada 5 minutos
  });

  // Buscar progresso do usuário
  const { data: userProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['user-cases-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: history, error } = await supabase
        .from('user_case_history')
        .select('case_id, is_correct, points, answered_at, medical_cases(specialty, difficulty_level)')
        .eq('user_id', user.id);

      if (error) throw error;

      const total = history?.length || 0;
      const correct = history?.filter(h => h.is_correct).length || 0;
      const totalPoints = history?.reduce((sum, h) => sum + (h.points || 0), 0) || 0;
      
      const bySpecialty = history?.reduce((acc: any, h: any) => {
        const specialty = h.medical_cases?.specialty || 'Outros';
        if (!acc[specialty]) acc[specialty] = { total: 0, correct: 0 };
        acc[specialty].total++;
        if (h.is_correct) acc[specialty].correct++;
        return acc;
      }, {}) || {};

      return {
        totalAnswered: total,
        totalCorrect: correct,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
        totalPoints,
        bySpecialty
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    enabled: true
  });

  return {
    casesStats,
    userProgress,
    isLoading: casesLoading || progressLoading
  };
}
