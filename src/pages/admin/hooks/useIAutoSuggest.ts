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
    if (!form.category_id || !form.difficulty_level || !form.modality || !form.subtype) {
      toast({ title: "Selecione categoria, dificuldade e modalidade antes de usar o autopreenchimento.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      // 1. Suggest Title
      if (!form.title) {
        if (!form.findings && !form.patient_clinical_info) {
          toast({ title: "Preencha os campos de achados ou resumo clínico para obter sugestão de título.", variant: "destructive" });
        } else {
          setForm((prev: any) => ({ ...prev, title: "Título sugerido" }));
          setHighlightedFields((prev: string[]) => [...prev, "title"]);
        }
      }

      // 2. Suggest Findings
      if (!form.findings) {
        setForm((prev: any) => ({ ...prev, findings: "Achados sugeridos" }));
        setHighlightedFields((prev: string[]) => [...prev, "findings"]);
      }

      // 3. Suggest Clinical Info
      if (!form.patient_clinical_info) {
        setForm((prev: any) => ({ ...prev, patient_clinical_info: "Resumo clínico sugerido" }));
        setHighlightedFields((prev: string[]) => [...prev, "patient_clinical_info"]);
      }

      // 4. Suggest Age/Gender/Symptoms
      if (!form.patient_age) {
        setForm((prev: any) => ({ ...prev, patient_age: "42" }));
        setHighlightedFields((prev: string[]) => [...prev, "patient_age"]);
      }
      if (!form.patient_gender) {
        setForm((prev: any) => ({ ...prev, patient_gender: "Masculino" }));
        setHighlightedFields((prev: string[]) => [...prev, "patient_gender"]);
      }
      if (!form.symptoms_duration) {
        setForm((prev: any) => ({ ...prev, symptoms_duration: "2 semanas" }));
        setHighlightedFields((prev: string[]) => [...prev, "symptoms_duration"]);
      }

      // 5. Advanced Options (can_skip, max_elimination, etc.)
      setForm((prev: any) => ({
        ...prev,
        can_skip: true,
        max_elimination: 2,
        ai_hint_enabled: true,
        manual_hint: "Dica manual",
        skip_penalty_points: 5,
        elimination_penalty_points: 3,
        ai_tutor_level: "basico"
      }));
      toast({ title: "Detalhes do caso preenchidos automaticamente!" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSuggestAlternatives() {
    setSubmitting(true);
    try {
      // Simulação de sugestão de alternativas
      const suggestedAlternatives = [
        "Alternativa A (sugerida)",
        "Alternativa B (sugerida)",
        "Alternativa C (sugerida)",
        "Alternativa D (sugerida)"
      ];
      setForm((prev: any) => ({ ...prev, answer_options: suggestedAlternatives }));
      toast({ title: "Alternativas sugeridas!" });
      setHighlightedFields((prev: string[]) => [...prev, "answer_options"]);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSuggestHint() {
    setSubmitting(true);
    try {
      // Simulação de sugestão de dica
      setForm((prev: any) => ({ ...prev, manual_hint: "Dica sugerida pela IA." }));
      toast({ title: "Dica sugerida!" });
      setHighlightedFields((prev: string[]) => [...prev, "manual_hint"]);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSuggestExplanation() {
    setSubmitting(true);
    try {
      // Simulação de sugestão de explicação
      setForm((prev: any) => ({ ...prev, explanation: "Explicação detalhada sugerida pela IA." }));
      toast({ title: "Explicação sugerida!" });
      setHighlightedFields((prev: string[]) => [...prev, "explanation"]);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSuggestFindings() {
    setSubmitting(true);
    try {
      // Simulação de sugestão de achados
      setForm((prev: any) => ({ ...prev, findings: "Achados radiológicos sugeridos pela IA." }));
      toast({ title: "Achados sugeridos!" });
      setHighlightedFields((prev: string[]) => [...prev, "findings"]);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSuggestClinicalInfo() {
    setSubmitting(true);
    try {
      // Simulação de sugestão de resumo clínico
      setForm((prev: any) => ({ ...prev, patient_clinical_info: "Resumo clínico sugerido pela IA." }));
      toast({ title: "Resumo clínico sugerido!" });
      setHighlightedFields((prev: string[]) => [...prev, "patient_clinical_info"]);
    } finally {
      setSubmitting(false);
    }
  }

  // --------------------------
  // Add missing handler functions below
  // --------------------------

  async function handleSuggestTitle() {
    // Placeholder for AI logic to suggest the 'title' (diagnóstico)
    setSubmitting(true);
    try {
      // Aqui normalmente iria chamada para IA sugerindo o diagnóstico com base nos campos do formulário.
      // Exemplo simples/temporário:
      if (!form.findings && !form.patient_clinical_info) {
        toast({ title: "Preencha os campos de achados ou resumo clínico para obter sugestão.", variant: "destructive" });
        return;
      }
      // Simulação de requisição IA (real: chamar um endpoint, supabase function, etc)
      setForm((prev: any) => ({
        ...prev,
        title: "Sugestão automática de diagnóstico"
      }));
      toast({ title: "Diagnóstico sugerido!" });
      setHighlightedFields((prev: string[]) => [...prev, "title"]);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGenerateAutoTitle() {
    // Placeholder for AI logic to generate an auto title (similar to above, can be merged if needed)
    setSubmitting(true);
    try {
      // Exemplo simulado; normalmente requisitaria uma IA.
      setForm((prev: any) => ({
        ...prev,
        title: "Título gerado automaticamente"
      }));
      toast({ title: "Título automático gerado!" });
      setHighlightedFields((prev: string[]) => [...prev, "title"]);
    } finally {
      setSubmitting(false);
    }
  }

  return {
    handleAutoFillCaseDetails,
    handleSuggestAlternatives,
    handleSuggestHint,
    handleSuggestExplanation,
    handleSuggestFindings,
    handleSuggestClinicalInfo,
    handleSuggestTitle,
    handleGenerateAutoTitle
  };
}
