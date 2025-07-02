
import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { useUserProfile } from './useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Interface para tipagem da resposta do RPC
interface DailyLoginBonusResponse {
  awarded: boolean;
  radcoins?: number;
  streak?: number;
  message?: string;
}

export function useAutomaticRewards() {
  const { user } = useAuth();
  const { profile, refreshProfile } = useUserProfile();
  const { toast } = useToast();
  const hasProcessedRewardsRef = useRef(false);

  useEffect(() => {
    if (!user?.id || !profile || hasProcessedRewardsRef.current) return;

    const processAutomaticRewards = async () => {
      try {
        hasProcessedRewardsRef.current = true;

        // 1. BÔNUS DE LOGIN DIÁRIO
        const { data: loginBonusData, error: loginError } = await supabase.rpc('award_daily_login_bonus', {
          p_user_id: user.id
        });

        if (!loginError && loginBonusData) {
          // Type casting seguro para a resposta
          const loginBonus = loginBonusData as unknown as DailyLoginBonusResponse;
          
          if (loginBonus.awarded) {
            toast({
              title: '🎉 Bônus de Login Diário!',
              description: `+${loginBonus.radcoins || 0} RadCoins | Streak: ${loginBonus.streak || 0} dias`,
              duration: 4000,
            });
          }
        }

        // 2. SINCRONIZAR BENEFÍCIOS DE ASSINATURA
        const { error: subscriptionError } = await supabase.rpc('sync_subscription_benefits', {
          p_user_id: user.id
        });

        if (subscriptionError) {
          console.error('Erro ao sincronizar benefícios de assinatura:', subscriptionError);
        }

        // 3. ATUALIZAR AJUDAS DIÁRIAS
        const { error: refillError } = await supabase.rpc('refill_daily_help_aids');
        if (refillError) {
          console.error('Erro ao recarregar ajudas diárias:', refillError);
        }

        // 4. ATUALIZAR PERFIL
        setTimeout(() => {
          refreshProfile();
        }, 1000);

      } catch (error) {
        console.error('Erro no processamento automático de recompensas:', error);
      }
    };

    // Delay para garantir que o perfil foi carregado
    const timeoutId = setTimeout(processAutomaticRewards, 2000);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [user?.id, profile?.id, toast, refreshProfile]);

  return null;
}
