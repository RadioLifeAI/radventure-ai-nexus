
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
      // Importa as opções do componente para comparação
      // Como os MODALIDADADES estão apenas no componente, copiamos aqui o array para validação
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

      // Subtipos possíveis (flattened)
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
      // Se a IA sugeriu um subtipo válido, use-o; senão mantenha o anterior
      let newSubtype = form.subtype;
      if (suggestion.subtype && ALL_SUBTYPES.includes(suggestion.subtype)) {
        newSubtype = suggestion.subtype;
      }

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
    setForm((prev: any) => ({ ...prev, title: "Título sugerido pelo sistema (placeholder)" }));
    toast({ description: "Título sugerido automaticamente (personalize se desejar)." });
  }
  async function handleSuggestAlternatives() {
    if (!form.findings && !form.patient_clinical_info) {
      toast({ description: "Preencha Achados Radiológicos e Resumo Clínico para gerar alternativas." });
      return;
    }
    setForm((prev: any) => ({
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
    setForm((prev: any) => ({ ...prev, manual_hint: "Dica gerada automaticamente (placeholder IA)." }));
    toast({ description: "Dica sugerida automaticamente (futuramente via IA, edite se desejar)." });
  }
  async function handleSuggestExplanation() {
    if (!form.findings && !form.main_question && !form.title) {
      toast({ description: "Preencha Achados, Pergunta Principal ou Diagnóstico para sugerir uma explicação." });
      return;
    }
    setForm((prev: any) => ({
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
  return {
    normalizeString,
    suggestPointsByDifficulty,
    handleAutoFillCaseDetails,
    handleSuggestTitle,
    handleSuggestAlternatives,
    handleSuggestHint,
    handleSuggestExplanation,
    handleGenerateAutoTitle
  };
}
