import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { createNotification } from '@/utils/notifications';

interface PurchaseItem {
  id: string;
  name: string;
  price?: number;
  salePrice?: number;
  benefits: {
    elimination_aids?: number;
    skip_aids?: number;
    ai_tutor_credits?: number;
  };
  discount?: number;
}

export function useRadCoinPurchase() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const executePurchase = async (item: PurchaseItem, finalPrice: number) => {
    if (!user?.id) throw new Error('Usuário não autenticado');

    // Verificar saldo
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('radcoin_balance')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    const currentBalance = profile?.radcoin_balance || 0;
    if (currentBalance < finalPrice) {
      throw new Error('Saldo insuficiente de RadCoins');
    }

    // Transação atômica: debitar RadCoins
    const { error: debitError } = await supabase
      .from('profiles')
      .update({ 
        radcoin_balance: currentBalance - finalPrice,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (debitError) throw debitError;

    // Creditar benefícios usando função segura
    const { error: benefitsError } = await supabase.rpc('add_help_aids', {
      p_user_id: user.id,
      p_elimination_aids: item.benefits.elimination_aids || 0,
      p_skip_aids: item.benefits.skip_aids || 0,
      p_ai_tutor_credits: item.benefits.ai_tutor_credits || 0
    });

    if (benefitsError) {
      console.error('Erro ao adicionar benefícios:', benefitsError);
      // Reverter débito em caso de erro
      await supabase
        .from('profiles')
        .update({ radcoin_balance: currentBalance })
        .eq('id', user.id);
      throw new Error('Erro ao creditar benefícios. Transação revertida.');
    }

    // Registrar transação
    await supabase
      .from('radcoin_transactions_log')
      .insert({
        user_id: user.id,
        tx_type: 'help_purchase',
        amount: -finalPrice,
        balance_after: currentBalance - finalPrice,
        metadata: {
          item_id: item.id,
          item_name: item.name,
          benefits: item.benefits
        }
      });

    return { success: true };
  };

  const purchaseMutation = useMutation({
    mutationFn: async (item: PurchaseItem) => {
      const finalPrice = item.salePrice ?? (item.discount 
        ? Math.floor((item.price || 0) * (1 - item.discount / 100))
        : item.price || 0);
      
      return executePurchase(item, finalPrice);
    },
    onSuccess: async (_, item) => {
      toast.success(`"${item.name}" adquirido com sucesso! 🎉`, {
        description: 'Seus benefícios foram adicionados à sua conta.',
        duration: 5000
      });
      
      // NOVA NOTIFICAÇÃO - Compra RadCoin
      if (user?.id) {
        await createNotification({
          userId: user.id,
          type: 'radcoin_reward',
          title: '💰 Compra Realizada!',
          message: `"${item.name}" foi adquirido com sucesso. Seus benefícios foram creditados!`,
          priority: 'high',
          actionUrl: '/app/estatisticas',
          actionLabel: 'Ver Benefícios',
          metadata: {
            item_name: item.name,
            benefits: item.benefits
          }
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-help-aids'] });
    },
    onError: (error: any) => {
      console.error('Erro na compra:', error);
      toast.error('Erro na compra', {
        description: error.message || 'Tente novamente em alguns instantes.',
        duration: 5000
      });
    }
  });

  return {
    purchaseItem: purchaseMutation.mutate,
    isPurchasing: purchaseMutation.isPending
  };
}
