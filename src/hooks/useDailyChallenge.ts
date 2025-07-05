import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface DailyChallenge {
  id: string;
  question: string;
  explanation: string;
  community_stats: {
    total_responses: number;
    correct_responses: number;
  };
  challenge_date: string;
}

interface ChallengeResult {
  was_correct: boolean;
  correct_answer: boolean;
  explanation: string;
  community_stats: {
    total_responses: number;
    correct_responses: number;
  };
  radcoins_awarded: number;
}

export function useDailyChallenge() {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const { toast } = useToast();

  // Verificar se há desafio pendente para o usuário
  const checkDailyChallenge = async (userId: string) => {
    if (!userId) {
      console.log('❌ DAILY CHALLENGE: userId inválido');
      return;
    }
    
    console.log('🔍 DAILY CHALLENGE: Iniciando verificação para usuário:', userId.slice(0, 8) + '...');
    
    try {
      setIsLoading(true);
      
      // Aguardar um pouco para garantir que o usuário está autenticado
      console.log('⏳ DAILY CHALLENGE: Aguardando autenticação...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verificar novamente se o usuário ainda está autenticado
      const { data: currentUser, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ DAILY CHALLENGE: Erro de autenticação:', authError);
        return;
      }
      
      if (!currentUser.user || currentUser.user.id !== userId) {
        console.log('❌ DAILY CHALLENGE: Usuário não autenticado na verificação');
        return;
      }
      
      console.log('✅ DAILY CHALLENGE: Usuário autenticado, chamando função RPC...');
      
      // Chamar função do Supabase para buscar desafio do dia
      const { data, error } = await supabase.rpc('get_daily_challenge_for_user', {
        p_user_id: userId
      });

      console.log('📡 DAILY CHALLENGE: Resposta do RPC:', { 
        hasData: !!data, 
        dataType: typeof data,
        error: error?.message,
        errorCode: error?.code
      });

      if (error) {
        console.error('❌ DAILY CHALLENGE: Erro na função RPC:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return;
      }

      if (data) {
        const challengeData = data as unknown as DailyChallenge;
        console.log('📋 DAILY CHALLENGE: Dados recebidos:', {
          id: challengeData.id?.slice(0, 8) + '...',
          hasQuestion: !!challengeData.question,
          questionLength: challengeData.question?.length,
          challengeDate: challengeData.challenge_date
        });
        
        console.log('📅 DAILY CHALLENGE: Processando desafio:', challengeData.id?.slice(0, 8) + '...');
        
        // Definir challenge e showModal
        setChallenge(challengeData);
        
        // Usar setTimeout para garantir que o state seja atualizado
        setTimeout(() => {
          setShowModal(true);
          console.log('✅ DAILY CHALLENGE: Modal ativado para challenge:', challengeData.id?.slice(0, 8) + '...');
        }, 100);
        
      } else {
        console.log('ℹ️ DAILY CHALLENGE: Nenhum desafio pendente para hoje (usuário já respondeu ou não há desafio ativo)');
        setChallenge(null);
        setShowModal(false);
      }
    } catch (error: any) {
      console.error('❌ DAILY CHALLENGE: Erro crítico na verificação:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    } finally {
      setIsLoading(false);
      console.log('🏁 DAILY CHALLENGE: Verificação finalizada');
    }
  };

  // Submeter resposta do desafio
  const submitAnswer = async (userAnswer: boolean) => {
    if (!challenge) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase.rpc('submit_daily_challenge', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_challenge_id: challenge.id,
        p_user_answer: userAnswer
      });

      if (error) {
        throw error;
      }

      const resultData = data as unknown as ChallengeResult;
      setResult(resultData);
      setHasAnswered(true);

      // Toast de recompensa
      toast({
        title: '🎉 Desafio Respondido!',
        description: `Você ganhou ${resultData.radcoins_awarded} RadCoins!`,
        duration: 3000,
      });

      console.log('✅ Resposta submetida:', data);
    } catch (error) {
      console.error('Erro ao submeter resposta:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível submeter sua resposta. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fechar modal
  const closeModal = () => {
    setShowModal(false);
    setChallenge(null);
    setResult(null);
    setHasAnswered(false);
  };

  // Calcular estatísticas da comunidade
  const getCommunityStats = () => {
    if (!result) return null;
    
    const { total_responses, correct_responses } = result.community_stats;
    if (total_responses === 0) return null;
    
    const correctPercentage = Math.round((correct_responses / total_responses) * 100);
    const incorrectPercentage = 100 - correctPercentage;
    
    return {
      correctPercentage,
      incorrectPercentage,
      totalResponses: total_responses
    };
  };

  return {
    challenge,
    isLoading,
    hasAnswered,
    showModal,
    result,
    checkDailyChallenge,
    submitAnswer,
    closeModal,
    getCommunityStats
  };
}