
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./useAuth";
import { useCaseReviewStatus } from "./useCaseReviewStatus";

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

  // Função para eliminar opção - bloqueada em modo revisão se não for gratuita
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

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');
  };

  const submitAnswer = async (selectedIndex: number, case_: any) => {
    if (isAnswered || !user) return;
    
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - startTime) / 1000);
    
    let isCorrect = false;
    
    if (selectedIndex === case_.correct_answer_index) {
      isCorrect = true;
    } else {
      const selectedText = case_.answer_options?.[selectedIndex] || '';
      const correctText = case_.answer_options?.[case_.correct_answer_index] || '';
      
      if (selectedText && correctText && normalizeText(selectedText) === normalizeText(correctText)) {
        isCorrect = true;
      }
    }
    
    const basePoints = case_.points || 10;
    const points = calculatePoints(basePoints, isCorrect);
    const penalties = calculatePenalties(basePoints);

    setIsAnswered(true);

    console.log('Debug submitAnswer:', {
      selectedIndex,
      isCorrect,
      basePoints,
      penalties,
      finalPoints: points,
      helpUsed,
      isReview
    });

    try {
      // Usar a função RPC atualizada que trata revisões
      await supabase.rpc('process_case_completion', {
        p_user_id: user.id,
        p_case_id: caseId,
        p_points: points,
        p_is_correct: isCorrect
      });

      console.log('✅ Resposta salva com sucesso:', { 
        isCorrect, 
        points, 
        penalties, 
        isReview: isReview ? 'SIM' : 'NÃO' 
      });

      if (isReview) {
        toast({
          title: "Modo Revisão",
          description: "Resposta registrada para estudo, sem pontuação adicional.",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao salvar conclusão do caso:', error);
      toast({
        title: "Erro ao salvar resposta",
        description: "Sua resposta pode não ter sido registrada. Tente novamente.",
        variant: "destructive"
      });
    }

    return {
      isCorrect,
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
    // Novos campos para revisão
    isReview,
    reviewStatus,
    previousAnswer,
    previousCorrect
  };
}
