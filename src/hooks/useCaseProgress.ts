
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./useAuth";
import { useCaseReviewStatus } from "./useCaseReviewStatus";
import { validateAnswer } from "@/utils/answerValidation";

export function useCaseProgress(caseId: string) {
  const [startTime] = useState(Date.now());
  const [helpUsed, setHelpUsed] = useState<string[]>([]);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [eliminationCount, setEliminationCount] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const { reviewStatus, isReview, previousAnswer, previousCorrect } = useCaseReviewStatus(caseId);

  const addHelpUsed = (helpType: string) => {
    setHelpUsed(prev => [...prev, helpType]);
  };

  const eliminateOption = (correctAnswerIndex: number, isFreeReview: boolean = false) => {
    if (isReview && !isFreeReview) {
      toast({
        title: "Modo Revisão",
        description: "Ajudas pagas não estão disponíveis em modo revisão. Use para estudar!",
        variant: "destructive"
      });
      return;
    }

    if (eliminationCount >= 2) {
      toast({
        title: "Limite atingido",
        description: "Você pode eliminar no máximo 2 alternativas por caso.",
        variant: "destructive"
      });
      return;
    }

    const availableOptions = [0, 1, 2, 3].filter(i => 
      i !== correctAnswerIndex && !eliminatedOptions.includes(i)
    );

    if (availableOptions.length === 0) {
      toast({
        title: "Não há alternativas para eliminar",
        description: "Todas as alternativas incorretas já foram eliminadas.",
        variant: "destructive"
      });
      return;
    }

    const randomIndex = availableOptions[Math.floor(Math.random() * availableOptions.length)];
    setEliminatedOptions(prev => [...prev, randomIndex]);
    setEliminationCount(prev => prev + 1);
    addHelpUsed("Eliminação");
    
    toast({
      title: "Alternativa eliminada",
      description: `Uma alternativa incorreta foi removida. ${isFreeReview ? '(Gratuito em revisão)' : `Usos restantes: ${2 - eliminationCount - 1}`}`,
    });
  };

  const skipCase = () => {
    if (isReview) {
      toast({
        title: "Modo Revisão",
        description: "Pular não está disponível em modo revisão. Use para estudar!",
        variant: "destructive"
      });
      return;
    }

    addHelpUsed("Pular");
    toast({
      title: "Caso pulado",
      description: "Você pulou este caso. Pontos foram deduzidos.",
    });
  };

  const useAIHint = async () => {
    if (isReview) {
      toast({
        title: "Modo Revisão",
        description: "Tutor AI pago não está disponível em revisão. Use para estudar!",
        variant: "destructive"
      });
      return;
    }

    addHelpUsed("Dica IA");
    toast({
      title: "Dica IA ativada",
      description: "Analisando o caso para fornecer uma dica...",
    });
  };

  const calculatePenalties = (basePoints: number) => {
    let totalPenalty = 0;
    
    helpUsed.forEach(helpType => {
      switch (helpType) {
        case "Eliminação":
          totalPenalty += Math.floor(basePoints * 0.20);
          break;
        case "Pular":
          totalPenalty += Math.floor(basePoints * 0.50);
          break;
        case "Dica IA":
          totalPenalty += Math.floor(basePoints * 0.10);
          break;
      }
    });
    
    return totalPenalty;
  };

  const calculatePoints = (basePoints: number, isCorrect: boolean) => {
    if (!isCorrect) return 0;
    
    // Zero pontos em modo revisão
    if (isReview) return 0;
    
    const penalties = calculatePenalties(basePoints);
    const finalPoints = Math.max(0, basePoints - penalties);
    
    console.log('📊 Cálculo de pontos:', {
      basePoints,
      penalties,
      finalPoints,
      helpUsed,
      isReview
    });
    
    return finalPoints;
  };

  const submitAnswer = async (selectedIndex: number, case_: any) => {
    if (isAnswered || !user) return;
    
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - startTime) / 1000);
    
    // CORREÇÃO CRÍTICA: Validação baseada em texto quando há embaralhamento
    let isCorrect = false;
    let selectedText = '';
    let correctText = '';
    
    if (case_.shuffled_selected_text && case_.shuffled_correct_text) {
      // Caso embaralhado: usar textos das alternativas embaralhadas
      selectedText = case_.shuffled_selected_text;
      correctText = case_.shuffled_correct_text;
      isCorrect = validateAnswer(
        selectedIndex,
        selectedText,
        case_.shuffled_correct_index || 0,
        correctText
      );
      
      console.log('🔄 Validação embaralhada:', {
        selectedIndex,
        selectedText,
        correctText,
        shuffledCorrectIndex: case_.shuffled_correct_index,
        isCorrect
      });
    } else {
      // Caso não embaralhado: usar validação normal
      selectedText = case_.answer_options?.[selectedIndex] || '';
      correctText = case_.answer_options?.[case_.correct_answer_index] || '';
      isCorrect = validateAnswer(
        selectedIndex,
        selectedText,
        case_.correct_answer_index,
        correctText
      );
      
      console.log('📝 Validação normal:', {
        selectedIndex,
        selectedText,
        correctIndex: case_.correct_answer_index,
        correctText,
        isCorrect
      });
    }
    
    const basePoints = case_.points || 10;
    const points = calculatePoints(basePoints, isCorrect);
    const penalties = calculatePenalties(basePoints);

    setIsAnswered(true);

    console.log('🎯 Submissão de resposta:', {
      selectedIndex,
      isCorrect,
      basePoints,
      penalties,
      finalPoints: points,
      helpUsed,
      isReview: isReview ? 'SIM' : 'NÃO'
    });

    try {
      // Usar a função RPC atualizada e limpa
      const { error } = await supabase.rpc('process_case_completion', {
        p_user_id: user.id,
        p_case_id: caseId,
        p_points: points,
        p_is_correct: isCorrect
      });

      if (error) {
        console.error('❌ Erro na função process_case_completion:', error);
        throw error;
      }

      console.log('✅ Caso processado com sucesso:', { 
        isCorrect, 
        points, 
        penalties, 
        isReview: isReview ? 'SIM (0 pontos)' : 'NÃO',
        message: isReview ? 'Revisão registrada para estudo' : 'Pontos creditados'
      });

      if (isReview) {
        toast({
          title: "Modo Revisão",
          description: "Resposta registrada para estudo, sem pontuação adicional.",
        });
      } else if (isCorrect && points > 0) {
        toast({
          title: "Parabéns!",
          description: `Resposta correta! +${points} pontos creditados.`,
        });
      } else if (isCorrect && points === 0) {
        toast({
          title: "Resposta Correta",
          description: "Acertou, mas sem pontos devido às penalidades.",
        });
      } else {
        toast({
          title: "Resposta Incorreta",
          description: "Não desista! Revise e tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao processar caso:', error);
      toast({
        title: "Erro ao processar resposta",
        description: "Sua resposta pode não ter sido registrada. Tente novamente.",
        variant: "destructive"
      });
    }

    return {
      isCorrect, // Agora é a fonte única de verdade
      points,
      basePoints,
      penalties,
      timeSpent,
      helpUsed,
      selectedIndex,
      answerFeedbacks: case_.answer_feedbacks,
      eliminatedOptions,
      eliminationCount,
      isReview,
      previousAnswer,
      previousCorrect
    };
  };

  return {
    helpUsed,
    eliminatedOptions,
    eliminationCount,
    isAnswered,
    eliminateOption,
    skipCase,
    useAIHint,
    submitAnswer,
    startTime,
    canEliminate: eliminationCount < 2,
    isReview,
    reviewStatus,
    previousAnswer,
    previousCorrect
  };
}
