
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useDashboardData() {
  // Buscar especialidades e contar casos por especialidade
  const { data: specialtiesData, isLoading: specialtiesLoading } = useQuery({
    queryKey: ['dashboard-specialties'],
    queryFn: async () => {
      // Buscar todas as especialidades do banco
      const { data: specialties, error: specialtiesError } = await supabase
        .from('medical_specialties')
        .select('*')
        .order('name');

      if (specialtiesError) throw specialtiesError;

      // CORREÇÃO: Buscar casos com fallback robusto para categorização
      const { data: cases, error: casesError } = await supabase
        .from('medical_cases')
        .select(`
          specialty, 
          id,
          category_id,
          medical_specialties!category_id(name)
        `);

      if (casesError) throw casesError;

      // CORREÇÃO: Contar casos por especialidade com fallback
      const casesBySpecialty = cases?.reduce((acc, case_item) => {
        // Usar specialty se disponível, senão usar nome da categoria
        const specialty = case_item.specialty || 
                         case_item.medical_specialties?.name || 
                         'Outros';
        acc[specialty] = (acc[specialty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Combinar especialidades com contagem
      const specialtiesWithCounts = specialties?.map(specialty => ({
        ...specialty,
        cases: casesBySpecialty[specialty.name] || 0
      })) || [];

      return specialtiesWithCounts;
    },
    refetchInterval: 30000 // Atualiza a cada 30 segundos
  });

  // Buscar dados de eventos
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['dashboard-events'],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from('events')
        .select('id, name, status, scheduled_start')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return events || [];
    },
    refetchInterval: 30000
  });

  // Buscar dados do perfil do usuário
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['dashboard-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return profile;
    }
  });

  return {
    specialties: specialtiesData || [],
    events: eventsData || [],
    profile: profileData,
    isLoading: specialtiesLoading || eventsLoading || profileLoading
  };
}
