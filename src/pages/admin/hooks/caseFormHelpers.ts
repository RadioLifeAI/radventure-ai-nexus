
/**
 * Helpers puros para o formulário de caso médico.
 * 
 * Foque em funções que NÃO dependem de hooks ou React state.
 */

/** Remove acentos, deixa minúsculo e trim em string. */
export function normalizeString(str: string = ""): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

/** Sugere pontuação padrão baseada no nível de dificuldade */
export function suggestPointsByDifficulty(level: string): string {
  switch (level) {
    case "1": return "5";
    case "2": return "10";
    case "3": return "15";
    case "4": return "20";
    default:  return "5";
  }
}

/** Aplica safe trims e coerções em strings */
export function safeStr(v: any): string {
  return (v === null || v === undefined ? "" : String(v));
}

/** Aplica safe trims e coerções em arrays */
export function safeArr(a: any[] | undefined, fallbackLen = 4): string[] {
  if (Array.isArray(a)) return a.map(safeStr).concat(Array(fallbackLen).fill("")).slice(0, fallbackLen);
  return Array(fallbackLen).fill("");
}
