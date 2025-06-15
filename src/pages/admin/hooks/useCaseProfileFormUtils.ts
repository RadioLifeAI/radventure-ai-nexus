import { supabase } from "@/integrations/supabase/client";
import { buildAutoAdvancedFields } from "./autoAdvancedUtils";
import { shuffleAlternativesWithFeedback } from "./shuffleUtils";
import { normalizeString, suggestPointsByDifficulty, safeStr, safeArr } from "./caseFormHelpers";

export function useCaseProfileFormUtils({
  form,
  setForm,
  setSubmitting,
  categories,
  difficulties,
  toast,
  setHighlightedFields
}: any) {
  function suggestPointsByDifficulty(level: string) {
    switch (level) {
      case "1": return "10";
      case "2": return "20";
      case "3": return "30";
      case "4": return "50";
      default:  return "10";
    }
  }

  // NOVA função para revisar o diagnóstico com a IA
  async function getDiagnosisReviewedByAI(diagnosisText: string) {
    if (!diagnosisText?.trim()) return diagnosisText;
    try {
      const { data, error } = await supabase.functions.invoke("case-autofill", {
        body: {
          reviewDiagnosisOnly: true,
          diagnosis: diagnosisText
        }
      });
      // Espera-se { suggestion: { diagnosis_reviewed: "..." } }
      if (error) throw new Error(error.message);
      const text = data?.suggestion?.diagnosis_reviewed ?? data?.suggestion?.diagnosis ?? "";
      if (typeof text === "string" && text.trim() !== "") return text.trim();
      // fallback: capitalizar localmente se não houver resposta da IA
      return diagnosisText.charAt(0).toUpperCase() + diagnosisText.slice(1);
    } catch (err: any) {
      return diagnosisText.charAt(0).toUpperCase() + diagnosisText.slice(1);
    }
  }

  async function handleAutoFillCaseDetails() {
    if (!form.diagnosis_internal?.trim()) {
      toast({ description: "Por favor, preencha o campo Diagnóstico para sugerir todos os detalhes." });
      return;
    }
    setSubmitting(true);
    try {
      // REVISA O DIAGNÓSTICO antes de enviar aos prompts para IA!
      const diagnosisCorrigido = await getDiagnosisReviewedByAI(form.diagnosis_internal);

      if (diagnosisCorrigido && diagnosisCorrigido !== form.diagnosis_internal) {
        setForm((prev: any) => ({ ...prev, diagnosis_internal: diagnosisCorrigido }));
      }

      const body: any = { diagnosis: diagnosisCorrigido };
      if (form.findings?.trim()) body.findings = form.findings.trim();
      if (form.modality?.trim()) body.modality = form.modality.trim();
      if (form.subtype?.trim()) body.subtype = form.subtype.trim();

      const { data, error } = await supabase.functions.invoke("case-autofill", { body });

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

      // Busca dificuldade mais próxima
      let dificuldadeId = "";
      if (suggestion.difficulty) {
        const byLevel = difficulties.find(
          (diff: any) => String(diff.level) === String(suggestion.difficulty)
        );
        if (byLevel) {
          dificuldadeId = String(byLevel.level);
        } else {
          // Se veio descrição, tenta encontrar por ela
          if (suggestion.difficulty_description) {
            const byDescr = difficulties.find(
              (diff: any) => normalizeString(diff.description ?? "") === normalizeString(suggestion.difficulty_description)
            );
            if (byDescr) dificuldadeId = String(byDescr.level);
          }
        }
      }

      // --- MODALIDADE/SUBTIPO (igual antes) ---
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

      let newModality = form.modality;
      if (suggestion.modality && ALL_MODALITIES.includes(suggestion.modality)) {
        newModality = suggestion.modality;
      }
      let newSubtype = form.subtype;
      if (suggestion.subtype && ALL_SUBTYPES.includes(suggestion.subtype)) {
        newSubtype = suggestion.subtype;
      }

      // NOVO: define pontos baseado na difficulty sugerida (se houver!)
      let pontosSugeridos = "10";
      if (suggestion.points !== undefined && suggestion.points !== null) {
        pontosSugeridos = String(suggestion.points);
      } else if (dificuldadeId) {
        pontosSugeridos = String(suggestPointsByDifficulty(dificuldadeId));
      }

      // Usar util de advanced auto fill (agora dinâmica!):
      const autoAdvanced = buildAutoAdvancedFields(suggestion, { ...form, difficulty_level: dificuldadeId });

      // SHUFFLE LOGIC (igual)
      const shuffle = shuffleAlternativesWithFeedback(
        Array.isArray(suggestion.answer_options) ? suggestion.answer_options.slice(0, 4) : ["", "", "", ""],
        Array.isArray(suggestion.answer_feedbacks) ? suggestion.answer_feedbacks.slice(0, 4) : ["", "", "", ""],
        Array.isArray(suggestion.answer_short_tips) ? suggestion.answer_short_tips.slice(0, 4) : ["", "", "", ""],
        0
      );

      setForm((prev: any) => {
        const safeStr = (v: any) => (v === null || v === undefined ? "" : String(v));
        const safeArr = (a: any[] | undefined, fallbackLen = 4) => {
          if (Array.isArray(a)) return a.map(safeStr).concat(Array(fallbackLen).fill("")).slice(0, fallbackLen);
          return Array(fallbackLen).fill("");
        };

        return {
          ...prev,
          category_id: categoriaId,
          difficulty_level: dificuldadeId,
          points: pontosSugeridos,
          modality: newModality,
          subtype: newSubtype,
          findings: safeStr(suggestion.findings ?? ""),
          patient_clinical_info: safeStr(suggestion.patient_clinical_info ?? ""),
          explanation: suggestion.explanation ?? "",
          answer_feedbacks: shuffle.feedbacks,
          patient_age: safeStr(suggestion.patient_age ?? ""),
          patient_gender: safeStr(suggestion.patient_gender ?? ""),
          symptoms_duration: safeStr(suggestion.symptoms_duration ?? ""),
          main_question: safeStr(suggestion.main_question ?? ""),
          answer_options: shuffle.options,
          answer_short_tips: shuffle.tips,
          correct_answer_index: shuffle.correctIdx,
          // NOVO: Avançados recalculados a cada solicitação!
          ...autoAdvanced
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
        // Avançados:
        "can_skip",
        "max_elimination",
        "ai_hint_enabled",
        "manual_hint",
        "skip_penalty_points",
        "elimination_penalty_points",
        "ai_tutor_level"
      ]);
      setTimeout(() => setHighlightedFields([]), 2500);
      toast({
        title: "Campos preenchidos por IA!",
        description: "Todos os campos do formulário, incluindo categoria, dificuldade e configurações avançadas, foram preenchidos automaticamente com base na sugestão da IA. Revise as sugestões — especialmente explicação curta, integração de achados e quadro clínico."
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

  async function handleSuggestDiagnosis() {
    if (!form.findings && !form.patient_clinical_info) {
      toast({ description: "Preencha Achados Radiológicos e/ou Resumo Clínico para sugerir um diagnóstico." });
      return;
    }
    setForm((prev: any) => ({ ...prev, diagnosis_internal: "Diagnóstico sugerido pelo sistema (placeholder)" }));
    toast({ description: "Diagnóstico sugerido automaticamente (personalize se desejar)." });
  }

  async function handleSuggestAlternatives() {
    if (!form.diagnosis_internal) {
      toast({ description: "Preencha o campo Diagnóstico para sugerir alternativas." });
      return;
    }
    setSubmitting(true);
    try {
      const reqBody: any = {
        diagnosis: form.diagnosis_internal,
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
      const contextHint = `Você é um especialista em radiologia e diagnóstico por imagem, e deve fornecer uma dica curta (máx. 200 caracteres) para o estudante resolver o caso, focando apenas em integrar achados radiológicos com o contexto clínico. Não use frases genéricas, seja objetivo.`;
      const { data, error } = await supabase.functions.invoke("case-autofill", {
        body: {
          diagnosis: form.diagnosis_internal || "",
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
    if (!form.findings && !form.main_question && !form.diagnosis_internal) {
      toast({ description: "Preencha Achados, Pergunta Principal ou Diagnóstico para sugerir uma explicação." });
      return;
    }
    // Sempre foca e encurta ainda mais
    if (!form.findings && !form.diagnosis_internal && !form.patient_clinical_info) {
      toast({ description: "Preencha Achados Radiológicos, Diagnóstico ou Resumo Clínico para sugerir explicação." });
      return;
    }
    const msg = `Como especialista em radiologia, integre achados radiológicos e contexto clínico no mínimo de palavras possível:`;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("case-autofill", {
        body: {
          diagnosis: form.diagnosis_internal || "",
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

  async function handleGenerateCaseTitleAuto() {
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
    if (!form.diagnosis_internal?.trim() && !form.modality?.trim()) {
      toast({ description: "Preencha Diagnóstico e/ou Modalidade para sugerir os achados." });
      return;
    }
    setSubmitting(true);
    try {
      const contextFindings = `Você é especialista em radiologia. Gere uma descrição de achados radiológicos concisa (máx. 200 caracteres), associando com o diagnóstico e modalidades fornecidos.`;
      const { data, error } = await supabase.functions.invoke("case-autofill", {
        body: {
          diagnosis: form.diagnosis_internal || "",
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
    if (!form.diagnosis_internal?.trim() && !form.modality?.trim()) {
      toast({ description: "Preencha Diagnóstico e/ou Modalidade para sugerir o resumo clínico." });
      return;
    }
    setSubmitting(true);
    try {
      const contextClinical = `Você é especialista em radiologia. Gere um resumo clínico conciso (máximo 300 caracteres) integrando as informações do diagnóstico/modalidade.`;
      const { data, error } = await supabase.functions.invoke("case-autofill", {
        body: {
          diagnosis: form.diagnosis_internal || "",
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
    handleSuggestDiagnosis,
    handleSuggestAlternatives,
    handleSuggestHint,
    handleSuggestExplanation,
    handleGenerateCaseTitleAuto,
    handleSuggestFindings,
    handleSuggestClinicalInfo
  };
}
