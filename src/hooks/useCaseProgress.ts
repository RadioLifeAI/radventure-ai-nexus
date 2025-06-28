
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./useAuth";

export function useCaseProgress(caseId: string) {
  const [startTime] = useState(Date.now());
  const [helpUsed, setHelpUsed] = useState<string[]>([]);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  const addHelpUsed = (helpType: string) => {
    setHelpUsed(prev => [...prev, helpType]);
  };

  const eliminateOption = (correctAnswerIndex: number) => {
    // CORREÇÃO CRÍTICA: Nunca eliminar a alternativa correta
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

    // Selecionar uma alternativa INCORRETA aleatória
    const randomIndex = availableOptions[Math.floor(Math.random() * availableOptions.length)];
    setEliminatedOptions(prev => [...prev, randomIndex]);
    addHelpUsed("Eliminação");
    
    toast({
      title: "Alternativa eliminada",
      description: "Uma alternativa incorreta foi removida das opções.",
    });
  };

  const skipCase = () => {
    addHelpUsed("Pular");
    
    toast({
      title: "Caso pulado",
      description: "Você pulou este caso. Pontos foram deduzidos.",
    });
  };

  const useAIHint = async () => {
    addHelpUsed("Dica IA");
    
    toast({
      title: "Dica IA ativada",
      description: "Analisando o caso para fornecer uma dica...",
    });
  };

  const calculatePoints = (basePoints: number, isCorrect: boolean, penalties: number) => {
    if (!isCorrect) return 0;
    return Math.max(0, basePoints - penalties);
  };

  const calculatePenalties = (skipPenalty: number, eliminationPenalty: number) => {
    const skipCount = helpUsed.filter(h => h === "Pular").length;
    const eliminationCount = helpUsed.filter(h => h === "Eliminação").length;
    
    return (skipCount * skipPenalty) + (eliminationCount * eliminationPenalty);
  };

  // Função para normalizar texto para comparação melhorada
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, '') // Remove pontuação
      .replace(/\s+/g, ' '); // Normaliza espaços
  };

  const submitAnswer = async (selectedIndex: number, case_: any) => {
    if (isAnswered || !user) return;
    
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - startTime) / 1000);
    
    // Verificação de correção melhorada
    let isCorrect = false;
    
    if (selectedIndex === case_.correct_answer_index) {
      isCorrect = true;
    } else {
      // Fallback: comparar textos normalizados
      const selectedText = case_.answer_options?.[selectedIndex] || '';
      const correctText = case_.answer_options?.[case_.correct_answer_index] || '';
      
      if (selectedText && correctText && normalizeText(selectedText) === normalizeText(correctText)) {
        isCorrect = true;
        console.log('Resposta correta detectada por comparação de texto:', {
          selected: selectedText,
          correct: correctText,
          normalized_selected: normalizeText(selectedText),
          normalized_correct: normalizeText(correctText)
        });
      }
    }
    
    const penalties = calculatePenalties(case_.skip_penalty_points || 0, case_.elimination_penalty_points || 0);
    const points = calculatePoints(case_.points || 10, isCorrect, penalties);

    setIsAnswered(true);

    // Log detalhado para debug
    console.log('Debug submitAnswer:', {
      selectedIndex,
      answer_options: case_.answer_options,
      answer_feedbacks: case_.answer_feedbacks,
      correct_answer_index: case_.correct_answer_index,
      isCorrect,
      points,
      penalties,
      helpUsed
    });

    // CORREÇÃO: Salvar TODAS as tentativas no banco, não apenas as corretas
    try {
      // Salvar histórico da resposta
      await supabase.from('user_case_history').insert({
        user_id: user.id,
        case_id: caseId,
        is_correct: isCorrect,
        points: points,
        details: {
          time_spent: timeSpent,
          help_used: helpUsed,
          penalties: penalties,
          selected_index: selectedIndex,
          selected_text: case_.answer_options?.[selectedIndex],
          correct_text: case_.answer_options?.[case_.correct_answer_index],
          answer_feedbacks: case_.answer_feedbacks,
          eliminated_options: eliminatedOptions
        }
      });

      // CORREÇÃO: Atualizar pontos e RadCoins se correto E com pontos > 0
      if (isCorrect && points > 0) {
        await supabase.rpc('process_case_completion', {
          p_case_id: caseId,
          p_points: points,
          p_is_correct: isCorrect
        });
      } else if (isCorrect && points === 0) {
        // Caso correto mas sem pontos (por penalidades)
        await supabase.rpc('process_case_completion', {
          p_case_id: caseId,
          p_points: 0,
          p_is_correct: isCorrect
        });
      }

      console.log('✅ Resposta salva com sucesso:', { isCorrect, points });
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
      timeSpent,
      helpUsed,
      penalties,
      selectedIndex,
      answerFeedbacks: case_.answer_feedbacks,
      eliminatedOptions
    };
  };

  return {
    helpUsed,
    eliminatedOptions,
    isAnswered,
    eliminateOption,
    skipCase,
    useAIHint,
    submitAnswer,
    startTime
  };
}
