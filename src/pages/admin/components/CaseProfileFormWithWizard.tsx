
import React from "react";
import { CaseCreationWizard } from "./CaseCreationWizard";
import { useCaseProfileFormHandlers } from "../hooks/useCaseProfileFormHandlers";
import { useFieldUndo } from "../hooks/useFieldUndo";
import { useCaseTitleGenerator } from "../hooks/useCaseTitleGenerator";
import { useTempImageManager } from "@/hooks/useTempImageManager";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useSpecializedCaseImages } from "@/hooks/useSpecializedCaseImages";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface CaseProfileFormWithWizardProps {
  editingCase?: any;
  onCreated?: () => void;
}

export function CaseProfileFormWithWizard({ 
  editingCase, 
  onCreated 
}: CaseProfileFormWithWizardProps) {
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [difficulties, setDifficulties] = useState<{ id: number; level: number; description: string | null }[]>([]);
  const { images: specializedImages, refetch: refetchImages } = useSpecializedCaseImages(editingCase?.id);
  
  // Sistema de imagens temporárias integrado
  const tempImageManager = useTempImageManager();

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
    highlightedFields, setHighlightedFields
  } = handlers;

  const isEditMode = !!editingCase;
  const { generateTitle } = useCaseTitleGenerator(categories);

  // Preencher form com dados existentes se editando
  useEffect(() => {
    if (editingCase) {
      setForm({
        ...editingCase,
        // Não incluir mais image_url do form - usar apenas case_images
        answer_options: editingCase.answer_options || ["", "", "", ""],
        answer_feedbacks: editingCase.answer_feedbacks || ["", "", "", ""],
        answer_short_tips: editingCase.answer_short_tips || ["", "", "", ""],
        correct_answer_index: editingCase.correct_answer_index || 0,
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
        vital_signs: editingCase.vital_signs || {},
        structured_metadata: editingCase.structured_metadata || {},
        achievement_triggers: editingCase.achievement_triggers || {},
        primary_diagnosis: editingCase.primary_diagnosis || null,
        case_classification: editingCase.case_classification || "diagnostico",
        cid10_code: editingCase.cid10_code || null,
        laterality: editingCase.laterality || null,
        case_rarity: editingCase.case_rarity || "comum",
        educational_value: editingCase.educational_value || 5,
        clinical_relevance: editingCase.clinical_relevance || 5,
        estimated_solve_time: editingCase.estimated_solve_time || 5,
        exam_context: editingCase.exam_context || "rotina"
      });
    }
  }, [editingCase, setForm]);

  // Auto-generate title for new cases
  useEffect(() => {
    if (!isEditMode && form.category_id && form.modality && form.difficulty_level && (!form.case_number || !form.title)) {
      const { title, case_number } = generateTitle(Number(form.category_id), form.modality, Number(form.difficulty_level));
      setForm((prev: any) => ({ ...prev, title, case_number }));
    }
  }, [form.category_id, form.modality, form.difficulty_level, isEditMode]);

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

      // PAYLOAD SEM IMAGE_URL - Usar apenas case_images
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
        // Remover image_url do payload - não usar mais
        can_skip: form.can_skip,
        max_elimination: form.max_elimination,
        ai_hint_enabled: form.ai_hint_enabled,
        manual_hint: form.manual_hint,
        skip_penalty_points: form.skip_penalty_points,
        elimination_penalty_points: form.elimination_penalty_points,
        ai_tutor_level: form.ai_tutor_level,
        updated_at: new Date().toISOString(),
        is_radiopaedia_case: form.is_radiopaedia_case,
        reference_citation: form.is_radiopaedia_case ? form.reference_citation : null,
        reference_url: form.is_radiopaedia_case ? form.reference_url : null,
        access_date: form.is_radiopaedia_case && form.access_date ? form.access_date : null,
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

      // ETAPA 1: SALVAR CASO PRIMEIRO
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

      if (error || !data?.[0]) {
        throw new Error(error?.message || "Erro ao salvar caso");
      }

      const caseId = data[0].id;
      const resultTitle = data[0].title ?? form.title;

      console.log('✅ Caso salvo com sucesso:', caseId);

      // ETAPA 2: PROCESSAR IMAGENS TEMPORÁRIAS COM UUID REAL
      if (tempImageManager.tempImages.length > 0) {
        console.log('🔄 Processando imagens temporárias...');
        
        toast({
          title: "🔄 Processando Imagens...",
          description: "Organizando imagens no sistema especializado..."
        });

        await tempImageManager.processAllTempImages(
          caseId,
          form.category_id ? Number(form.category_id) : undefined,
          form.modality
        );
      }

      // ETAPA 3: FINALIZAR COM SUCESSO
      setFeedback(isEditMode ? "Caso atualizado com sucesso!" : "Caso cadastrado com sucesso!");
      toast({ 
        title: `✅ Caso ${isEditMode ? "Atualizado" : "Criado"}!`, 
        description: `${resultTitle} - Imagens organizadas automaticamente` 
      });
      
      if (!isEditMode) {
        resetForm();
        tempImageManager.clearAllTempImages();
      }
      
      // Atualizar imagens especializadas
      refetchImages();
      
      onCreated?.();

    } catch (err: any) {
      console.error("❌ Erro no salvamento:", err);
      setFeedback(`Erro ao ${isEditMode ? "atualizar" : "cadastrar"} caso.`);
      toast({ 
        title: `❌ Erro ao ${isEditMode ? "Atualizar" : "Criar"} Caso!`, 
        description: err.message || "Erro desconhecido",
        variant: "destructive" 
      });
    }
    setSubmitting(false);
    setTimeout(() => setFeedback(""), 2300);
  }

  return (
    <CaseCreationWizard
      form={form}
      setForm={setForm}
      highlightedFields={highlightedFields}
      setHighlightedFields={setHighlightedFields}
      handlers={handlers}
      categories={categories}
      difficulties={difficulties}
      isEditMode={isEditMode}
      editingCase={editingCase}
      onSubmit={handleSubmit}
      submitting={submitting}
      feedback={feedback}
      renderTooltipTip={renderTooltipTip}
      tempImageManager={tempImageManager}
      specializedImages={specializedImages}
    />
  );
}
