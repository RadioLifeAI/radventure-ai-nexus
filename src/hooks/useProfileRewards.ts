import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';
import { createNotification } from '@/utils/notifications';

export function useProfileRewards() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isProcessingRef = useRef(false);
  const lastExecutionTimeRef = useRef<number>(0);
  const processedFieldsRef = useRef<Set<string>>(new Set());

  const checkAndAwardProfileRewards = useCallback(async (profile: any) => {
    if (!user || !profile) {
      console.log('⚠️ Sem usuário ou perfil para verificar recompensas');
      return;
    }

    // CONTROLE SUPER RIGOROSO - Múltiplas verificações
    const now = Date.now();
    const MINIMUM_INTERVAL = 10 * 60 * 1000; // 10 minutos entre execuções
    
    if (now - lastExecutionTimeRef.current < MINIMUM_INTERVAL) {
      console.log('⏰ Intervalo mínimo não atingido, bloqueando execução');
      return;
    }

    if (isProcessingRef.current) {
      console.log('⏳ Já está processando recompensas, bloqueando execução');
      return;
    }

    // Verificar session storage para evitar execução dupla
    const sessionKey = `profile_rewards_check_${user.id}_${Date.now()}`;
    const existingSession = sessionStorage.getItem(`profile_rewards_${user.id}`);
    
    if (existingSession) {
      const sessionData = JSON.parse(existingSession);
      if (now - sessionData.timestamp < MINIMUM_INTERVAL) {
        console.log('🔒 Session storage bloqueia execução recente');
        return;
      }
    }

    try {
      // Marcar como processando IMEDIATAMENTE
      isProcessingRef.current = true;
      lastExecutionTimeRef.current = now;
      
      // Salvar no session storage
      sessionStorage.setItem(`profile_rewards_${user.id}`, JSON.stringify({
        sessionKey,
        timestamp: now
      }));
      
      console.log('🔍 Iniciando verificação DEFINITIVA de recompensas...');

      // ETAPA 1: Verificar transações existentes no banco - TODAS AS TRANSAÇÕES
      const { data: existingTransactions, error: transactionError } = await supabase
        .from('radcoin_transactions_log')
        .select('tx_type, metadata, created_at')
        .eq('user_id', user.id)
        .in('tx_type', ['profile_completion', 'profile_completion_bonus']); // SEM LIMITAÇÃO DE TEMPO

      if (transactionError) {
        console.error('❌ Erro ao buscar transações:', transactionError);
        return;
      }

      // Mapear campos já recompensados com type casting correto
      const rewardedFields = new Set<string>();
      let bonusAlreadyGiven = false;

      existingTransactions?.forEach(tx => {
        if (tx.tx_type === 'profile_completion' && tx.metadata) {
          // Type casting seguro para acessar metadata.field
          const metadata = tx.metadata as any;
          if (metadata?.field) {
            rewardedFields.add(metadata.field);
            console.log(`✓ Campo ${metadata.field} já recompensado`);
          }
        }
        if (tx.tx_type === 'profile_completion_bonus') {
          bonusAlreadyGiven = true;
          console.log('✓ Bônus de perfil completo já dado');
        }
      });

      // ETAPA 2: Definir recompensas e verificar condições atuais
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

      let totalNewRewards = 0;

      // ETAPA 3: Processar cada campo individualmente com controle rigoroso
      for (const field of rewardFields) {
        // Verificar se já foi recompensado
        if (rewardedFields.has(field.key)) {
          console.log(`⭕ Campo ${field.key} já recompensado - pulando`);
          continue;
        }

        // Verificar se condition está atendida
        if (!field.condition) {
          console.log(`❌ Campo ${field.key} não atende condição - pulando`);
          continue;
        }

        // Verificar se já foi processado nesta sessão
        if (processedFieldsRef.current.has(field.key)) {
          console.log(`🔒 Campo ${field.key} já processado nesta sessão - pulando`);
          continue;
        }

        // VERIFICAÇÃO ADICIONAL: Rate limiting por campo
        const fieldKey = `field_${field.key}_${user.id}`;
        const fieldLastExecution = sessionStorage.getItem(fieldKey);
        
        if (fieldLastExecution) {
          const lastTime = parseInt(fieldLastExecution);
          if (now - lastTime < 5 * 60 * 1000) { // 5 minutos por campo
            console.log(`⏰ Rate limit ativo para ${field.key}`);
            continue;
          }
        }

        console.log(`💰 Processando recompensa para ${field.key}: ${field.reward} RadCoins`);
        
        // Dar RadCoins usando a função do banco
        const { error: radcoinError } = await supabase.rpc('award_radcoins', {
          p_user_id: user.id,
          p_amount: field.reward,
          p_transaction_type: 'profile_completion',
          p_metadata: {
            field: field.key,
            description: field.description,
            processed_at: new Date().toISOString(),
            session_id: sessionKey,
            execution_timestamp: now
          }
        });

        if (radcoinError) {
          console.error(`❌ Erro ao dar RadCoins para ${field.key}:`, radcoinError);
          continue;
        }

        // Marcar como processado
        processedFieldsRef.current.add(field.key);
        sessionStorage.setItem(fieldKey, now.toString());
        totalNewRewards += field.reward;

        // Mostrar toast de recompensa
        toast({
          title: '🎉 RadCoins Ganhas!',
          description: `+${field.reward} RadCoins por ${field.description.toLowerCase()}`,
          duration: 3000,
        });

        // NOVA NOTIFICAÇÃO - Recompensa de Perfil
        await createNotification({
          userId: user.id,
          type: 'radcoin_reward',
          title: '📝 Perfil Atualizado!',
          message: `+${field.reward} RadCoins por ${field.description.toLowerCase()}`,
          priority: 'medium',
          actionUrl: '/app/estatisticas',
          actionLabel: 'Ver Perfil',
          metadata: {
            field: field.key,
            reward_amount: field.reward,
            description: field.description
          }
        });

        console.log(`✅ Recompensa de ${field.reward} RadCoins dada com sucesso para ${field.key}`);

        // Pequena pausa para evitar concorrência
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // ETAPA 4: Verificar bônus de perfil completo
      const allFieldsComplete = rewardFields.every(field => field.condition);

      if (allFieldsComplete && !bonusAlreadyGiven && !processedFieldsRef.current.has('completion_bonus')) {
        console.log('🏆 Perfil 100% completo! Processando bônus de 50 RadCoins');
        
        const { error: bonusError } = await supabase.rpc('award_radcoins', {
          p_user_id: user.id,
          p_amount: 50,
          p_transaction_type: 'profile_completion_bonus',
          p_metadata: {
            description: 'Bônus de perfil 100% completo',
            processed_at: new Date().toISOString(),
            session_id: sessionKey,
            execution_timestamp: now
          }
        });

        if (!bonusError) {
          processedFieldsRef.current.add('completion_bonus');
          totalNewRewards += 50;

          toast({
            title: '🏆 Bônus de Perfil Completo!',
            description: '+50 RadCoins por completar 100% do perfil!',
            duration: 4000,
          });

          // NOVA NOTIFICAÇÃO - Bônus de Perfil Completo
          await createNotification({
            userId: user.id,
            type: 'achievement_unlocked',
            title: '🏆 Perfil 100% Completo!',
            message: '+50 RadCoins por completar todas as informações do perfil!',
            priority: 'high',
            actionUrl: '/app/estatisticas',
            actionLabel: 'Ver Conquista',
            metadata: {
              achievement_type: 'profile_completion',
              bonus_amount: 50
            }
          });

          console.log('✅ Bônus de perfil completo dado com sucesso');
        } else {
          console.error('❌ Erro ao dar bônus de perfil completo:', bonusError);
        }
      }

      if (totalNewRewards > 0) {
        console.log(`🎉 Total de ${totalNewRewards} RadCoins creditadas nesta execução!`);
      } else {
        console.log('ℹ️ Nenhuma nova recompensa para dar nesta execução');
      }

    } catch (error) {
      console.error('❌ Erro ao processar recompensas de perfil:', error);
    } finally {
      isProcessingRef.current = false;
    }
  }, [user, toast]);

  return { checkAndAwardProfileRewards };
}
