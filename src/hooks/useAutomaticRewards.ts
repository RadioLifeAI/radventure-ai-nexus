
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
          
          if (loginBonus && typeof loginBonus === 'object' && loginBonus.awarded) {
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

        // 4. PROCESSAR RECOMPENSAS DE COMPLETUDE DO PERFIL
        await processProfileCompletionRewards();

        // 5. ATUALIZAR PERFIL
        setTimeout(() => {
          refreshProfile();
        }, 1000);

      } catch (error) {
        console.error('Erro no processamento automático de recompensas:', error);
      }
    };

    const processProfileCompletionRewards = async () => {
      try {
        // Verificar campos obrigatórios preenchidos
        const requiredFields = [
          { field: 'full_name', value: profile.full_name, reward: 10 },
          { field: 'medical_specialty', value: profile.medical_specialty, reward: 15 },
          { field: 'academic_stage', value: profile.academic_stage, reward: 10 },
          { field: 'city', value: profile.city, reward: 5 },
          { field: 'state', value: profile.state, reward: 5 }
        ];

        for (const fieldInfo of requiredFields) {
          if (fieldInfo.value && fieldInfo.value.trim() !== '') {
            // Verificar se já foi recompensado por este campo
            const rewardKey = `profile_${fieldInfo.field}_rewarded`;
            const alreadyRewarded = profile.preferences?.[rewardKey] === true;

            if (!alreadyRewarded) {
              // Creditar RadCoins
              const { error: rewardError } = await supabase.rpc('award_radcoins', {
                p_user_id: user.id,
                p_amount: fieldInfo.reward,
                p_transaction_type: 'profile_completion',
                p_metadata: { field: fieldInfo.field, reward_amount: fieldInfo.reward }
              });

              if (!rewardError) {
                // Marcar como recompensado
                const updatedPreferences = {
                  ...profile.preferences,
                  [rewardKey]: true
                };

                await supabase
                  .from('profiles')
                  .update({ preferences: updatedPreferences })
                  .eq('id', user.id);

                toast({
                  title: '🎯 Perfil Completo!',
                  description: `+${fieldInfo.reward} RadCoins por preencher ${fieldInfo.field.replace('_', ' ')}`,
                  duration: 3000,
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao processar recompensas de perfil:', error);
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
