
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useSubscriptionBenefits } from './useSubscriptionBenefits';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useSubscriptionRewards() {
  const { user } = useAuth();
  const { benefits } = useSubscriptionBenefits();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.id || !benefits.hasActivePlan) return;

    const checkSubscriptionRewards = async () => {
      try {
        // Verificar se já recebeu recompensas mensais
        const lastRewardKey = `sub_reward_${user.id}_${new Date().getMonth()}_${new Date().getFullYear()}`;
        const hasReceivedThisMonth = localStorage.getItem(lastRewardKey);

        if (!hasReceivedThisMonth && benefits.monthlyRadcoins > 0) {
          // Conceder RadCoins mensais
          const { error } = await supabase.rpc('award_radcoins', {
            p_user_id: user.id,
            p_amount: benefits.monthlyRadcoins,
            p_transaction_type: 'subscription_monthly',
            p_metadata: { plan: benefits.planName }
          });

          if (!error) {
            localStorage.setItem(lastRewardKey, 'received');
            
            toast({
              title: '🌟 Bônus de Assinatura!',
              description: `+${benefits.monthlyRadcoins} RadCoins mensais do plano ${benefits.planName}`,
              duration: 5000,
            });
          }
        }

        // Sincronizar ajudas baseadas na assinatura
        if (benefits.eliminationAids > 3 || benefits.skipAids > 1 || benefits.aiTutorCredits > 2) {
          await supabase.rpc('add_help_aids', {
            p_user_id: user.id,
            p_elimination_aids: Math.max(0, benefits.eliminationAids - 3),
            p_skip_aids: Math.max(0, benefits.skipAids - 1),
            p_ai_tutor_credits: Math.max(0, benefits.aiTutorCredits - 2)
          });
        }

      } catch (error) {
        console.error('Erro ao processar recompensas de assinatura:', error);
      }
    };

    checkSubscriptionRewards();
  }, [user?.id, benefits, toast]);

  return null;
}
