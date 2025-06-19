import React, { useEffect, useState } from "react";
import { useCaseProfileFormHandlers } from "../hooks/useCaseProfileFormHandlers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { CaseProfileBasicSectionUnified } from "./CaseProfileBasicSectionUnified";
import { CaseSmartAutofillAdvanced } from "./CaseSmartAutofillAdvanced";
import { CaseProfileAlternativesSection } from "./CaseProfileAlternativesSection";
import { CaseProfileExplanationSectionContainer } from "./CaseProfileExplanationSectionContainer";
import { CaseProfileAdvancedConfigContainer } from "./CaseProfileAdvancedConfigContainer";
import { CaseStructuredFieldsSection } from "./CaseStructuredFieldsSection";
import { CaseReferenceSection } from "./CaseReferenceSection";
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

// Novos componentes AI por seção
import { CaseBasicSectionAI } from "./CaseBasicSectionAI";
import { CaseStructuredDataAI } from "./CaseStructuredDataAI";
import { CaseQuizCompleteAI } from "./CaseQuizCompleteAI";
import { CaseExplanationCompleteAI } from "./CaseExplanationCompleteAI";
import { CaseAdvancedConfigAI } from "./CaseAdvancedConfigAI";
import { CaseMasterAI } from "./CaseMasterAI";

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
    handleSuggestDiagnosis, handleSuggestAlternatives, handleSuggestHint, handleSuggestExplanation,
    handleSuggestFindings, handleSuggestClinicalInfo,
    handleRandomizeOptions
  } = handlers;

  // Load editing case data into form
  useEffect(() => {
    if (editingCase) {
      setForm({
        ...editingCase,
        // Garantir arrays vazios para campos novos
        secondary_diagnoses: editingCase.secondary_diagnoses || [],
        anatomical_regions: editingCase.anatomical_regions || [],
        finding_types: editingCase.finding_types || [],
        main_symptoms: editingCase.main_symptoms || [],
        medical_history: editingCase.medical_history || [],
        learning_objectives: editingCase.learning_objectives || [],
        pathology_types: editingCase.pathology_types || [],
        clinical_presentation_tags: editingCase.clinical_presentation_tags || [],
        case_complexity_factors: editingCase.case_complexity_factors || [],
        search_keywords: editingCase.search_keywords || [],
        target_audience: editingCase.target_audience || [],
        medical_subspecialty: editingCase.medical_subspecialty || [],
        differential_diagnoses: editingCase.differential_diagnoses || [],
        similar_cases_ids: editingCase.similar_cases_ids || [],
        prerequisite_cases: editingCase.prerequisite_cases || [],
        unlocks_cases: editingCase.unlocks_cases || [],
        // Garantir objetos vazios para campos JSON
        vital_signs: editingCase.vital_signs || {},
        structured_metadata: editingCase.structured_metadata || {},
        achievement_triggers: editingCase.achievement_triggers || {},
        // Garantir valores padrão
        primary_diagnosis: editingCase.primary_diagnosis || "",
        case_classification: editingCase.case_classification || "diagnostico",
        cid10_code: editingCase.cid10_code || "",
        laterality: editingCase.laterality || "",
        case_rarity: editingCase.case_rarity || "comum",
        educational_value: editingCase.educational_value || 5,
        clinical_relevance: editingCase.clinical_relevance || 5,
        estimated_solve_time: editingCase.estimated_solve_time || 5,
        exam_context: editingCase.exam_context || "rotina",
        // Campos de referência
        is_radiopaedia_case: editingCase.is_radiopaedia_case ?? false,
        reference_citation: editingCase.reference_citation ?? "",
        reference_url: editingCase.reference_url ?? "",
        access_date: editingCase.access_date ?? ""
      });
    }
  }, [editingCase, setForm]);

  const isEditMode = !!editingCase;
  const { generateTitle, abbreviateCategory, generateRandomCaseNumber } = useCaseTitleGenerator(categories);

  const undoFindings = useFieldUndo(handlers.form.findings);
  const undoClinical = useFieldUndo(handlers.form.patient_clinical_info);
  const undoDiagnosis = useFieldUndo(handlers.form.primary_diagnosis);

  const onSuggestFindings = async () => {
    undoFindings.handleBeforeChange(handlers.form.findings);
    await handlers.handleSuggestFindings();
  };
  const onSuggestClinical = async () => {
    undoClinical.handleBeforeChange(handlers.form.patient_clinical_info);
    await handlers.handleSuggestClinicalInfo();
  };
  const onSuggestDiagnosis = async () => {
    undoDiagnosis.handleBeforeChange(handlers.form.primary_diagnosis);
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
    
    // Validação específica para casos Radiopaedia
    if (form.is_radiopaedia_case) {
      if (!form.reference_citation?.trim()) {
        toast({ title: "Citação da referência é obrigatória para casos do Radiopaedia", variant: "destructive" });
        return;
      }
      if (!form.reference_url?.trim()) {
        toast({ title: "URL de referência é obrigatória para casos do Radiopaedia", variant: "destructive" });
        return;
      }
    }

    setSubmitting(true);
    try {
      const selectedCategory = categories.find(c => String(c.id) === String(form.category_id));
      const primary_diagnosis = form.primary_diagnosis ?? "";

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
        
        // Campos de referência Radiopaedia
        is_radiopaedia_case: form.is_radiopaedia_case,
        reference_citation: form.is_radiopaedia_case ? form.reference_citation : null,
        reference_url: form.is_radiopaedia_case ? form.reference_url : null,
        access_date: form.is_radiopaedia_case && form.access_date ? form.access_date : null,
        
        // Novos campos estruturados
        primary_diagnosis: form.primary_diagnosis || null,
        secondary_diagnoses: form.secondary_diagnoses || [],
        case_classification: form.case_classification || "diagnostico",
        cid10_code: form.cid10_code || null,
        anatomical_regions: form.anatomical_regions || [],
        finding_types: form.finding_types || [],
        laterality: form.laterality || null,
        main_symptoms: form.main_symptoms || [],
        vital_signs: form.vital_signs || {},
        medical_history: form.medical_history || [],
        learning_objectives: form.learning_objectives || [],
        pathology_types: form.pathology_types || [],
        clinical_presentation_tags: form.clinical_presentation_tags || [],
        case_complexity_factors: form.case_complexity_factors || [],
        search_keywords: form.search_keywords || [],
        structured_metadata: form.structured_metadata || {},
        case_rarity: form.case_rarity || "comum",
        educational_value: form.educational_value || 5,
        clinical_relevance: form.clinical_relevance || 5,
        estimated_solve_time: form.estimated_solve_time || 5,
        prerequisite_cases: form.prerequisite_cases || [],
        unlocks_cases: form.unlocks_cases || [],
        achievement_triggers: form.achievement_triggers || {},
        target_audience: form.target_audience || [],
        medical_subspecialty: form.medical_subspecialty || [],
        exam_context: form.exam_context || "rotina",
        differential_diagnoses: form.differential_diagnoses || [],
        similar_cases_ids: form.similar_cases_ids || []
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
        console.error("Database error:", error);
        setFeedback(`Erro ao ${isEditMode ? "atualizar" : "cadastrar"} caso.`);
        toast({ title: `Erro ao ${isEditMode ? "atualizar" : "cadastrar"} caso!`, variant: "destructive" });
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      setFeedback(`Erro ao ${isEditMode ? "atualizar" : "cadastrar"} caso.`);
      toast({ title: `Erro ao ${isEditMode ? "atualizar" : "cadastrar"} caso!`, variant: "destructive" });
    }
    setSubmitting(false);
    setTimeout(() => setFeedback(""), 2300);
  }

  // Fix autoTitlePreview - Convert strings to numbers for generateTitle
  const autoTitlePreview =
    form.category_id && form.modality && form.difficulty_level
      ? generateTitle(Number(form.category_id), form.modality, Number(form.difficulty_level)).title
      : "(Será definido automaticamente: Caso [Especialidade] [Dificuldade] [Modalidade] #[NUM])";

  React.useEffect(() => {
    if (!isEditMode && form.category_id && form.modality && form.difficulty_level && (!form.case_number || !form.title)) {
      const { title, case_number } = generateTitle(Number(form.category_id), form.modality, Number(form.difficulty_level));
      setForm((prev: any) => ({ ...prev, title, case_number }));
    }
  }, [form.category_id, form.modality, form.difficulty_level, isEditMode]);

  function handleAutoGenerateTitle() {
    if (form.category_id && form.modality && form.difficulty_level) {
      const { title, case_number } = generateTitle(Number(form.category_id), form.modality, Number(form.difficulty_level));
      setForm((prev: any) => ({ ...prev, title, case_number }));
      setHighlightedFields(["title", "case_number"]);
      setTimeout(() => setHighlightedFields([]), 1200);
    }
  }

  return (
    <div className="w-full space-y-6">
      <CaseFormPreviewModal open={showPreview} onClose={()=>setShowPreview(false)} form={form} categories={categories} difficulties={difficulties} />

      {!isEditMode && (
        <div className="grid gap-6">
          <CaseProgressDashboard form={form} />
          <CaseQualityRadar form={form} />
          <CaseFormGamifiedHelpers form={form} />
          
          {/* BOTÃO MASTER AI: Preencher TUDO - Substitui "Auto-preenchimento por Seção" */}
          <CaseMasterAI 
            form={form}
            setForm={setForm}
            onFieldsUpdated={(fields) => {
              setHighlightedFields(fields);
              setTimeout(() => setHighlightedFields([]), 3000);
            }}
            categories={categories}
          />
        </div>
      )}

      <form className="w-full space-y-6" onSubmit={handleSubmit}>
        <CaseFormGamifiedLayout
          section="structured"
          title="Dados Estruturados"
          description="Configure os campos estruturados para filtros avançados e AI (PRIMEIRO PASSO)"
        >
          {/* CORREÇÃO: Remover o botão AI duplicado - já existe integrado na seção */}
          <CaseStructuredFieldsSection 
            form={form}
            setForm={setForm}
            handleFormChange={handleFormChange}
            renderTooltipTip={renderTooltipTip}
          />
        </CaseFormGamifiedLayout>

        <CaseFormGamifiedLayout
          section="basic"
          title={isEditMode ? "Editar Caso Médico" : "Criar Novo Caso Médico"}
          description="Configure as informações básicas do caso médico (SEGUNDO PASSO - requer dados estruturados)"
        >
          <CaseProfileFormTitleSection
            autoTitlePreview={autoTitlePreview}
            showPreview={showPreview}
          />
          
          {/* CORREÇÃO: Botão AI para seção básica com validação de dependência */}
          <CaseBasicSectionAI 
            form={form}
            setForm={setForm}
            onFieldsUpdated={(fields) => {
              setHighlightedFields(fields);
              setTimeout(() => setHighlightedFields([]), 2000);
            }}
            categories={categories}
          />
          
          <CaseProfileBasicSectionUnified
            form={form}
            highlightedFields={highlightedFields}
            handleFormChange={handleFormChange}
            handleModalityChange={handleModalityChange}
            handleImageChange={handleImageChange}
            renderTooltipTip={renderTooltipTip}
            handleSuggestFindings={onSuggestFindings}
            handleSuggestClinicalInfo={onSuggestClinical}
            undoFindings={undoFindings}
            undoClinical={undoClinical}
            setForm={setForm}
            autoTitlePreview={autoTitlePreview}
            onGenerateAutoTitle={handleAutoGenerateTitle}
          />
        </CaseFormGamifiedLayout>

        <CaseFormGamifiedLayout
          section="reference"
          title="Referência e Fonte"
          description="Configure informações sobre a fonte do caso"
        >
          <CaseReferenceSection 
            form={form}
            handleFormChange={handleFormChange}
            renderTooltipTip={renderTooltipTip}
          />
        </CaseFormGamifiedLayout>

        <CaseFormGamifiedLayout
          section="quiz"
          title="Pergunta e Alternativas"
          description="Configure a pergunta principal e as opções de resposta"
        >
          {/* NOVO: Botão AI para quiz completo */}
          <CaseQuizCompleteAI 
            form={form}
            setForm={setForm}
            onFieldsUpdated={(fields) => {
              setHighlightedFields(fields);
              setTimeout(() => setHighlightedFields([]), 2000);
            }}
          />
          
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
          {/* NOVO: Botão AI para explicação completa */}
          <CaseExplanationCompleteAI 
            form={form}
            setForm={setForm}
            onFieldsUpdated={(fields) => {
              setHighlightedFields(fields);
              setTimeout(() => setHighlightedFields([]), 2000);
            }}
          />
          
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
          {/* NOVO: Botão AI para config avançada */}
          <CaseAdvancedConfigAI 
            form={form}
            setForm={setForm}
            onFieldsUpdated={(fields) => {
              setHighlightedFields(fields);
              setTimeout(() => setHighlightedFields([]), 2000);
            }}
          />
          
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
