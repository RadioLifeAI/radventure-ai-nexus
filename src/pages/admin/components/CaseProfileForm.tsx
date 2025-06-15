import React, { useEffect, useState } from "react";
import { useCaseProfileFormState } from "../hooks/useCaseProfileFormState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadWithZoom } from "./ImageUploadWithZoom";
import { supabase } from "@/integrations/supabase/client";
import { CaseModalityFields } from "./CaseModalityFields";
import { toast } from "@/components/ui/use-toast";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { CasePreviewModal } from "./CasePreviewModal";
import { CaseProfileBasicSection } from "./CaseProfileBasicSection";
import { CaseProfileAlternativesSection } from "./CaseProfileAlternativesSection";
import { CaseProfileExplanationSection } from "./CaseProfileExplanationSection";
import { CaseProfileAdvancedConfig } from "./CaseProfileAdvancedConfig";

const GENDER_OPTIONS = [
  { value: "", label: "Selecione..." },
  { value: "Masculino", label: "Masculino" },
  { value: "Feminino", label: "Feminino" },
  { value: "Outro", label: "Outro" }
];

const AI_TUTOR_LEVELS = [
  { value: "desligado", label: "Desligado" },
  { value: "basico", label: "Básico" },
  { value: "detalhado", label: "Detalhado" }
];

export function CaseProfileForm({ onCreated }: { onCreated?: () => void }) {
  // Listas vindas do banco para selects
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [difficulties, setDifficulties] = useState<{id: number, level: number, description: string | null}[]>([]);
  
  // Usar nosso novo hook de estado do formulário
  const { form, setForm, resetForm } = useCaseProfileFormState();

  // Form fields
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  // Adiciona controle para destacar campos autocompletados
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);

  // Função utilitária para normalizar nomes de categoria (remove acentos e caixa alta/baixa)
  function normalizeString(str: string = "") {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  // Lógica para sugestão automática de pontos conforme dificuldade
  function suggestPointsByDifficulty(level: string) {
    switch (level) {
      case "1":
        return "10";
      case "2":
        return "20";
      case "3":
        return "30";
      case "4":
        return "50";
      default:
        return "10";
    }
  }

  // Carregar selects de categorias e dificuldades
  useEffect(() => {
    supabase.from("medical_specialties")
      .select("id, name")
      .then(({ data, error }) => {
        if (error) {
          console.error("Erro carregando especialidades:", error);
        } else {
          setCategories(data || []);
        }
      });
    supabase.from("difficulties")
      .select("id, level, description")
      .order("level", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Erro carregando dificuldades:", error);
        } else {
          setDifficulties(data || []);
        }
      });
  }, []);

  // --- NOVA FUNÇÃO: AUTO-PREENCHIMENTO DOS CAMPOS USANDO API AI ---
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

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type, checked } = e.target as any;
    if (name === "difficulty_level") {
      setForm((prev) => ({
        ...prev,
        [name]: value,
        points: suggestPointsByDifficulty(value),
      }));
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleModalityChange(val: { modality: string; subtype: string }) {
    setForm((prev) => ({ ...prev, modality: val.modality, subtype: val.subtype }));
  }

  function handleOptionChange(idx: number, val: string) {
    setForm((prev) => {
      const opts = [...prev.answer_options];
      opts[idx] = val;
      return { ...prev, answer_options: opts };
    });
  }
  function handleOptionFeedbackChange(idx: number, val: string) {
    setForm((prev) => {
      const arr = [...prev.answer_feedbacks];
      arr[idx] = val;
      return { ...prev, answer_feedbacks: arr };
    });
  }
  function handleShortTipChange(idx: number, val: string) {
    setForm((prev) => {
      const arr = [...prev.answer_short_tips];
      arr[idx] = val;
      return { ...prev, answer_short_tips: arr };
    });
  }
  function handleCorrectChange(idx: number) {
    setForm((prev) => ({ ...prev, correct_answer_index: idx }));
  }
  function handleImageChange(url: string | null) {
    setForm((prev) => ({ ...prev, image_url: url || "" }));
  }

  // Botão: Sugerir título (futuro: chamar IA ou API - atualmente só placeholder)
  async function handleSuggestTitle() {
    if (!form.findings && !form.patient_clinical_info) {
      toast({ description: "Preencha Achados Radiológicos e/ou Resumo Clínico para sugerir um título." });
      return;
    }
    // Placeholder: apenas exemplo de sugestão.
    setForm(prev => ({ ...prev, title: "Título sugerido pelo sistema (placeholder)" }));
    toast({ description: "Título sugerido automaticamente (personalize se desejar)." });
  }

  // Botão: Gerar alternativas (futuro: chamar IA ou API - atualmente só placeholder)
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

  // --- NOVO: Gerar dica automaticamente (placeholder para IA futura) ---
  async function handleSuggestHint() {
    if (!form.findings && !form.patient_clinical_info) {
      toast({ description: "Preencha Achados Radiológicos e/ou Resumo Clínico para sugerir uma dica." });
      return;
    }
    setForm(prev => ({ ...prev, manual_hint: "Dica gerada automaticamente (placeholder IA)." }));
    toast({ description: "Dica sugerida automaticamente (futuramente via IA, edite se desejar)." });
  }

  // NOVA FUNÇÃO: Gerar explicação automaticamente (placeholder IA/API)
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

  // --- EMBARALHAMENTO DE ALTERNATIVAS ---
  function getShuffledAlternatives() {
    // Retorna novas alternativas embaralhadas (apenas cópia, sem alterar o form ainda)
    const indices = [0, 1, 2, 3];
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.map(idx => ({
      answer: form.answer_options[idx],
      idx,
      isCorrect: idx === form.correct_answer_index
    }));
  }

  // NOVO: Função para buscar o próximo número do caso para categoria/modalidade selecionados
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    // Para garantir numeração correta, conta novamente antes do insert para evitar duplicatas
    let caseNumber = form.case_number;
    if ((!caseNumber || isNaN(Number(caseNumber))) && form.category_id && form.modality) {
      const { data } = await supabase
        .from("medical_cases")
        .select("id", { count: "exact", head: true })
        .eq("category_id", Number(form.category_id))
        .eq("modality", form.modality);
      caseNumber = ((data?.length ?? 0) + 1);
    }

    const payload: any = {
      specialty: categories.find(c => String(c.id) === String(form.category_id))?.name || null,
      category_id: form.category_id ? Number(form.category_id) : null,
      case_number: caseNumber ?? null,
      difficulty_level: form.difficulty_level ? Number(form.difficulty_level) : null,
      points: form.points ? Number(form.points) : null,
      modality: form.modality || null,
      subtype: form.subtype || null,
      title: form.title,
      findings: form.findings,
      patient_age: form.patient_age,
      patient_gender: form.patient_gender,
      symptoms_duration: form.symptoms_duration,
      patient_clinical_info: form.patient_clinical_info,
      main_question: form.main_question,
      explanation: form.explanation,
      answer_options: form.answer_options,
      answer_feedbacks: form.answer_feedbacks,
      answer_short_tips: form.answer_short_tips,
      correct_answer_index: form.correct_answer_index,
      image_url: form.image_url,
      // Novos campos
      can_skip: form.can_skip,
      max_elimination: form.max_elimination,
      ai_hint_enabled: form.ai_hint_enabled,
      manual_hint: form.manual_hint,
      skip_penalty_points: form.skip_penalty_points,
      elimination_penalty_points: form.elimination_penalty_points,
      ai_tutor_level: form.ai_tutor_level,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    Object.keys(payload).forEach(k => {
      if (typeof payload[k] === "string" && payload[k] === "") payload[k] = null;
    });

    const { error } = await supabase.from("medical_cases").insert([payload]);
    if (!error) {
      setFeedback("Caso cadastrado com sucesso!");
      resetForm();
      onCreated?.();
    } else {
      setFeedback("Erro ao cadastrar caso.");
    }
    setSubmitting(false);
    setTimeout(() => setFeedback(""), 2300);
  }

  // Substitute the old renderTooltipTip to use shadcn/ui Tooltip
  function renderTooltipTip(id: string, text: string) {
    // shadcn/ui Tooltip doesn't require id - just show tooltip on hover
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="ml-1 text-cyan-700 cursor-help align-middle">
            ⓘ
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <span className="text-xs">{text}</span>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <form className="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto space-y-5" onSubmit={handleSubmit}>
      <CasePreviewModal open={showPreview} onClose={() => setShowPreview(false)} form={form} categories={categories} difficulties={difficulties} />
      <h2 className="text-xl font-bold mb-2">Criar Novo Caso Médico</h2>
      <div className="mb-3 flex gap-2">
        <Button type="button" onClick={() => setShowPreview(true)} variant="outline">
          Pré-visualizar Caso como Usuário
        </Button>
        <Button type="button" onClick={handleSuggestTitle} variant="secondary" className="mb-1">
          Sugerir Diagnóstico
        </Button>
        <Button type="button" onClick={handleAutoFillCaseDetails} variant="secondary" className="mb-1">
          Auto-preencher detalhes do caso
        </Button>
        {/* NOVO: Botão de gerar título automático */}
        <Button type="button" onClick={handleGenerateAutoTitle} variant="secondary" className="mb-1">
          Gerar título automático
        </Button>
      </div>
      <CaseProfileBasicSection
        form={form}
        highlightedFields={highlightedFields}
        categories={categories}
        difficulties={difficulties}
        handleFormChange={handleFormChange}
        handleModalityChange={handleModalityChange}
        handleAutoFillCaseDetails={handleAutoFillCaseDetails}
        handleSuggestTitle={handleSuggestTitle}
        handleImageChange={handleImageChange}
        renderTooltipTip={renderTooltipTip}
      />
      <label className="font-semibold block mt-3">
        Pergunta Principal *
        {renderTooltipTip("tip-main-question", "Esta pergunta será apresentada ao usuário e guiará o raciocínio clínico.")}
      </label>
      <Input name="main_question" value={form.main_question} onChange={handleFormChange} placeholder="Ex: Qual é o diagnóstico mais provável?" required />
      <CaseProfileAlternativesSection
        form={form}
        highlightedFields={highlightedFields}
        handleOptionChange={handleOptionChange}
        handleOptionFeedbackChange={handleOptionFeedbackChange}
        handleShortTipChange={handleShortTipChange}
        handleCorrectChange={handleCorrectChange}
        handleSuggestAlternatives={handleSuggestAlternatives}
        renderTooltipTip={renderTooltipTip}
      />
      <CaseProfileExplanationSection
        form={form}
        highlightedFields={highlightedFields}
        handleFormChange={handleFormChange}
        handleSuggestExplanation={handleSuggestExplanation}
        renderTooltipTip={renderTooltipTip}
      />
      {/* ================== SEÇÃO AVANÇADA ===================== */}
      <div className="mt-7">
        <button
          type="button"
          className="text-cyan-700 font-semibold hover:underline"
          onClick={() => setShowAdvanced(v => !v)}
        >
          {showAdvanced ? "Ocultar" : "Mostrar"} Configurações Avançadas
        </button>
        {showAdvanced && (
          <CaseProfileAdvancedConfig
            form={form}
            handleFormChange={handleFormChange}
            handleSuggestHint={handleSuggestHint}
          />
        )}
      </div>
      {/* ================== FIM SEÇÃO AVANÇADA ===================== */}
      <Button type="submit" disabled={submitting}>Salvar Caso</Button>
      {feedback && (
        <span className="ml-4 text-sm font-medium text-cyan-700">{feedback}</span>
      )}
    </form>
  );
}
