
/**
 * Função para sugerir configuração dos campos avançados de um caso.
 * 
 * @param suggestion Sugestão vinda da IA ou do usuário no auto-preenchimento do caso.
 * @param form Estado atual do formulário (usado para fallback se necessário).
 * @returns Objeto com campos avançados automaticamente preenchidos.
 */
export function buildAutoAdvancedFields(suggestion: any = {}, form: any = {}) {
  const nOptions = Array.isArray(suggestion.answer_options)
    ? suggestion.answer_options.length
    : 4;

  // Determina dificuldade
  const diffLevel = typeof suggestion.difficulty !== "undefined"
    ? Number(suggestion.difficulty)
    : typeof form.difficulty_level !== "undefined"
      ? Number(form.difficulty_level)
      : 2;

  // Nível Tutor AI baseado na dificuldade
  let ai_tutor_level = "desligado";
  // Fácil = detalhado; intermediário = básico; difícil/'infernal' = desligado/básico
  if (diffLevel <= 1) ai_tutor_level = "detalhado";
  else if (diffLevel === 2) ai_tutor_level = "basico";
  else if (diffLevel >= 3) ai_tutor_level = "basico";

  // Penalidade dinâmica: mais alta para fácil, mais leve para difícil
  let skip_penalty_points = 2;
  let elimination_penalty_points = 1;
  if (diffLevel <= 1) {
    skip_penalty_points = 3;
    elimination_penalty_points = 2;
  } else if (diffLevel >= 3) {
    skip_penalty_points = 1;
    elimination_penalty_points = 0;
  }

  return {
    can_skip: true,
    max_elimination: Math.max(1, nOptions - 2),
    ai_hint_enabled: true,
    manual_hint:
      suggestion.manual_hint ??
      (suggestion.findings
        ? `Atenção ao achado: ${String(suggestion.findings).slice(0, 120)}`
        : "Considere a integração entre achados e quadro clínico!"),
    skip_penalty_points,
    elimination_penalty_points,
    ai_tutor_level,
  };
}
