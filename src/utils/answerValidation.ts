// Função utilitária para validação de respostas
// Garante consistência entre useCaseProgress e FeedbackModal

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}

export function validateAnswer(
  selectedIndex: number,
  selectedText: string,
  correctIndex: number,
  correctText: string
): boolean {
  // Primeiro verifica o índice
  if (selectedIndex === correctIndex) {
    return true;
  }
  
  // Se os índices não batem, verifica o texto normalizado
  if (selectedText && correctText) {
    return normalizeText(selectedText) === normalizeText(correctText);
  }
  
  return false;
}