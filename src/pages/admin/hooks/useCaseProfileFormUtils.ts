export function useCaseProfileFormUtils({ categories, difficulties, toast, setForm, setHighlightedFields }: any) {
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
  async function handleAutoFillCaseDetails() {
    if (!form.title?.trim()) {
      toast({ description: "Por favor, preencha o campo Diagnóstico para sugerir todos os detalhes." });
      return;
    }
    setSubmitting(true);
    try {
      // Novo: prepara corpo conforme preenchimento dos campos
      const body: any = { diagnosis: form.title };
      if (form.findings?.trim()) body.findings = form.findings.trim();
      if (form.modality?.trim()) body.modality = form.modality.trim();
      if (form.subtype?.trim()) body.subtype = form.subtype.trim();

      // Novidade aqui: procurar categoria pelo nome (tenta achar de forma bem tolerante)
      const { data, error } = await supabase.functions.invoke("case-autofill", {
        body
      });

      if (error) {
        throw new Error(error.message || "Falha na chamada IA via Supabase.");
      }

      const suggestion = data?.suggestion || {};
      
      // Novidade aqui: procurar categoria pelo nome (tenta achar de forma bem tolerante)
      let categoriaId = "";
      if (suggestion.category) {
        const normalizedAI = normalizeString(suggestion.category);
        const match = categories.find(cat => normalizeString(cat.name) === normalizedAI)
          // fallback para startsWith (caso a IA retorne "Neurologia - adulto")
          || categories.find(cat => normalizeString(cat.name).startsWith(normalizedAI))
          || categories.find(cat => normalizedAI.startsWith(normalizeString(cat.name)));
        categoriaId = match ? String(match.id) : "";
      }

      setForm(prev => {
        // Defensive helpers to ensure string fields para TS & consistência
        const safeStr = (v: any) => (v === null || v === undefined ? "" : String(v));
        const safeArr = (a: any[] | undefined, fallbackLen = 4) => {
          if (Array.isArray(a)) return a.map(safeStr).concat(Array(fallbackLen).fill("")).slice(0, fallbackLen);
          return Array(fallbackLen).fill("");
        };

        return {
          ...prev,
          category_id: categoriaId,
          difficulty_level: suggestion.difficulty
            ? safeStr(
                difficulties.find(({ level }) => safeStr(level) === safeStr(suggestion.difficulty))?.level ?? ""
              )
            : "",
          points: suggestion.points !== undefined ? safeStr(suggestion.points) : "10",
          modality: safeStr(suggestion.modality ?? ""),
          subtype: safeStr(suggestion.subtype ?? ""),
          findings: safeStr(suggestion.findings ?? ""),
          patient_clinical_info: safeStr(suggestion.patient_clinical_info ?? ""),
          explanation: safeStr(suggestion.explanation ?? ""),
          patient_age: safeStr(suggestion.patient_age ?? ""),
          patient_gender: safeStr(suggestion.patient_gender ?? ""),
          symptoms_duration: safeStr(suggestion.symptoms_duration ?? ""),
          main_question: safeStr(suggestion.main_question ?? ""),
          answer_options: safeArr(suggestion.answer_options, 4),
          answer_feedbacks: safeArr(suggestion.answer_feedbacks, 4),
          answer_short_tips: safeArr(suggestion.answer_short_tips, 4),
          correct_answer_index: 0,
        };
      });
      setHighlightedFields([
        "category_id",
        "difficulty_level",
        "points",
        "modality",
        "subtype",
        "findings",
        "patient_clinical_info",
        "explanation",
        "patient_age",
        "patient_gender",
        "symptoms_duration",
        "main_question",
        "answer_options",
        "answer_feedbacks",
        "answer_short_tips",
      ]);
      setTimeout(() => setHighlightedFields([]), 2500);
      toast({
        title: "Campos preenchidos por IA!",
        description: "Revise as sugestões e use os botões secundários para refinar cada campo.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao preencher detalhes automaticamente",
        description: err?.message || String(err),
      });
    } finally {
      setSubmitting(false);
    }
  }
  async function handleSuggestTitle() {
    if (!form.findings && !form.patient_clinical_info) {
      toast({ description: "Preencha Achados Radiológicos e/ou Resumo Clínico para sugerir um título." });
      return;
    }
    // Placeholder: apenas exemplo de sugestão.
    setForm(prev => ({ ...prev, title: "Título sugerido pelo sistema (placeholder)" }));
    toast({ description: "Título sugerido automaticamente (personalize se desejar)." });
  }
  async function handleSuggestAlternatives() {
    if (!form.findings && !form.patient_clinical_info) {
      toast({ description: "Preencha Achados Radiológicos e Resumo Clínico para gerar alternativas." });
      return;
    }
    // Placeholder: apenas exemplo de sugestão.
    setForm(prev => ({
      ...prev,
      answer_options: [
        "Diagnóstico A (sugerido pela IA)",
        "Diagnóstico B (sugerido pela IA)",
        "Diagnóstico C (sugerido pela IA)",
        "Diagnóstico D (sugerido pela IA)"
      ],
      correct_answer_index: 0
    }));
    toast({ description: "Alternativas sugeridas automaticamente (personalize se desejar)." });
  }
  async function handleSuggestHint() {
    if (!form.findings && !form.patient_clinical_info) {
      toast({ description: "Preencha Achados Radiológicos e/ou Resumo Clínico para sugerir uma dica." });
      return;
    }
    setForm(prev => ({ ...prev, manual_hint: "Dica gerada automaticamente (placeholder IA)." }));
    toast({ description: "Dica sugerida automaticamente (futuramente via IA, edite se desejar)." });
  }
  async function handleSuggestExplanation() {
    if (!form.findings && !form.main_question && !form.title) {
      toast({ description: "Preencha Achados, Pergunta Principal ou Diagnóstico para sugerir uma explicação." });
      return;
    }
    setForm(prev => ({
      ...prev,
      explanation: "Explicação e feedback gerados automaticamente (placeholder IA/API)."
    }));
    toast({ description: "Explicação sugerida automaticamente (futuramente via IA, edite se desejar)." });
  }
  async function handleGenerateAutoTitle() {
    if (!form.category_id || !form.modality) {
      toast({ description: "Selecione uma categoria e modalidade primeiro." });
      return;
    }
    setSubmitting(true);
    try {
      // Busca a categoria (label)
      const categoria = categories.find(c => String(c.id) === String(form.category_id))?.name || "";
      // Conta quantos casos existem naquela categoria+modalidade para gerar o próximo número
      const { data, error } = await supabase
        .from("medical_cases")
        .select("id", { count: "exact", head: true })
        .eq("category_id", Number(form.category_id))
        .eq("modality", form.modality);
      // Corrigido: confere o total correto, usando head:true (length) ou se não, count
      const nextNumber = (data?.length ?? 0) + 1;
      // Gera o nome automático
      const autoTitle = `${categoria} - ${form.modality} #${nextNumber}`;

      setForm(prev => ({
        ...prev,
        title: autoTitle,
        case_number: nextNumber // <--- agora atribui number!
      }));
      toast({ description: "Título gerado automaticamente!" });
    } catch (err: any) {
      toast({ variant: "destructive", description: "Falha ao gerar o título automático." });
    } finally {
      setSubmitting(false);
    }
  }
  return { normalizeString, suggestPointsByDifficulty, handleAutoFillCaseDetails, handleSuggestTitle, handleSuggestAlternatives, handleSuggestHint, handleSuggestExplanation, handleGenerateAutoTitle };
}
