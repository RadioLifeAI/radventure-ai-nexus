
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './useAuth';

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
  const { user, isAuthenticated } = useAuth();

  const { data: helpAids, isLoading } = useQuery({
    queryKey: ['user-help-aids', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

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
    enabled: !!user?.id && isAuthenticated,
  });

  const consumeHelpMutation = useMutation({
    mutationFn: async ({ aidType, amount = 1 }: { aidType: string, amount?: number }) => {
      if (!user?.id) throw new Error('User not authenticated');

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
      if (!user?.id) throw new Error('User not authenticated');

      console.log('🤖 Chamando Tutor AI:', { caseId: caseData.id, userQuestion });

      // CORREÇÃO: Usar supabase.functions.invoke em vez de fetch
      const { data, error } = await supabase.functions.invoke('ai-tutor-hint', {
        body: { 
          caseData, 
          userQuestion: userQuestion || 'Dica geral sobre este caso' 
        }
      });

      if (error) {
        console.error('❌ Erro na Edge Function:', error);
        throw new Error(error.message || 'Erro ao obter dica do tutor');
      }

      if (!data) {
        throw new Error('Resposta vazia do tutor AI');
      }

      console.log('✅ Resposta do Tutor AI:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Tutor AI - Sucesso:', data);
      queryClient.invalidateQueries({ queryKey: ['user-help-aids'] });
      
      toast({
        title: 'Dica recebida!',
        description: `Créditos restantes: ${data.creditsRemaining || 'N/A'}`,
      });
    },
    onError: (error) => {
      console.error('❌ Erro no Tutor AI:', error);
      toast({
        title: 'Erro no Tutor AI',
        description: error.message || 'Não foi possível obter a dica',
        variant: 'destructive'
      });
    }
  });

  return {
    helpAids,
    isLoading,
    consumeHelp: consumeHelpMutation.mutate,
    isConsumingHelp: consumeHelpMutation.isPending,
    getTutorHint: getTutorHintMutation.mutateAsync, // CORREÇÃO: usar mutateAsync para aguardar resultado
    isGettingHint: getTutorHintMutation.isPending,
    tutorHintData: getTutorHintMutation.data,
    tutorHintError: getTutorHintMutation.error
  };
}
