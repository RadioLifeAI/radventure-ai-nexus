
/**
 * Utilitário para embaralhar alternativas mantendo integridade entre opções, feedbacks, dicas e correta.
 */
export function shuffleAlternativesWithFeedback(
  options: string[],
  feedbacks: string[],
  tips: string[],
  currentCorrectIdx: number
) {
  const arr = options.map((option, idx) => ({
    option,
    feedback: feedbacks[idx] ?? "",
    tip: tips[idx] ?? "",
    isCorrect: idx === currentCorrectIdx,
  }));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const newCorrectIdx = arr.findIndex((el) => el.isCorrect);
  return {
    options: arr.map((el) => el.option),
    feedbacks: arr.map((el) => el.feedback),
    tips: arr.map((el) => el.tip),
    correctIdx: newCorrectIdx,
  };
}
