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
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      // Chamar função do Supabase para buscar desafio do dia
      const { data, error } = await supabase.rpc('get_daily_challenge_for_user', {
        p_user_id: userId
      });

      if (error) {
        console.error('Erro ao buscar desafio diário:', error);
        return;
      }

      if (data) {
        const challengeData = data as unknown as DailyChallenge;
        setChallenge(challengeData);
        setShowModal(true);
        console.log('📅 Desafio diário encontrado:', challengeData.id);
      } else {
        console.log('✅ Nenhum desafio pendente para hoje');
      }
    } catch (error) {
      console.error('Erro na verificação do desafio diário:', error);
    } finally {
      setIsLoading(false);
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