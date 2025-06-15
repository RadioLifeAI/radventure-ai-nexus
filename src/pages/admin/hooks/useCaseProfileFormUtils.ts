import { supabase } from "@/integrations/supabase/client";

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
  // Util para embaralhamento coordenado
  function shuffleAlternativesWithFeedback(
    options: string[],
    feedbacks: string[],
    tips: string[],
    currentCorrectIdx: number
  ) {
    // Cria array de objetos mantendo referência ao correto
    const arr = options.map((option, idx) => ({
      option,
      feedback: feedbacks[idx] ?? "",
      tip: tips[idx] ?? "",
      isCorrect: idx === currentCorrectIdx,
    }));
    // Embaralha
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Encontra o novo índice correto
    const newCorrectIdx = arr.findIndex((el) => el.isCorrect);
    return {
      options: arr.map((el) => el.option),
      feedbacks: arr.map((el) => el.feedback),
      tips: arr.map((el) => el.tip),
      correctIdx: newCorrectIdx,
    };
  }

  async function handleAutoFillCaseDetails() {
    if (!form.title?.trim()) {
      toast({ description: "Por favor, preencha o campo Diagnóstico para sugerir todos os detalhes." });
      return;
    }
    setSubmitting(true);
    try {
      const body: any = { diagnosis: form.title };
      if (form.findings?.trim()) body.findings = form.findings.trim();
      if (form.modality?.trim()) body.modality = form.modality.trim();
      if (form.subtype?.trim()) body.subtype = form.subtype.trim();

      const { data, error } = await supabase.functions.invoke("case-autofill", {
        body
      });

      if (error) {
        throw new Error(error.message || "Falha na chamada IA via Supabase.");
      }

      const suggestion = data?.suggestion || {};
      let categoriaId = "";
      if (suggestion.category) {
        const normalizedAI = normalizeString(suggestion.category);
        const match = categories.find((cat: any) => normalizeString(cat.name) === normalizedAI)
          || categories.find((cat: any) => normalizeString(cat.name).startsWith(normalizedAI))
          || categories.find((cat: any) => normalizedAI.startsWith(normalizeString(cat.name)));
        categoriaId = match ? String(match.id) : "";
      }

      // --- NOVA LÓGICA: embaralhar alternativas no autofill ---
      // Prepara alternativas já embaralhadas para simular experiência do estudante no admin
      const options = Array.isArray(suggestion.answer_options) ? suggestion.answer_options.slice(0, 4) : ["", "", "", ""];
      const feedbacks = Array.isArray(suggestion.answer_feedbacks) ? suggestion.answer_feedbacks.slice(0, 4) : ["", "", "", ""];
      const tips = Array.isArray(suggestion.answer_short_tips) ? suggestion.answer_short_tips.slice(0, 4) : ["", "", "", ""];
      const { options: shuffledOptions, feedbacks: shuffledFeedbacks, tips: shuffledTips, correctIdx } =
        shuffleAlternativesWithFeedback(options, feedbacks, tips, 0);

      // ATENÇÃO: para "findings", SEMPRE usar a sugestão da IA, mesmo que já exista preenchido!
      setForm((prev: any) => {
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
                difficulties.find(({ level }: any) => safeStr(level) === safeStr(suggestion.difficulty))?.level ?? ""
              )
            : "",
          points: suggestion.points !== undefined ? safeStr(suggestion.points) : "10",
          modality: suggestion.modality || prev.modality,
          subtype: suggestion.subtype || prev.subtype,
          findings: safeStr(suggestion.findings ?? ""), // SEMPRE usa sugestão IA
          patient_clinical_info: safeStr(suggestion.patient_clinical_info ?? ""),
          explanation: suggestion.explanation ?? "",
          // 🟢 Atualização: alternativas embaralhadas!
          answer_options: shuffledOptions,
          answer_feedbacks: shuffledFeedbacks,
          answer_short_tips: shuffledTips,
          correct_answer_index: correctIdx,
          patient_age: safeStr(suggestion.patient_age ?? ""),
          patient_gender: safeStr(suggestion.patient_gender ?? ""),
          symptoms_duration: safeStr(suggestion.symptoms_duration ?? ""),
          main_question: safeStr(suggestion.main_question ?? ""),
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
        description: "Revise as sugestões — inclusive alternativas que agora já vêm embaralhadas, simulando a visualização do usuário.",
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
    setForm((prev: any) => ({ ...prev, title: "Título sugerido pelo sistema (placeholder)" }));
    toast({ description: "Título sugerido automaticamente (personalize se desejar)." });
  }
  async function handleSuggestAlternatives() {
    if (!form.title) {
      toast({ description: "Preencha o campo Diagnóstico para sugerir alternativas." });
      return;
    }
    setSubmitting(true);
    try {
      const reqBody: any = {
        diagnosis: form.title,
        findings: form.findings || "",
        modality: form.modality || "",
        subtype: form.subtype || "",
        withAlternativesOnly: true
      };
      const { data, error } = await supabase.functions.invoke("case-autofill", {
        body: reqBody
      });
      if (error) throw new Error(error.message || "Não foi possível sugerir alternativas (IA).");

      const suggestion = data?.suggestion || {};
      // IA retorna sempre correta na posição zero; sortear!
      const options = Array.isArray(suggestion.answer_options) ? suggestion.answer_options.slice(0, 4) : ["", "", "", ""];
      const feedbacks = Array.isArray(suggestion.answer_feedbacks) ? suggestion.answer_feedbacks.slice(0, 4) : ["", "", "", ""];
      const tips = Array.isArray(suggestion.answer_short_tips) ? suggestion.answer_short_tips.slice(0, 4) : ["", "", "", ""];
      // Sempre considere a alternativa correta como o índice 0 da IA
      const { options: shuffledOptions, feedbacks: shuffledFeedbacks, tips: shuffledTips, correctIdx } =
        shuffleAlternativesWithFeedback(options, feedbacks, tips, 0);

      setForm((prev: any) => ({
        ...prev,
        answer_options: shuffledOptions,
        answer_feedbacks: shuffledFeedbacks,
        answer_short_tips: shuffledTips,
        correct_answer_index: correctIdx
      }));
      toast({ description: "Alternativas sugeridas por IA e embaralhadas!" });
    } catch (err: any) {
      toast({ variant: "destructive", description: err?.message || "Falha ao gerar alternativas (IA)." });
    }
    setSubmitting(false);
  }
  async function handleSuggestHint() {
    if (!form.findings && !form.patient_clinical_info) {
      toast({ description: "Preencha Achados Radiológicos e/ou Resumo Clínico para sugerir uma dica." });
      return;
    }
    setSubmitting(true);
    try {
      // Solicita para a IA uma dica clínica radiológica direta e enxuta (até 200 caracteres)
      const contextHint = `Você é um especialista em radiologia e diagnóstico por imagem, e deve fornecer uma dica curta (máx. 200 caracteres) para o estudante resolver o caso, focando apenas em integrar achados radiológicos com o contexto clínico. Não use frases genéricas, seja objetivo.`;
      const { data, error } = await supabase.functions.invoke("case-autofill", {
        body: {
          diagnosis: form.title || "",
          findings: form.findings || "",
          modality: form.modality || "",
          subtype: form.subtype || "",
          withHintOnly: true,
          systemPrompt: contextHint,
        }
      });
      if (error) throw new Error(error.message || "Falha IA ao gerar dica.");
      let hint = "";

      // Nova convenção: resposta vem como { suggestion: { hint: ... } }
      if (data?.suggestion?.hint) {
        hint = String(data.suggestion.hint).slice(0, 200);
      } else if (typeof data?.suggestion === "string") {
        hint = String(data.suggestion).slice(0, 200);
      } else {
        // fallback genérico
        hint = "Dica centrada na integração dos achados radiológicos com o contexto clínico.";
      }

      setForm((prev: any) => ({ ...prev, manual_hint: hint }));
      toast({ description: "Dica sugerida automaticamente pela IA com máximo de 200 caracteres." });
    } catch (err: any) {
      setForm((prev: any) => ({
        ...prev,
        manual_hint: "Dica gerada automaticamente (não personalizada: revise achados e quadro clínico)."
      }));
      toast({ variant: "destructive", description: "Falha IA. Usando explicação curta padrão." });
    }
    setSubmitting(false);
  }
  async function handleSuggestExplanation() {
    if (!form.findings && !form.main_question && !form.title) {
      toast({ description: "Preencha Achados, Pergunta Principal ou Diagnóstico para sugerir uma explicação." });
      return;
    }
    // Sempre foca e encurta ainda mais
    if (!form.findings && !form.title && !form.patient_clinical_info) {
      toast({ description: "Preencha Achados Radiológicos, Diagnóstico ou Resumo Clínico para sugerir explicação." });
      return;
    }
    const msg = `Como especialista em radiologia, integre achados radiológicos e contexto clínico no mínimo de palavras possível:`;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("case-autofill", {
        body: {
          diagnosis: form.title || "",
          findings: form.findings || "",
          modality: form.modality || "",
          subtype: form.subtype || "",
        }
      });
      if (error) throw new Error(error.message);
      const explanation = data?.suggestion?.explanation;
      setForm((prev: any) => ({
        ...prev,
        explanation: explanation ?? ""
      }));
      toast({ description: "Explicação sugerida pela IA com foco objetivo clínica-radiológica." });
    } catch (err: any) {
      // fallback local, se IA não responder
      setForm((prev: any) => ({
        ...prev,
        explanation: "Achado radiológico integrado ao quadro clínico direciona o diagnóstico."
      }));
      toast({ variant: "destructive", description: "Falha IA. Usando explicação curta padrão." });
    }
    setSubmitting(false);
  }
  async function handleGenerateAutoTitle() {
    if (!form.category_id || !form.modality) {
      toast({ description: "Selecione uma categoria e modalidade primeiro." });
      return;
    }
    setSubmitting(true);
    try {
      const categoria = categories.find((c: any) => String(c.id) === String(form.category_id))?.name || "";
      const { data } = await supabase
        .from("medical_cases")
        .select("id", { count: "exact", head: true })
        .eq("category_id", Number(form.category_id))
        .eq("modality", form.modality);
      const nextNumber = (data?.length ?? 0) + 1;
      const autoTitle = `${categoria} - ${form.modality} #${nextNumber}`;

      setForm((prev: any) => ({
        ...prev,
        title: autoTitle,
        case_number: nextNumber
      }));
      toast({ description: "Título gerado automaticamente!" });
    } catch (err: any) {
      toast({ variant: "destructive", description: "Falha ao gerar o título automático." });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSuggestFindings() {
    if (!form.title?.trim() && !form.modality?.trim()) {
      toast({ description: "Preencha Diagnóstico e/ou Modalidade para sugerir os achados." });
      return;
    }
    setSubmitting(true);
    try {
      const contextFindings = `Você é especialista em radiologia. Gere uma descrição de achados radiológicos concisa (máx. 200 caracteres), associando com o diagnóstico e modalidades fornecidos.`;
      const { data, error } = await supabase.functions.invoke("case-autofill", {
        body: {
          diagnosis: form.title || "",
          modality: form.modality || "",
          subtype: form.subtype || "",
          withFindingsOnly: true,
          systemPrompt: contextFindings,
        }
      });
      if (error) throw new Error(error.message || "Falha IA ao sugerir achados.");
      let findings = "";
      if (data?.suggestion?.findings) {
        findings = String(data.suggestion.findings).slice(0, 200);
      } else if (typeof data?.suggestion === "string") {
        findings = String(data.suggestion).slice(0, 200);
      }
      if (!findings) findings = "Achados sugeridos automaticamente. Ajuste conforme o caso clínico.";
      setForm((prev: any) => ({ ...prev, findings }));
      toast({ description: "Achados sugeridos via IA! Revise se necessário." });
    } catch (err: any) {
      setForm((prev: any) => ({
        ...prev,
        findings: "Achados gerados automaticamente (não personalizados: revise achados e quadro clínico)."
      }));
      toast({ variant: "destructive", description: "Falha IA ao sugerir achados (IA não respondeu)." });
    }
    setSubmitting(false);
  }

  async function handleSuggestClinicalInfo() {
    if (!form.title?.trim() && !form.modality?.trim()) {
      toast({ description: "Preencha Diagnóstico e/ou Modalidade para sugerir o resumo clínico." });
      return;
    }
    setSubmitting(true);
    try {
      const contextClinical = `Você é especialista em radiologia. Gere um resumo clínico conciso (máximo 300 caracteres) integrando as informações do diagnóstico/modalidade.`;
      const { data, error } = await supabase.functions.invoke("case-autofill", {
        body: {
          diagnosis: form.title || "",
          modality: form.modality || "",
          subtype: form.subtype || "",
          withClinicalInfoOnly: true,
          systemPrompt: contextClinical,
        }
      });
      if (error) throw new Error(error.message || "Falha IA ao sugerir resumo clínico.");
      let patient_clinical_info = "";
      if (data?.suggestion?.patient_clinical_info) {
        patient_clinical_info = String(data.suggestion.patient_clinical_info).slice(0, 300);
      } else if (typeof data?.suggestion === "string") {
        patient_clinical_info = String(data.suggestion).slice(0, 300);
      }
      if (!patient_clinical_info) patient_clinical_info = "Resumo clínico sugerido automaticamente. Ajuste conforme necessário.";
      setForm((prev: any) => ({ ...prev, patient_clinical_info }));
      toast({ description: "Resumo clínico sugerido via IA! Revise se necessário." });
    } catch (err: any) {
      setForm((prev: any) => ({
        ...prev,
        patient_clinical_info: "Resumo gerado automaticamente (não personalizado, revise!)."
      }));
      toast({ variant: "destructive", description: "Falha IA ao sugerir resumo clínico." });
    }
    setSubmitting(false);
  }

  return {
    normalizeString,
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
