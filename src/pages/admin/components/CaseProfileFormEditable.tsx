
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
import { CaseFormPreviewModal } from "./CaseFormPreviewModal";
import { CaseProgressDashboard } from "./CaseProgressDashboard";
import { CaseQualityRadar } from "./CaseQualityRadar";
import { CaseTemplateChooser } from "./CaseTemplateChooser";
import { CaseFormGamifiedHelpers } from "./CaseFormGamifiedHelpers";
import { CaseFormGamifiedLayout } from "./CaseFormGamifiedLayout";
import { supabase } from "@/integrations/supabase/client";

export function CaseProfileFormEditable({ 
  editingCase, 
  onCreated 
}: { 
  editingCase?: any; 
  onCreated?: () => void; 
}) {
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
    handleAutoFillCaseDetails, handleSuggestDiagnosis, handleSuggestAlternatives, handleSuggestHint, handleSuggestExplanation,
    handleSuggestFindings, handleSuggestClinicalInfo,
    handleRandomizeOptions
  } = handlers;

  // Load editing case data into form
  useEffect(() => {
    if (editingCase) {
      setForm(editingCase);
    }
  }, [editingCase, setForm]);

  const isEditMode = !!editingCase;
  const { generateTitle, abbreviateCategory, generateRandomCaseNumber } = useCaseTitleGenerator(categories);

  const autoTitlePreview =
    form.category_id && form.modality
      ? `Caso ${abbreviateCategory(categories.find(c => String(c.id) === String(form.category_id))?.name || "")} ${form.case_number || generateRandomCaseNumber()}`
      : "(Será definido automaticamente após salvar: Caso [ABREV] [NUM ALEATÓRIO])";

  React.useEffect(() => {
    if (!isEditMode && form.category_id && form.modality && (!form.case_number || !form.title)) {
      const { title, case_number } = generateTitle(form.category_id, form.modality);
      setForm((prev: any) => ({ ...prev, title, case_number }));
    }
  }, [form.category_id, form.modality, isEditMode]);

  function handleAutoGenerateTitle() {
    if (form.category_id && form.modality) {
      const { title, case_number } = generateTitle(form.category_id, form.modality);
      setForm((prev: any) => ({ ...prev, title, case_number }));
      setHighlightedFields(["title", "case_number"]);
      setTimeout(() => setHighlightedFields([]), 1200);
    }
  }

  const undoFindings = useFieldUndo(handlers.form.findings);
  const undoClinical = useFieldUndo(handlers.form.patient_clinical_info);
  const undoDiagnosis = useFieldUndo(handlers.form.diagnosis_internal);

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
          <span className="ml-1 text-cyan-700 cursor-help align-middle">ⓘ</span>
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
      const selectedCategory = categories.find(c => String(c.id) === String(form.category_id));
      const diagnosis_internal = form.diagnosis_internal ?? "";

      let image_url_arr: any[] = [];
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
        case_number: form.case_number ?? null,
        difficulty_level: form.difficulty_level ? Number(form.difficulty_level) : null,
        points: form.points ? Number(form.points) : null,
        modality: form.modality || null,
        subtype: form.subtype || null,
        title: form.title || null,
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
        updated_at: new Date().toISOString(),
        diagnosis_internal
      };

      Object.keys(payload).forEach(k => {
        if (typeof payload[k] === "string" && payload[k] === "") payload[k] = null;
      });

      let error, data;
      if (isEditMode) {
        ({ error, data } = await supabase
          .from("medical_cases")
          .update(payload)
          .eq("id", editingCase.id)
          .select());
      } else {
        payload.created_at = new Date().toISOString();
        ({ error, data } = await supabase
          .from("medical_cases")
          .insert([payload])
          .select());
      }

      if (!error) {
        const resultTitle = data?.[0]?.title ?? form.title;
        setFeedback(isEditMode ? "Caso atualizado com sucesso!" : "Caso cadastrado com sucesso!");
        toast({ title: `Caso ${isEditMode ? "atualizado" : "criado"}! Título: ${resultTitle}` });
        if (!isEditMode) resetForm();
        onCreated?.();
      } else {
        setFeedback(`Erro ao ${isEditMode ? "atualizar" : "cadastrar"} caso.`);
        toast({ title: `Erro ao ${isEditMode ? "atualizar" : "cadastrar"} caso!`, variant: "destructive" });
      }
    } catch (err: any) {
      setFeedback(`Erro ao ${isEditMode ? "atualizar" : "cadastrar"} caso.`);
      toast({ title: `Erro ao ${isEditMode ? "atualizar" : "cadastrar"} caso!`, variant: "destructive" });
    }
    setSubmitting(false);
    setTimeout(() => setFeedback(""), 2300);
  }

  return (
    <div className="w-full space-y-6">
      <CaseFormPreviewModal open={showPreview} onClose={()=>setShowPreview(false)} form={form} categories={categories} difficulties={difficulties} />

      {!isEditMode && (
        <div className="grid gap-6">
          <CaseProgressDashboard form={form} />
          <CaseQualityRadar form={form} />
          <CaseFormGamifiedHelpers form={form} />
          <CaseTemplateChooser setForm={setForm} />
        </div>
      )}

      <form className="w-full space-y-6" onSubmit={handleSubmit}>
        <CaseFormGamifiedLayout
          section="basic"
          title={isEditMode ? "Editar Caso Médico" : "Criar Novo Caso Médico"}
          description="Configure as informações básicas do caso médico"
        >
          <CaseProfileFormTitleSection
            autoTitlePreview={autoTitlePreview}
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
            onGenerateAutoTitle={handleAutoGenerateTitle}
          />
        </CaseFormGamifiedLayout>

        <CaseFormGamifiedLayout
          section="quiz"
          title="Pergunta e Alternativas"
          description="Configure a pergunta principal e as opções de resposta"
        >
          <div className="space-y-4">
            <div>
              <label className="font-semibold block">
                Pergunta Principal *
                {renderTooltipTip("tip-main-question", "Esta pergunta será apresentada ao usuário e guiará o raciocínio clínico.")}
              </label>
              <Input 
                name="main_question" 
                value={form.main_question} 
                onChange={handleFormChange} 
                placeholder="Ex: Qual é o diagnóstico mais provável?" 
                required 
                className="mt-2"
              />
            </div>
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
          </div>
        </CaseFormGamifiedLayout>

        <CaseFormGamifiedLayout
          section="clinical"
          title="Explicação e Feedback"
          description="Configure as explicações e dicas para o usuário"
        >
          <CaseProfileExplanationSectionContainer
            form={form}
            highlightedFields={highlightedFields}
            handleFormChange={handleFormChange}
            handleSuggestExplanation={handleSuggestExplanation}
            renderTooltipTip={renderTooltipTip}
            handleSuggestHint={handleSuggestHint}
          />
        </CaseFormGamifiedLayout>

        <CaseFormGamifiedLayout
          section="advanced"
          title="Configurações Avançadas"
          description="Configurações de gamificação e regras especiais"
        >
          <div className="space-y-4">
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
        </CaseFormGamifiedLayout>

        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={submitting} size="lg">
              {isEditMode ? "Atualizar Caso" : "Salvar Caso"}
            </Button>
            {feedback && (
              <span className="text-sm font-medium text-cyan-700">{feedback}</span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
