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
import { CaseProfileExplanationSectionContainer } from "./CaseProfileExplanationSectionContainer";
import { CaseProfileAdvancedConfigContainer } from "./CaseProfileAdvancedConfigContainer";
import { useCaseProfileFormHandlers } from "../hooks/useCaseProfileFormHandlers";
import { CaseProfileFormActions } from "./CaseProfileFormActions";
import { CaseProfileFormLayout } from "./CaseProfileFormLayout";
import { useFieldUndo } from "../hooks/useFieldUndo";

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
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [difficulties, setDifficulties] = useState<{id: number, level: number, description: string | null}[]>([]);
  
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
    handleAutoFillCaseDetails, handleSuggestTitle, handleSuggestAlternatives, handleSuggestHint, handleSuggestExplanation, handleGenerateAutoTitle,
    handleSuggestFindings, handleSuggestClinicalInfo,
    handleRandomizeOptions // NOVO
  } = handlers;

  // Hooks de undo para os principais campos envolvidos em sugestões IA
  const undoFindings = useFieldUndo(handlers.form.findings);
  const undoClinical = useFieldUndo(handlers.form.patient_clinical_info);
  const undoTitle = useFieldUndo(handlers.form.title);

  // Funções auxiliares para o CaseProfileBasicSection passar aos botões
  const onSuggestFindings = async () => {
    undoFindings.handleBeforeChange(handlers.form.findings);
    await handlers.handleSuggestFindings();
  };
  const onSuggestClinical = async () => {
    undoClinical.handleBeforeChange(handlers.form.patient_clinical_info);
    await handlers.handleSuggestClinicalInfo();
  };
  const onSuggestTitle = async () => {
    undoTitle.handleBeforeChange(handlers.form.title);
    await handlers.handleSuggestTitle();
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
      // Conta novamente antes do insert para evitar duplicatas
      let caseNumber = form.case_number;
      if ((!caseNumber || isNaN(Number(caseNumber))) && form.category_id && form.modality) {
        const { data } = await supabase
          .from("medical_cases")
          .select("id", { count: "exact", head: true })
          .eq("category_id", Number(form.category_id))
          .eq("modality", form.modality);
        caseNumber = ((data?.length ?? 0) + 1);
      }

      const selectedCategory = categories.find(c => String(c.id) === String(form.category_id));
      const payload: any = {
        // Grava specialty sempre igual ao nome da categoria selecionada
        specialty: selectedCategory ? selectedCategory.name : null,
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
        toast({ title: "Caso cadastrado com sucesso!" });
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
      <CasePreviewModal open={showPreview} onClose={() => setShowPreview(false)} form={form} categories={categories} difficulties={difficulties} />
      <h2 className="text-xl font-bold mb-2">Criar Novo Caso Médico</h2>
      <CaseProfileFormActions
        onPreview={() => setShowPreview(true)}
        onSuggestTitle={onSuggestTitle}
        onAutoFill={handleAutoFillCaseDetails}
        onGenerateAutoTitle={handleGenerateAutoTitle}
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
        handleSuggestTitle={onSuggestTitle}
        handleSuggestHint={handleSuggestHint}
        handleImageChange={handleImageChange}
        renderTooltipTip={renderTooltipTip}
        handleSuggestFindings={onSuggestFindings}
        handleSuggestClinicalInfo={onSuggestClinical}
        // Componente Undo por campo
        undoFindings={undoFindings}
        undoClinical={undoClinical}
        undoTitle={undoTitle}
        setForm={setForm}
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
        handleRandomizeOptions={handleRandomizeOptions} // NOVO
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
