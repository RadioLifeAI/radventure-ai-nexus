
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface JourneyData {
  id?: string;
  title: string;
  description: string;
  objectives: string[];
  filters: Record<string, any>;
  case_ids: string[];
  estimated_duration_minutes?: number;
}

export function useJourneyManagement() {
  const queryClient = useQueryClient();

  // Buscar jornadas do usuário
  const { data: journeys, isLoading } = useQuery({
    queryKey: ['user-journeys'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('user_journeys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Criar nova jornada
  const createJourney = useMutation({
    mutationFn: async (journeyData: JourneyData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('user_journeys')
        .insert({
          user_id: user.id,
          title: journeyData.title,
          description: journeyData.description,
          objectives: journeyData.objectives,
          filters: journeyData.filters,
          case_ids: journeyData.case_ids,
          total_cases: journeyData.case_ids.length,
          estimated_duration_minutes: journeyData.estimated_duration_minutes || journeyData.case_ids.length * 5,
          status: 'created'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-journeys'] });
      toast({
        title: "Jornada criada com sucesso!",
        description: "Sua trilha de aprendizado personalizada está pronta para iniciar"
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar jornada",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Atualizar progresso da jornada
  const updateJourneyProgress = useMutation({
    mutationFn: async ({ journeyId, caseIndex, isCompleted }: { 
      journeyId: string; 
      caseIndex: number;
      isCompleted?: boolean;
    }) => {
      const journey = journeys?.find(j => j.id === journeyId);
      if (!journey) throw new Error('Jornada não encontrada');

      const completed_cases = caseIndex + 1;
      const progress_percentage = Math.round((completed_cases / journey.total_cases) * 100);
      const is_completed = isCompleted || completed_cases >= journey.total_cases;

      const updateData: any = {
        current_case_index: caseIndex,
        completed_cases,
        progress_percentage,
        status: is_completed ? 'completed' : 'in_progress',
        updated_at: new Date().toISOString()
      };

      if (is_completed) {
        updateData.completed_at = new Date().toISOString();
        updateData.is_completed = true;
      }

      const { data, error } = await supabase
        .from('user_journeys')
        .update(updateData)
        .eq('id', journeyId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-journeys'] });
    }
  });

  // Excluir jornada
  const deleteJourney = useMutation({
    mutationFn: async (journeyId: string) => {
      const { error } = await supabase
        .from('user_journeys')
        .delete()
        .eq('id', journeyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-journeys'] });
      toast({
        title: "Jornada excluída",
        description: "A jornada foi removida com sucesso"
      });
    }
  });

  return {
    journeys: journeys || [],
    isLoading,
    createJourney,
    updateJourneyProgress,
    deleteJourney
  };
}
