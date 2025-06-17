
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useCaseProgress(caseId: string, userId?: string) {
  const [startTime] = useState(Date.now());
  const [helpUsed, setHelpUsed] = useState<string[]>([]);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [helpCredits, setHelpCredits] = useState({
    elimination: 3,
    skip: 1,
    aiHint: 2
  });

  const { toast } = useToast();

  // Sistema mock: usar sempre o usuário de desenvolvimento
  const mockUserId = "00000000-0000-0000-0000-000000000001";

  const addHelpUsed = (helpType: string) => {
    setHelpUsed(prev => [...prev, helpType]);
  };

  const eliminateOption = (optionIndex: number) => {
    setEliminatedOptions(prev => [...prev, optionIndex]);
    addHelpUsed("Eliminação");
    setHelpCredits(prev => ({ ...prev, elimination: prev.elimination - 1 }));
    
    toast({
      title: "Alternativa eliminada",
      description: "Uma alternativa foi removida das opções.",
    });
  };

  const skipCase = () => {
    addHelpUsed("Pular");
    setHelpCredits(prev => ({ ...prev, skip: prev.skip - 1 }));
    
    toast({
      title: "Caso pulado",
      description: "Você pulou este caso. Pontos foram deduzidos.",
    });
  };

  const useAIHint = async () => {
    addHelpUsed("Dica IA");
    setHelpCredits(prev => ({ ...prev, aiHint: prev.aiHint - 1 }));
    
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

  // Função para normalizar texto para comparação
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
    if (isAnswered) return;
    
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - startTime) / 1000);
    
    // Verificação corrigida: comparar tanto por índice quanto por texto
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

    // Save to database using mock user
    try {
      await supabase.from('user_case_history').insert({
        user_id: mockUserId,
        case_id: caseId,
        is_correct: isCorrect,
        points: points,
        details: {
          time_spent: timeSpent,
          help_used: helpUsed,
          penalties: penalties,
          selected_index: selectedIndex,
          selected_text: case_.answer_options?.[selectedIndex],
          correct_text: case_.answer_options?.[case_.correct_answer_index]
        }
      });

      // Update user profile points using the correct function
      if (isCorrect && points > 0) {
        await supabase.rpc('process_case_completion', {
          p_user_id: mockUserId,
          p_case_id: caseId,
          p_points: points
        });
      }
    } catch (error) {
      console.error('Error saving case completion:', error);
    }

    return {
      isCorrect,
      points,
      timeSpent,
      helpUsed,
      penalties
    };
  };

  return {
    helpUsed,
    eliminatedOptions,
    isAnswered,
    helpCredits,
    eliminateOption,
    skipCase,
    useAIHint,
    submitAnswer,
    startTime
  };
}
