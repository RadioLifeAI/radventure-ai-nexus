import React, { useEffect, useState } from "react";
import { useCaseProfileFormHandlers } from "../hooks/useCaseProfileFormHandlers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { CaseProfileBasicSection } from "./CaseProfileBasicSection";
import { CaseProfileAlternativesSection } from "./CaseProfileAlternativesSection";
import { CaseProfileExplanationSectionContainer } from "./CaseProfileExplanationSectionContainer";
import { CaseProfileAdvancedConfigContainer } from "./CaseProfileAdvancedConfigContainer";
import { useFieldUndo } from "../hooks/useFieldUndo";
import { useCaseTitleGenerator } from "../hooks/useCaseTitleGenerator";
import { CaseProfileFormTitleSection } from "./CaseProfileFormTitleSection";
import { CaseProfileFormPreviewModal } from "./CaseProfileFormPreviewModal";
import { supabase } from "@/integrations/supabase/client";

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
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [difficulties, setDifficulties] = useState<{ id: number; level: number; description: string | null }[]>([]);

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

  const handlers = useCaseProfileFormHandlers({ categories, difficulties });
  const {
    form, setForm, resetForm, submitting, setSubmitting, feedback, setFeedback,
    showAdvanced, setShowAdvanced, showPreview, setShowPreview, highlightedFields, setHighlightedFields,
    handleFormChange, handleModalityChange, handleOptionChange, handleOptionFeedbackChange,
    handleShortTipChange, handleCorrectChange, handleImageChange,
    handleAutoFillCaseDetails, handleSuggestDiagnosis, handleSuggestAlternatives, handleSuggestHint, handleSuggestExplanation, handleGenerateCaseTitleAuto,
    handleSuggestFindings, handleSuggestClinicalInfo,
    handleRandomizeOptions
  } = handlers;

  // ==== NOVO: Gerador de título de caso modular ====
  const { generateTitle, abbreviateCategory, generateRandomCaseNumber } = useCaseTitleGenerator(categories);

  // Preview do título automático
  const autoTitlePreview =
    form.category_id && form.modality
      ? `Caso ${abbreviateCategory(categories.find(c => String(c.id) === String(form.category_id))?.name || "")} ${form.case_number || generateRandomCaseNumber()}`
      : "(Será definido automaticamente após salvar: Caso [ABREV] [NUM ALEATÓRIO])";

  // Lógica de auto-geração de título ao trocar categoria/modality
  useEffect(() => {
    if (form.category_id && form.modality && (!form.case_number || !form.title)) {
      const { title, case_number } = generateTitle(form.category_id, form.modality);
      setForm((prev: any) => ({ ...prev, title, case_number }));
    }
    // eslint-disable-next-line
  }, [form.category_id, form.modality]);

  // Hooks de undo
  const undoFindings = useFieldUndo(handlers.form.findings);
  const undoClinical = useFieldUndo(handlers.form.patient_clinical_info);
  const undoDiagnosis = useFieldUndo(handlers.form.diagnosis_internal);

  // Funções auxiliares
  const onSuggestFindings = async () => {
    undoFindings.handleBeforeChange(handlers.form.findings);
    await handlers.handleSuggestFindings();
  };
  const onSuggestClinical = async () => {
    undoClinical.handleBeforeChange(handlers.form.patient_clinical_info);
    await handlers.handleSuggestClinicalInfo();
  };
  const onSuggestDiagnosis = async () => {
    undoDiagnosis.handleBeforeChange(handlers.form.diagnosis_internal);
    await handlers.handleSuggestDiagnosis();
  };

  function renderTooltipTip(id: string, text: string) {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Garante que sempre vai enviar um número aleatório de 6 dígitos se não existe
      let caseNumber = form.case_number;
      if ((!caseNumber || isNaN(Number(caseNumber))) && form.category_id && form.modality) {
        caseNumber = generateRandomCaseNumber();
      }
      const selectedCategory = categories.find(c => String(c.id) === String(form.category_id));
      const diagnosis_internal = form.diagnosis_internal ?? "";

      // Garante salvação de array JSON (até 6) [{url, legend}]
      let image_url_arr: any[] = [];
      // If current value is array, use as is. If string (legacy), try to parse, else empty array
      if (Array.isArray(form.image_url)) {
        image_url_arr = form.image_url;
      } else if (typeof form.image_url === "string" && (form.image_url as string).trim() !== "") {
        try {
          const parsed = JSON.parse(form.image_url as string);
          image_url_arr = Array.isArray(parsed) ? parsed : [];
        } catch {
          image_url_arr = [];
        }
      } else {
        image_url_arr = [];
      }
      const image_url = image_url_arr.slice(0, 6).map((img: any) => ({
        url: img?.url ?? "",
        legend: img?.legend ?? ""
      }));

      const payload: any = {
        specialty: selectedCategory ? selectedCategory.name : null,
        category_id: form.category_id ? Number(form.category_id) : null,
        case_number: caseNumber ?? null,
        difficulty_level: form.difficulty_level ? Number(form.difficulty_level) : null,
        points: form.points ? Number(form.points) : null,
        modality: form.modality || null,
        subtype: form.subtype || null,
        // title será ignorado pelo trigger (deve vir null para garantir título novo)
        title: null,
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
        image_url,
        can_skip: form.can_skip,
        max_elimination: form.max_elimination,
        ai_hint_enabled: form.ai_hint_enabled,
        manual_hint: form.manual_hint,
        skip_penalty_points: form.skip_penalty_points,
        elimination_penalty_points: form.elimination_penalty_points,
        ai_tutor_level: form.ai_tutor_level,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        diagnosis_internal
      };
      Object.keys(payload).forEach(k => {
        if (typeof payload[k] === "string" && payload[k] === "") payload[k] = null;
      });

      const { error, data: saved } = await supabase.from("medical_cases").insert([payload]).select();
      if (!error) {
        // Após insert, pega title auto-gerado
        const autoTitle = saved?.[0]?.title ?? "";
        setForm((prev: any) => ({ ...prev, title: autoTitle, case_number: saved?.[0]?.case_number }));
        setFeedback("Caso cadastrado com sucesso!");
        toast({ title: `Caso criado! Título: ${autoTitle}` });
        resetForm();
        onCreated?.();
      } else {
        setFeedback("Erro ao cadastrar caso.");
        toast({ title: "Erro ao cadastrar caso!", variant: "destructive" });
      }
    } catch (err: any) {
      setFeedback("Erro ao cadastrar caso.");
      toast({ title: "Erro ao cadastrar caso!", variant: "destructive" });
    }
    setSubmitting(false);
    setTimeout(() => setFeedback(""), 2300);
  }

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      {/* Propaga para preview modal o array completo */}
      <CaseProfileFormPreviewModal open={showPreview} onClose={() => setShowPreview(false)} form={form} categories={categories} difficulties={difficulties} />
      <h2 className="text-xl font-bold mb-2">Criar Novo Caso Médico</h2>
      <CaseProfileFormTitleSection
        autoTitlePreview={autoTitlePreview}
        onPreview={() => setShowPreview(true)}
        onSuggestTitle={onSuggestDiagnosis}
        onAutoFill={handleAutoFillCaseDetails}
        onGenerateAutoTitle={handleGenerateCaseTitleAuto}
        showPreview={showPreview}
      />
      <CaseProfileBasicSection
        form={form}
        highlightedFields={highlightedFields}
        categories={categories}
        difficulties={difficulties}
        handleFormChange={handleFormChange}
        handleModalityChange={handleModalityChange}
        handleAutoFillCaseDetails={handleAutoFillCaseDetails}
        handleSuggestDiagnosis={onSuggestDiagnosis}
        handleSuggestHint={handleSuggestHint}
        handleImageChange={handleImageChange}
        renderTooltipTip={renderTooltipTip}
        handleSuggestFindings={onSuggestFindings}
        handleSuggestClinicalInfo={onSuggestClinical}
        undoFindings={undoFindings}
        undoClinical={undoClinical}
        undoDiagnosis={undoDiagnosis}
        setForm={setForm}
        autoTitlePreview={autoTitlePreview}
        onGenerateAutoTitle={handleGenerateCaseTitleAuto}
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
        handleRandomizeOptions={handleRandomizeOptions}
        renderTooltipTip={renderTooltipTip}
      />
      <CaseProfileExplanationSectionContainer
        form={form}
        highlightedFields={highlightedFields}
        handleFormChange={handleFormChange}
        handleSuggestExplanation={handleSuggestExplanation}
        renderTooltipTip={renderTooltipTip}
        handleSuggestHint={handleSuggestHint}
      />
      <div className="mt-7">
        <button
          type="button"
          className="text-cyan-700 font-semibold hover:underline"
          onClick={() => setShowAdvanced((v: boolean) => !v)}
        >
          {showAdvanced ? "Ocultar" : "Mostrar"} Configurações Avançadas
        </button>
        <CaseProfileAdvancedConfigContainer
          form={form}
          handleFormChange={handleFormChange}
          handleSuggestHint={handleSuggestHint}
          showAdvanced={showAdvanced}
        />
      </div>
      <Button type="submit" disabled={submitting}>Salvar Caso</Button>
      {feedback && (
        <span className="ml-4 text-sm font-medium text-cyan-700">{feedback}</span>
      )}
    </form>
  );
}
