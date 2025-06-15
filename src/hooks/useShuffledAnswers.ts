
import { useState, useEffect } from "react";

/**
 * Hook para embaralhar alternativas de quiz apenas na visualização do usuário.
 */
export function useShuffledAnswers(caso: any) {
  const [shuffled, setShuffled] = useState<{
    options: string[];
    feedbacks: string[];
    shortTips: string[];
    correctIndex: number;
  } | null>(null);

  useEffect(() => {
    if (!caso || !Array.isArray(caso.answer_options)) {
      setShuffled(null);
      return;
    }
    const zipped = caso.answer_options.map((answer: string, idx: number) => ({
      answer,
      feedback: caso.answer_feedbacks?.[idx] ?? "",
      shortTip: caso.answer_short_tips?.[idx] ?? "",
      isCorrect: idx === caso.correct_answer_index,
    }));
    // Shuffle array generically
    for (let i = zipped.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [zipped[i], zipped[j]] = [zipped[j], zipped[i]];
    }
    // Nova posição da correta
    const newCorrectIdx = zipped.findIndex(x => x.isCorrect);
    setShuffled({
      options: zipped.map(x => x.answer),
      feedbacks: zipped.map(x => x.feedback),
      shortTips: zipped.map(x => x.shortTip),
      correctIndex: newCorrectIdx,
    });
  }, [caso?.answer_options, caso?.correct_answer_index, caso?.answer_feedbacks, caso?.answer_short_tips, caso]);
  return shuffled;
}
