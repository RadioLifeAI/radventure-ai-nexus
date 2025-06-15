import { supabase } from "@/integrations/supabase/client";
import { useIAutoSuggest } from "./useIAutoSuggest";

export function useCaseProfileFormUtils({
  form,
  setForm,
  setSubmitting,
  categories,
  difficulties,
  toast,
  setHighlightedFields,
}: any) {
  function normalizeString(str: string = "") {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  }
  function suggestPointsByDifficulty(level: string) {
    switch (level) {
      case "1": return "10";
      case "2": return "20";
      case "3": return "30";
      case "4": return "50";
      default:  return "10";
    }
  }

  // Importar e usar o novo hook para a lógica de sugestão IA
  const iautoSuggest = useIAutoSuggest({
    form,
    setForm,
    setSubmitting,
    toast,
    setHighlightedFields,
    categories,
    difficulties,
  });

  return {
    normalizeString,
    suggestPointsByDifficulty,
    ...iautoSuggest // todas as funções IA são injetadas aqui
  };
}
