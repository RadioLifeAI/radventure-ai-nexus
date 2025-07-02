
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useUserProfile } from './useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ProfileField {
  field: string;
  value: any;
  reward: number;
  description: string;
}

export function useProfileRewards() {
  const { user } = useAuth();
  const { profile, refreshProfile } = useUserProfile();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.id || !profile) return;

    const checkAndRewardProfileCompletion = async () => {
      try {
        // Campos obrigatórios e suas recompensas
        const profileFields: ProfileField[] = [
          { 
            field: 'full_name', 
            value: profile.full_name, 
            reward: 10, 
            description: 'Nome Completo' 
          },
          { 
            field: 'medical_specialty', 
            value: profile.medical_specialty, 
            reward: 15, 
            description: 'Especialidade Médica' 
          },
          { 
            field: 'academic_stage', 
            value: profile.academic_stage, 
            reward: 10, 
            description: 'Estágio Acadêmico' 
          },
          { 
            field: 'city', 
            value: profile.city, 
            reward: 5, 
            description: 'Cidade' 
          },
          { 
            field: 'state', 
            value: profile.state, 
            reward: 5, 
            description: 'Estado' 
          },
          { 
            field: 'bio', 
            value: profile.bio, 
            reward: 8, 
            description: 'Biografia' 
          },
          { 
            field: 'college', 
            value: profile.college, 
            reward: 12, 
            description: 'Instituição de Ensino' 
          }
        ];

        for (const fieldInfo of profileFields) {
          if (fieldInfo.value && String(fieldInfo.value).trim() !== '') {
            const rewardKey = `profile_${fieldInfo.field}_rewarded`;
            
            // Verificar se já foi recompensado
            const preferences = profile.preferences as Record<string, any> || {};
            const alreadyRewarded = preferences[rewardKey] === true;

            if (!alreadyRewarded) {
              // Creditar RadCoins
              const { error: rewardError } = await supabase.rpc('award_radcoins', {
                p_user_id: user.id,
                p_amount: fieldInfo.reward,
                p_transaction_type: 'profile_completion',
                p_metadata: { 
                  field: fieldInfo.field, 
                  reward_amount: fieldInfo.reward,
                  description: fieldInfo.description
                }
              });

              if (!rewardError) {
                // Marcar como recompensado
                const updatedPreferences = {
                  ...preferences,
                  [rewardKey]: true
                };

                await supabase
                  .from('profiles')
                  .update({ preferences: updatedPreferences })
                  .eq('id', user.id);

                // Mostrar notificação
                toast({
                  title: '🎯 Perfil Completo!',
                  description: `+${fieldInfo.reward} RadCoins por preencher: ${fieldInfo.description}`,
                  duration: 4000,
                });

                console.log(`Recompensa creditada: ${fieldInfo.reward} RadCoins por ${fieldInfo.description}`);
              } else {
                console.error('Erro ao creditar recompensa:', rewardError);
              }
            }
          }
        }

        // Verificar completude geral do perfil (bônus extra)
        const completedFields = profileFields.filter(f => f.value && String(f.value).trim() !== '');
        const completionPercentage = (completedFields.length / profileFields.length) * 100;

        if (completionPercentage === 100) {
          const fullCompletionKey = 'profile_full_completion_rewarded';
          const preferences = profile.preferences as Record<string, any> || {};
          
          if (!preferences[fullCompletionKey]) {
            // Bônus por perfil 100% completo
            const { error: bonusError } = await supabase.rpc('award_radcoins', {
              p_user_id: user.id,
              p_amount: 25,
              p_transaction_type: 'profile_completion',
              p_metadata: { 
                type: 'full_completion_bonus',
                completion_percentage: 100
              }
            });

            if (!bonusError) {
              const updatedPreferences = {
                ...preferences,
                [fullCompletionKey]: true
              };

              await supabase
                .from('profiles')
                .update({ preferences: updatedPreferences })
                .eq('id', user.id);

              toast({
                title: '🏆 Perfil 100% Completo!',
                description: '+25 RadCoins de bônus por completar todo o perfil!',
                duration: 5000,
              });
            }
          }
        }

      } catch (error) {
        console.error('Erro ao processar recompensas de perfil:', error);
      }
    };

    // Executar verificação após pequeno delay
    const timeoutId = setTimeout(checkAndRewardProfileCompletion, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [user?.id, profile, toast]);

  return {
    // Função para forçar re-verificação das recompensas
    recheckRewards: () => {
      if (profile) {
        refreshProfile();
      }
    }
  };
}
