
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

  return {
    can_skip: true,
    max_elimination: Math.max(1, nOptions - 2),
    ai_hint_enabled: true,
    manual_hint:
      suggestion.manual_hint ??
      (suggestion.findings
        ? `Atenção ao achado: ${String(suggestion.findings).slice(0, 120)}`
        : "Considere a integração entre achados e quadro clínico!"),
    skip_penalty_points: 2,
    elimination_penalty_points: 1,
    ai_tutor_level: "basico",
  };
}
