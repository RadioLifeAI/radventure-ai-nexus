
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';

export function useProfileRewards() {
  const { user } = useAuth();
  const { toast } = useToast();

  const checkAndAwardProfileRewards = async (profile: any) => {
    if (!user || !profile) {
      console.log('⚠️ Sem usuário ou perfil para verificar recompensas');
      return;
    }

    try {
      console.log('🎯 Iniciando verificação de recompensas para:', profile.email);

      // Definir recompensas por campo completado
      const rewardFields = [
        { 
          key: 'full_name_reward', 
          condition: !!(profile.full_name && profile.full_name.trim().length > 0), 
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
          condition: !!(profile.medical_specialty && profile.medical_specialty.trim().length > 0), 
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
          condition: !!(profile.bio && profile.bio.trim().length > 20), 
          reward: 15,
          description: 'Biografia preenchida'
        }
      ];

      // Verificar quais recompensas já foram dadas
      const currentPreferences = profile.preferences || {};
      const profileRewards = currentPreferences.profile_rewards || {};

      let totalNewRewards = 0;

      for (const field of rewardFields) {
        const alreadyRewarded = profileRewards[field.key];
        
        console.log(`🔍 Campo ${field.key}:`, {
          condition: field.condition,
          alreadyRewarded,
          reward: field.reward
        });
        
        if (field.condition && !alreadyRewarded) {
          console.log(`💰 Dando ${field.reward} RadCoins por ${field.description}`);
          
          // Dar RadCoins usando a função do banco
          const { error: radcoinError } = await supabase.rpc('award_radcoins', {
            p_user_id: user.id,
            p_amount: field.reward,
            p_transaction_type: 'profile_completion',
            p_metadata: {
              field: field.key,
              description: field.description
            }
          });

          if (radcoinError) {
            console.error('❌ Erro ao dar RadCoins:', radcoinError);
            continue;
          }

          // Marcar como recompensado
          const updatedRewards = {
            ...profileRewards,
            [field.key]: true
          };

          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              preferences: {
                ...currentPreferences,
                profile_rewards: updatedRewards
              },
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

          if (updateError) {
            console.error('❌ Erro ao marcar recompensa:', updateError);
            continue;
          }

          totalNewRewards += field.reward;

          // Mostrar toast de recompensa
          toast({
            title: '🎉 RadCoins Ganhas!',
            description: `+${field.reward} RadCoins por ${field.description.toLowerCase()}`,
            duration: 3000,
          });

          console.log(`✅ Recompensa de ${field.reward} RadCoins dada com sucesso`);
        }
      }

      // Verificar se perfil está 100% completo para bônus adicional
      const allFieldsComplete = rewardFields.every(field => field.condition);
      const completionBonusGiven = profileRewards.completion_bonus;

      if (allFieldsComplete && !completionBonusGiven) {
        console.log('🏆 Perfil 100% completo! Dando bônus de 50 RadCoins');
        
        const { error: bonusError } = await supabase.rpc('award_radcoins', {
          p_user_id: user.id,
          p_amount: 50,
          p_transaction_type: 'profile_completion_bonus',
          p_metadata: {
            description: 'Bônus de perfil 100% completo'
          }
        });

        if (!bonusError) {
          await supabase
            .from('profiles')
            .update({
              preferences: {
                ...currentPreferences,
                profile_rewards: {
                  ...profileRewards,
                  completion_bonus: true
                }
              },
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

          totalNewRewards += 50;

          toast({
            title: '🏆 Bônus de Perfil Completo!',
            description: '+50 RadCoins por completar 100% do perfil!',
            duration: 4000,
          });

          console.log('✅ Bônus de perfil completo dado com sucesso');
        }
      }

      if (totalNewRewards > 0) {
        console.log(`🎉 Total de ${totalNewRewards} RadCoins creditadas!`);
      } else {
        console.log('ℹ️ Nenhuma nova recompensa para dar');
      }

    } catch (error) {
      console.error('❌ Erro ao processar recompensas de perfil:', error);
    }
  };

  return { checkAndAwardProfileRewards };
}
