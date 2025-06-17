
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface UserHelpAids {
  id: string;
  user_id: string;
  elimination_aids: number;
  skip_aids: number;
  ai_tutor_credits: number;
  last_refill_date: string;
  created_at: string;
  updated_at: string;
}

export function useUserHelpAids() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: helpAids, isLoading } = useQuery({
    queryKey: ['user-help-aids'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('user_help_aids')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // Se não existe, criar registro inicial
        if (error.code === 'PGRST116') {
          const { data: newRecord, error: insertError } = await supabase
            .from('user_help_aids')
            .insert({ user_id: user.id })
            .select()
            .single();
          
          if (insertError) throw insertError;
          return newRecord;
        }
        throw error;
      }

      return data;
    },
  });

  const consumeHelpMutation = useMutation({
    mutationFn: async ({ aidType, amount = 1 }: { aidType: string, amount?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase.rpc('consume_help_aid', {
        p_user_id: user.id,
        p_aid_type: aidType,
        p_amount: amount
      });

      if (error) throw error;
      if (!data) throw new Error('Não há créditos suficientes');

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-help-aids'] });
      
      const aidNames = {
        elimination: 'Eliminação',
        skip: 'Pular',
        ai_tutor: 'Tutor AI'
      };
      
      toast({
        title: 'Ajuda utilizada',
        description: `${aidNames[variables.aidType as keyof typeof aidNames]} consumida com sucesso!`
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const getTutorHintMutation = useMutation({
    mutationFn: async ({ caseData, userQuestion }: { caseData: any, userQuestion?: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      const response = await fetch('/supabase/functions/v1/ai-tutor-hint', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caseData, userQuestion }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao obter dica do tutor');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-help-aids'] });
    }
  });

  return {
    helpAids,
    isLoading,
    consumeHelp: consumeHelpMutation.mutate,
    isConsumingHelp: consumeHelpMutation.isPending,
    getTutorHint: getTutorHintMutation.mutate,
    isGettingHint: getTutorHintMutation.isPending,
    tutorHintData: getTutorHintMutation.data,
    tutorHintError: getTutorHintMutation.error
  };
}
