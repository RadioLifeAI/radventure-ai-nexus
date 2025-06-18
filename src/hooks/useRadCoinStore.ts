
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './useAuth';

interface StoreItem {
  type: 'elimination' | 'skip' | 'ai_tutor';
  quantity: number;
  radcoin_cost: number;
  popular?: boolean;
  bonus?: string;
}

export function useRadCoinStore() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Itens da loja baseados na imagem fornecida
  const storeItems: StoreItem[] = [
    { type: 'elimination', quantity: 10, radcoin_cost: 50 },
    { type: 'elimination', quantity: 30, radcoin_cost: 120, popular: true, bonus: '20% de desconto' },
    { type: 'elimination', quantity: 40, radcoin_cost: 150, bonus: '25% de desconto' },
    { type: 'skip', quantity: 10, radcoin_cost: 80 },
    { type: 'skip', quantity: 30, radcoin_cost: 200, popular: true, bonus: '17% de desconto' },
    { type: 'skip', quantity: 40, radcoin_cost: 250, bonus: '22% de desconto' },
    { type: 'ai_tutor', quantity: 10, radcoin_cost: 100 },
    { type: 'ai_tutor', quantity: 30, radcoin_cost: 250, popular: true, bonus: '17% de desconto' },
    { type: 'ai_tutor', quantity: 40, radcoin_cost: 320, bonus: '20% de desconto' },
  ];

  const { data: userBalance } = useQuery({
    queryKey: ['user-radcoin-balance', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('radcoin_balance')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data.radcoin_balance || 0;
    },
    enabled: !!user?.id,
  });

  const purchaseHelpMutation = useMutation({
    mutationFn: async ({ type, quantity, cost }: { type: string, quantity: number, cost: number }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Use the custom SQL function we created
      const { data, error } = await supabase
        .rpc('purchase_help_aids', {
          p_user_id: user.id,
          p_aid_type: type,
          p_quantity: quantity,
          p_radcoin_cost: cost
        });

      if (error) throw error;
      if (!data) throw new Error('Saldo insuficiente de RadCoins');

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-radcoin-balance'] });
      queryClient.invalidateQueries({ queryKey: ['user-help-aids'] });
      
      const typeNames = {
        elimination: 'Eliminação',
        skip: 'Pular',
        ai_tutor: 'Tutor AI'
      };
      
      toast({
        title: 'Compra realizada!',
        description: `${variables.quantity}x ${typeNames[variables.type as keyof typeof typeNames]} adicionadas ao seu inventário.`
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro na compra',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    storeItems,
    userBalance: userBalance || 0,
    purchaseHelp: purchaseHelpMutation.mutate,
    isPurchasing: purchaseHelpMutation.isPending
  };
}
