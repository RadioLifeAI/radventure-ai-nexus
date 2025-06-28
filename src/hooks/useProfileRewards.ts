
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';

export function useProfileRewards() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isProcessingRef = useRef(false);
  const lastProcessedRef = useRef<string>('');
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  const checkAndAwardProfileRewards = useCallback(async (profile: any) => {
    if (!user || !profile) {
      console.log('⚠️ Sem usuário ou perfil para verificar recompensas');
      return;
    }

    // Gerar hash único do perfil para detectar mudanças reais
    const profileHash = JSON.stringify({
      full_name: profile.full_name,
      city: profile.city,
      state: profile.state,
      medical_specialty: profile.medical_specialty,
      academic_stage: profile.academic_stage,
      college: profile.college,
      birthdate: profile.birthdate,
      bio: profile.bio
    });

    // Verificar se já processou este estado exato
    if (lastProcessedRef.current === profileHash) {
      console.log('🔄 Perfil já processado com este estado, ignorando...');
      return;
    }

    // Verificar se já está processando (mutex simples)
    if (isProcessingRef.current) {
      console.log('⏳ Já está processando recompensas, aguardando...');
      return;
    }

    // Limpar timeout anterior se existir
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce de 2 segundos para evitar execuções muito próximas
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        isProcessingRef.current = true;
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
                description: field.description,
                processed_at: new Date().toISOString(),
                profile_hash: profileHash
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
              description: 'Bônus de perfil 100% completo',
              processed_at: new Date().toISOString(),
              profile_hash: profileHash
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

        // Marcar como processado
        lastProcessedRef.current = profileHash;

      } catch (error) {
        console.error('❌ Erro ao processar recompensas de perfil:', error);
      } finally {
        isProcessingRef.current = false;
      }
    }, 2000); // Debounce de 2 segundos
  }, [user, toast]);

  // Cleanup do timeout no unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return { checkAndAwardProfileRewards };
}
