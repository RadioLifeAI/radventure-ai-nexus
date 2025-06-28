
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';

export function useProfileRewards() {
  const { user } = useAuth();
  const { toast } = useToast();

  const checkAndAwardProfileRewards = async (profile: any) => {
    if (!user || !profile) return;

    try {
      // Definir recompensas por campo completado
      const rewardFields = [
        { 
          key: 'full_name_reward', 
          condition: !!profile.full_name, 
          reward: 10,
          description: 'Nome completo preenchido'
        },
        { 
          key: 'location_reward', 
          condition: !!(profile.city && profile.state), 
          reward: 15,
          description: 'Localização preenchida'
        },
        { 
          key: 'medical_specialty_reward', 
          condition: !!profile.medical_specialty, 
          reward: 20,
          description: 'Especialidade médica preenchida'
        },
        { 
          key: 'academic_info_reward', 
          condition: !!(profile.academic_stage && profile.college), 
          reward: 25,
          description: 'Informações acadêmicas preenchidas'
        },
        { 
          key: 'birthdate_reward', 
          condition: !!profile.birthdate, 
          reward: 10,
          description: 'Data de nascimento preenchida'
        },
        { 
          key: 'bio_reward', 
          condition: !!(profile.bio && profile.bio.length > 20), 
          reward: 15,
          description: 'Biografia preenchida'
        }
      ];

      // Verificar quais recompensas já foram dadas
      const currentPreferences = profile.preferences || {};
      const profileRewards = currentPreferences.profile_rewards || {};

      for (const field of rewardFields) {
        const alreadyRewarded = profileRewards[field.key];
        
        if (field.condition && !alreadyRewarded) {
          // Dar RadCoins
          await supabase.rpc('award_radcoins', {
            p_user_id: user.id,
            p_amount: field.reward,
            p_transaction_type: 'profile_completion',
            p_metadata: {
              field: field.key,
              description: field.description
            }
          });

          // Marcar como recompensado
          const updatedRewards = {
            ...profileRewards,
            [field.key]: true
          };

          await supabase
            .from('profiles')
            .update({
              preferences: {
                ...currentPreferences,
                profile_rewards: updatedRewards
              }
            })
            .eq('id', user.id);

          // Mostrar toast de recompensa
          toast({
            title: '🎉 RadCoins Ganhas!',
            description: `+${field.reward} RadCoins por ${field.description.toLowerCase()}`,
            duration: 3000,
          });
        }
      }

      // Verificar se perfil está 100% completo para bônus adicional
      const allFieldsComplete = rewardFields.every(field => field.condition);
      const completionBonusGiven = profileRewards.completion_bonus;

      if (allFieldsComplete && !completionBonusGiven) {
        await supabase.rpc('award_radcoins', {
          p_user_id: user.id,
          p_amount: 50,
          p_transaction_type: 'profile_completion_bonus',
          p_metadata: {
            description: 'Bônus de perfil 100% completo'
          }
        });

        await supabase
          .from('profiles')
          .update({
            preferences: {
              ...currentPreferences,
              profile_rewards: {
                ...profileRewards,
                completion_bonus: true
              }
            }
          })
          .eq('id', user.id);

        toast({
          title: '🏆 Bônus de Perfil Completo!',
          description: '+50 RadCoins por completar 100% do perfil!',
          duration: 4000,
        });
      }

    } catch (error) {
      console.error('Erro ao processar recompensas de perfil:', error);
    }
  };

  return { checkAndAwardProfileRewards };
}
