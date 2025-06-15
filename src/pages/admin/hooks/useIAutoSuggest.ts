
import { supabase } from "@/integrations/supabase/client";

export function useIAutoSuggest({
  form,
  setForm,
  setSubmitting,
  toast,
  setHighlightedFields,
  categories,
  difficulties,
}: any) {
  // Funções para normalize, match, etc. podem ser importadas de outros utilitários se necessário

  async function handleAutoFillCaseDetails() {
    // ... código original do handleAutoFillCaseDetails move aqui, adaptando para dependências recebidas
    // Recomenda-se extrair funções auxiliares deste bloco para manter este hook pequeno e focado
  }

  async function handleSuggestAlternatives() {
    // ... mover e adaptar função para sugerir alternativas via IA
  }

  async function handleSuggestHint() {
    // ... mover e adaptar função para sugerir dica via IA
  }

  async function handleSuggestExplanation() {
    // ... mover e adaptar função para sugerir explicação via IA
  }

  async function handleSuggestFindings() {
    // ... mover e adaptar função para sugerir achados via IA
  }

  async function handleSuggestClinicalInfo() {
    // ... mover e adaptar função para sugerir resumo clínico via IA
  }

  return {
    handleAutoFillCaseDetails,
    handleSuggestAlternatives,
    handleSuggestHint,
    handleSuggestExplanation,
    handleSuggestFindings,
    handleSuggestClinicalInfo
  };
}
