import { toast as useToast } from "@/components/ui/use-toast"

export function useCaseProfileFormUtils({
  form,
  setForm,
  setSubmitting,
  categories,
  difficulties,
  toast,
  setHighlightedFields,
  supabase,
}) {
  function suggestPointsByDifficulty(level: number) {
    if (!difficulties?.length) return 10;
    const diff = difficulties.find(d => d.level === Number(level));
    return diff ? Number(level) * 10 : 10;
  }

  async function handleAutoFillCaseDetails() {
    setSubmitting(true);
    setHighlightedFields([]);
    try {
      const res = await fetch("https://zyrbkxkxdznyhrpudhrk.functions.supabase.co/case-autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosis: form.title,
          findings: form.findings,
          modality: form.modality,
          subtype: form.subtype
        }),
      });
      const data = await res.json();
      if (data?.suggestion) {
        setForm((prev: any) => ({ ...prev, ...data.suggestion }));
      } else {
        toast({ title: "IA não retornou detalhes válidos.", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Erro ao preencher detalhes do caso.", variant: "destructive" });
    }
    setSubmitting(false);
  }

  async function handleSuggestTitle() {
    setSubmitting(true);
    setHighlightedFields([]);
    try {
      const res = await fetch("https://zyrbkxkxdznyhrpudhrk.functions.supabase.co/case-autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosis: form.title,
          findings: form.findings,
          modality: form.modality,
          subtype: form.subtype
        }),
      });
      const data = await res.json();
      if (data?.suggestion?.title) {
        setForm((prev: any) => ({ ...prev, title: data.suggestion.title }));
      } else {
        toast({ title: "IA não retornou título válido.", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Erro ao sugerir título.", variant: "destructive" });
    }
    setSubmitting(false);
  }

  async function handleSuggestAlternatives() {
    setSubmitting(true);
    setHighlightedFields([]);
    try {
      const res = await fetch("https://zyrbkxkxdznyhrpudhrk.functions.supabase.co/case-autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosis: form.title,
          findings: form.findings,
          modality: form.modality,
          subtype: form.subtype,
          withAlternativesOnly: true,
        }),
      });
      const data = await res.json();

      if (data?.suggestion?.answer_options && Array.isArray(data.suggestion.answer_options)) {
        // Embaralhar de forma coordenada as alternativas, feedbacks, short_tips
        const zipped = data.suggestion.answer_options.map((option: string, i: number) => ({
          option,
          feedback: (data.suggestion.answer_feedbacks ?? [])[i] || "",
          tip: (data.suggestion.answer_short_tips ?? [])[i] || "",
          isCorrect: i === 0, // IA sempre retorna o diagnóstico principal no índice 0
        }));

        // Função shuffle (Fisher-Yates)
        for (let i = zipped.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [zipped[i], zipped[j]] = [zipped[j], zipped[i]];
        }

        // Encontrar nova posição da alternativa correta
        const correctIndex = zipped.findIndex(z => z.isCorrect);

        setForm((prev: any) => ({
          ...prev,
          answer_options: zipped.map(z => z.option),
          answer_feedbacks: zipped.map(z => z.feedback),
          answer_short_tips: zipped.map(z => z.tip),
          correct_answer_index: correctIndex,
        }));
      } else {
        toast({ title: "IA não retornou alternativas válidas.", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Erro ao sugerir alternativas.", variant: "destructive" });
    }
    setSubmitting(false);
  }

  async function handleSuggestHint() {
    setSubmitting(true);
    setHighlightedFields([]);
    try {
      const res = await fetch("https://zyrbkxkxdznyhrpudhrk.functions.supabase.co/case-autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosis: form.title,
          findings: form.findings,
          modality: form.modality,
          subtype: form.subtype,
          withHintOnly: true
        }),
      });
      const data = await res.json();
      if (data?.suggestion?.hint) {
        setForm((prev: any) => ({ ...prev, manual_hint: data.suggestion.hint }));
      } else {
        toast({ title: "IA não retornou dica válida.", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Erro ao sugerir dica.", variant: "destructive" });
    }
    setSubmitting(false);
  }

  async function handleSuggestExplanation() {
    setSubmitting(true);
    setHighlightedFields([]);
    try {
      const res = await fetch("https://zyrbkxkxdznyhrpudhrk.functions.supabase.co/case-autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosis: form.title,
          findings: form.findings,
          modality: form.modality,
          subtype: form.subtype
        }),
      });
      const data = await res.json();
      if (data?.suggestion?.explanation) {
        setForm((prev: any) => ({ ...prev, explanation: data.suggestion.explanation }));
      } else {
        toast({ title: "IA não retornou explicação válida.", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Erro ao sugerir explicação.", variant: "destructive" });
    }
    setSubmitting(false);
  }

  async function handleGenerateAutoTitle() {
    setSubmitting(true);
    setHighlightedFields([]);
    try {
      // Gere um título automático com base nos dados do formulário
      const newTitle = `${form.modality || "Exame"} de ${form.patient_gender || "paciente"} com ${form.findings || "achados"} (${form.category_id ? categories.find(c => c.id === Number(form.category_id))?.name : "especialidade"}).`;
      setForm((prev: any) => ({ ...prev, title: newTitle }));
    } catch (e: any) {
      toast({ title: "Erro ao gerar título automático.", variant: "destructive" });
    }
    setSubmitting(false);
  }

  async function handleSuggestFindings() {
    setSubmitting(true);
    setHighlightedFields([]);
    try {
      const res = await fetch("https://zyrbkxkxdznyhrpudhrk.functions.supabase.co/case-autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosis: form.title,
          modality: form.modality,
          subtype: form.subtype,
          withFindingsOnly: true
        }),
      });
      const data = await res.json();
      if (data?.suggestion?.findings) {
        setForm((prev: any) => ({ ...prev, findings: data.suggestion.findings }));
      } else {
        toast({ title: "IA não retornou achados válidos.", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Erro ao sugerir achados.", variant: "destructive" });
    }
    setSubmitting(false);
  }

  async function handleSuggestClinicalInfo() {
    setSubmitting(true);
    setHighlightedFields([]);
    try {
      const res = await fetch("https://zyrbkxkxdznyhrpudhrk.functions.supabase.co/case-autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosis: form.title,
          modality: form.modality,
          subtype: form.subtype,
          withClinicalInfoOnly: true
        }),
      });
      const data = await res.json();
      if (data?.suggestion?.patient_clinical_info) {
        setForm((prev: any) => ({ ...prev, patient_clinical_info: data.suggestion.patient_clinical_info }));
      } else {
        toast({ title: "IA não retornou info clínica válida.", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Erro ao sugerir info clínica.", variant: "destructive" });
    }
    setSubmitting(false);
  }

  return {
    suggestPointsByDifficulty,
    handleAutoFillCaseDetails,
    handleSuggestTitle,
    handleSuggestAlternatives,
    handleSuggestHint,
    handleSuggestExplanation,
    handleGenerateAutoTitle,
    handleSuggestFindings,
    handleSuggestClinicalInfo
  };
}
