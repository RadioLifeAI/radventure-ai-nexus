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

      // --- NOVA LÓGICA para garantir os selects corretos de modalidade/subtipo ---
      const ALL_MODALITIES = [
        "Tomografia Computadorizada (TC)",
        "Ressonância Magnética (RM)",
        "Ultrassonografia (US)",
        "Radiografia (RX)",
        "Mamografia (MMG)",
        "Medicina Nuclear (MN)",
        "Radiologia Intervencionista (RI)",
        "Fluoroscopia",
        "Densitometria Óssea (DMO)"
      ];

      const ALL_SUBTYPES = [
        // Tomografia Computadorizada (TC)
        "Angio-TC de Crânio", "Angio-TC de Pescoço e Carótidas", "Angio-TC de Tórax", "Angio-TC de Aorta", "Angio-TC de Artérias Coronárias", "Angio-TC de Vasos Abdominais", "Angio-TC de Membros Inferiores/Superiores", "TC Crânio", "TC Seios da Face", "TC Pescoço", "TC Tórax", "TC Abdome Total", "TC Pelve", "Uro-TC", "Entero-TC", "TC Coluna", "TC Musculoesquelético",
        // Ressonância Magnética (RM)
        "RM Encéfalo", "Angio-RM de Crânio", "RM Sela Túrcica / Hipófise", "RM Órbitas", "RM Pescoço", "RM Tórax", "RM Mama", "RM Cardíaca", "RM Abdome Superior", "Colangio-RM", "Entero-RM", "RM Pelve", "RM Coluna", "RM ATM", "RM Musculoesquelético", "Artro-RM",
        // Ultrassonografia (US)
        "US Abdominal Total", "US Abdome Superior", "US Rins e Vias Urinárias", "US Pélvico (Suprapúbico)", "US Pélvico Transvaginal", "US Próstata", "US Obstétrico", "US Mama e Axilas", "US Tireoide e Cervical", "US Glândulas Salivares", "US Musculoesquelético", "US Partes Moles", "US Doppler Vascular", "Ecocardiograma Transtorácico",
        // Radiografia (RX)
        "RX Tórax", "RX Abdome Simples e Agudo", "RX Coluna", "RX Crânio e Face", "RX de Extremidades", "RX Pelve e Bacia", "RX Escanometria", "RX Panorâmica de Mandíbula",
        // Mamografia (MMG)
        "Mamografia Digital Bilateral", "Mamografia Diagnóstica", "Tomossíntese Mamária", "Mamografia com Contraste",
        // Medicina Nuclear (MN)
        "Cintilografia Óssea", "Cintilografia Miocárdica", "Cintilografia Renal", "Cintilografia de Tireoide", "PET-CT Oncológico", "PET-CT com PSMA", "PET-CT com FDG",
        // Radiologia Intervencionista (RI)
        "Angioplastia e Stent", "Biópsia Guiada", "Drenagem de Abscessos", "Quimioembolização Hepática", "Ablação por Radiofrequência", "Vertebroplastia",
        // Fluoroscopia
        "Estudo Contrastado do Esôfago, Estômago e Duodeno (EED)", "Trânsito Intestinal", "Enema Opaco", "Histerossalpingografia (HSG)", "Uretrocistografia Miccional",
        // Densitometria Óssea (DMO)
        "Densitometria de Coluna e Fêmur", "Densitometria de Corpo Inteiro"
      ];

      // Se a IA sugeriu uma modalidade válida, use-a; senão mantenha a anterior
      let newModality = form.modality;
      if (suggestion.modality && ALL_MODALITIES.includes(suggestion.modality)) {
        newModality = suggestion.modality;
      }
      let newSubtype = form.subtype;
      if (suggestion.subtype && ALL_SUBTYPES.includes(suggestion.subtype)) {
        newSubtype = suggestion.subtype;
      }

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
          modality: newModality,
          subtype: newSubtype,
          findings: safeStr(suggestion.findings ?? ""), // SEMPRE usa sugestão IA
          patient_clinical_info: safeStr(suggestion.patient_clinical_info ?? ""),
          explanation: suggestion.explanation ?? "",
          answer_feedbacks: Array.isArray(suggestion.answer_feedbacks)
            ? suggestion.answer_feedbacks.map((f: string) => f ?? "").slice(0, 4)
            : ["", "", "", ""],
          patient_age: safeStr(suggestion.patient_age ?? ""),
          patient_gender: safeStr(suggestion.patient_gender ?? ""),
          symptoms_duration: safeStr(suggestion.symptoms_duration ?? ""),
          answer_options: safeArr(suggestion.answer_options, 4),
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
        description: "Revise as sugestões — principalmente a explicação curta, focada na integração entre achados radiológicos e o contexto clínico.",
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
      setForm((prev: any) => ({
        ...prev,
        answer_options: Array.isArray(suggestion.answer_options) ? suggestion.answer_options.slice(0,4) : ["", "", "", ""],
        answer_feedbacks: Array.isArray(suggestion.answer_feedbacks) ? suggestion.answer_feedbacks.slice(0,4) : ["", "", "", ""],
        answer_short_tips: Array.isArray(suggestion.answer_short_tips) ? suggestion.answer_short_tips.slice(0,4) : ["", "", "", ""],
        correct_answer_index: 0
      }));
      toast({ description: "Alternativas sugeridas por IA considerando os principais diagnósticos diferenciais." });
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
