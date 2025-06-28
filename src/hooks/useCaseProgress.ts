

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./useAuth";

export function useCaseProgress(caseId: string) {
  const [startTime] = useState(Date.now());
  const [helpUsed, setHelpUsed] = useState<string[]>([]);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [eliminationCount, setEliminationCount] = useState(0); // NOVO: Contador de eliminações
  const [isAnswered, setIsAnswered] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  const addHelpUsed = (helpType: string) => {
    setHelpUsed(prev => [...prev, helpType]);
  };

  // CORREÇÃO: Limitar eliminação a 2 usos máximo
  const eliminateOption = (correctAnswerIndex: number) => {
    // Verificar limite de eliminações
    if (eliminationCount >= 2) {
      toast({
        title: "Limite atingido",
        description: "Você pode eliminar no máximo 2 alternativas por caso.",
        variant: "destructive"
      });
      return;
    }

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
    setEliminationCount(prev => prev + 1);
    addHelpUsed("Eliminação");
    
    toast({
      title: "Alternativa eliminada",
      description: `Uma alternativa incorreta foi removida. Usos restantes: ${2 - eliminationCount - 1}`,
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

  // CORREÇÃO: Sistema de penalidades implementado
  const calculatePenalties = (basePoints: number) => {
    let totalPenalty = 0;
    
    helpUsed.forEach(helpType => {
      switch (helpType) {
        case "Eliminação":
          totalPenalty += Math.floor(basePoints * 0.20); // -20%
          break;
        case "Pular":
          totalPenalty += Math.floor(basePoints * 0.50); // -50%
          break;
        case "Dica IA":
          totalPenalty += Math.floor(basePoints * 0.10); // -10%
          break;
      }
    });
    
    return totalPenalty;
  };

  const calculatePoints = (basePoints: number, isCorrect: boolean) => {
    if (!isCorrect) return 0;
    
    const penalties = calculatePenalties(basePoints);
    const finalPoints = Math.max(0, basePoints - penalties);
    
    console.log('📊 Cálculo de pontos:', {
      basePoints,
      penalties,
      finalPoints,
      helpUsed
    });
    
    return finalPoints;
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
    
    // CORREÇÃO: Usar novo sistema de penalidades
    const basePoints = case_.points || 10;
    const points = calculatePoints(basePoints, isCorrect);
    const penalties = calculatePenalties(basePoints);

    setIsAnswered(true);

    // Log detalhado para debug
    console.log('Debug submitAnswer:', {
      selectedIndex,
      answer_options: case_.answer_options,
      answer_feedbacks: case_.answer_feedbacks,
      correct_answer_index: case_.correct_answer_index,
      isCorrect,
      basePoints,
      penalties,
      finalPoints: points,
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
          base_points: basePoints,
          selected_index: selectedIndex,
          selected_text: case_.answer_options?.[selectedIndex],
          correct_text: case_.answer_options?.[case_.correct_answer_index],
          answer_feedbacks: case_.answer_feedbacks,
          eliminated_options: eliminatedOptions,
          elimination_count: eliminationCount
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

      console.log('✅ Resposta salva com sucesso:', { isCorrect, points, penalties });
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
      eliminationCount
    };
  };

  return {
    helpUsed,
    eliminatedOptions,
    eliminationCount, // NOVO: Expor contador de eliminações
    isAnswered,
    eliminateOption,
    skipCase,
    useAIHint,
    submitAnswer,
    startTime,
    canEliminate: eliminationCount < 2 // NOVO: Indicador se ainda pode eliminar
  };
}

