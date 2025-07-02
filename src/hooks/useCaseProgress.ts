
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
    
    // CORREÇÃO CRÍTICA: Sempre validar por texto, nunca por índice quando há embaralhamento
    const selectedText = case_.user_selected_text || case_.answer_options?.[selectedIndex] || '';
    const correctText = case_.original_correct_text || case_.answer_options?.[case_.correct_answer_index] || '';
    
    // Validação pura baseada em texto normalizado
    const isCorrect = validateAnswer(
      selectedIndex,
      selectedText,
      case_.correct_answer_index,
      correctText
    );
    
    console.log('✅ Validação final:', {
      selectedIndex,
      selectedText,
      correctText,
      originalCorrectIndex: case_.correct_answer_index,
      isCorrect,
      validation: 'texto-baseada'
    });
    
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
      isReview: isReview ? 'SIM' : 'NÃO',
      userId: user.id?.slice(0, 8) + '...',
      caseId: caseId?.slice(0, 8) + '...'
    });

    try {
      // CORREÇÃO MELHORADA: Verificar user e validar dados antes de chamar backend
      if (!user?.id || !caseId) {
        throw new Error('Dados de usuário ou caso inválidos');
      }

      console.log('🎯 CHAMANDO BACKEND com validação:', { 
        user: user.id?.slice(0, 8) + '...', 
        caseId: caseId?.slice(0, 8) + '...', 
        points, 
        isCorrect,
        isReview: isReview ? 'SIM (0 pontos esperados)' : 'NÃO (pontos esperados)'
      });

      const { data, error } = await supabase.rpc('process_case_completion', {
        p_user_id: user.id,
        p_case_id: caseId,
        p_points: points,
        p_is_correct: isCorrect
      });

      // CORREÇÃO CRÍTICA: Melhor tratamento de erros específicos
      if (error) {
        console.error('❌ ERRO DETALHADO da função process_case_completion:', {
          error,
          code: error.code,
          message: error.message,
          hint: error.hint,
          details: error.details,
          context: { user: user.id?.slice(0, 8) + '...', caseId: caseId?.slice(0, 8) + '...', points, isCorrect }
        });

        // Verificar se é erro crítico ou apenas notice/warning
        const isCriticalError = error.code && 
          !['PGRST301', '0', 'P0001', '23505'].includes(error.code) &&
          !error.message?.includes('RAISE NOTICE') &&
          !error.message?.includes('PROCESSAMENTO CONCLUÍDO');

        if (isCriticalError) {
          // Erro crítico - mostrar ao usuário
          toast({
            title: "Erro ao processar resposta",
            description: "Houve um problema técnico. Sua resposta pode não ter sido registrada corretamente.",
            variant: "destructive"
          });
          
          // Tentar registrar manualmente no histórico como fallback
          try {
            await supabase.from('user_case_history').insert({
              user_id: user.id,
              case_id: caseId,
              is_correct: isCorrect,
              points: isReview ? 0 : points,
              details: {
                selected_index: selectedIndex,
                help_used: helpUsed,
                penalties,
                error_fallback: true,
                timestamp: new Date().toISOString()
              }
            });
            console.log('✅ Fallback: Resposta registrada diretamente no histórico');
          } catch (fallbackError) {
            console.error('❌ Falha no fallback:', fallbackError);
          }
          
          return {
            isCorrect,
            points: 0, // Zero pontos em caso de erro
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
            previousCorrect,
            selectedAnswerText: selectedText,
            correctAnswerText: correctText,
            hasError: true
          };
        } else {
          // Notice/Warning - considerar como sucesso
          console.log('⚠️ Notice/Warning ignorado, processamento considerado bem-sucedido');
        }
      }

      console.log('✅ BACKEND PROCESSOU:', { 
        isCorrect, 
        points, 
        penalties, 
        isReview: isReview ? 'SIM (0 pontos conforme esperado)' : 'NÃO (pontos creditados)',
        data: data ? 'dados retornados' : 'sem dados específicos'
      });

      // TOASTS MELHORADOS com informações mais claras
      if (isReview) {
        toast({
          title: "✅ Revisão Concluída",
          description: "Resposta registrada para estudo. Revisões não pontuam.",
        });
      } else if (isCorrect && points > 0) {
        toast({
          title: "🎉 Parabéns!",
          description: `Resposta correta! +${points} pontos creditados.`,
        });
      } else if (isCorrect && points === 0) {
        toast({
          title: "✅ Resposta Correta",
          description: "Acertou, mas sem pontos devido às penalidades aplicadas.",
        });
      } else {
        toast({
          title: "❌ Resposta Incorreta",
          description: "Não desista! Revise o material e tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('❌ Erro GERAL ao processar caso:', {
        error,
        errorCode: error?.code,
        errorMessage: error?.message,
        stack: error?.stack,
        context: { user: user.id?.slice(0, 8) + '...', caseId: caseId?.slice(0, 8) + '...', points, isCorrect, isReview }
      });
      
      // Erro de rede ou conexão
      toast({
        title: "Erro de Conexão",
        description: "Problema de conectividade. Verifique sua internet e tente novamente.",
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
      previousCorrect,
      selectedAnswerText: selectedText,
      correctAnswerText: correctText
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
