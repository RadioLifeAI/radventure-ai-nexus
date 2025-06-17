
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
    
    // Here you would call the AI hint function
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

  const submitAnswer = async (selectedIndex: number, case_: any) => {
    if (isAnswered) return;
    
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - startTime) / 1000);
    const isCorrect = selectedIndex === case_.correct_answer_index;
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
          selected_index: selectedIndex
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
