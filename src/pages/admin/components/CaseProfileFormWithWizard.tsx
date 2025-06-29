import React from "react";
import { CaseCreationWizard } from "./CaseCreationWizard";
import { useCaseProfileFormHandlers } from "../hooks/useCaseProfileFormHandlers";
import { useFieldUndo } from "../hooks/useFieldUndo";
import { useCaseTitleGenerator } from "../hooks/useCaseTitleGenerator";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useSpecializedCaseImages } from "@/hooks/useSpecializedCaseImages";
import { useSpecializedImageUpload } from "@/hooks/useSpecializedImageUpload";
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
  const [tempImages, setTempImages] = useState<File[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);

  const { images: specializedImages, refetch: refetchImages } = useSpecializedCaseImages(editingCase?.id);
  const { uploadSpecializedImage, processZipSpecialized } = useSpecializedImageUpload();

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
        // Não usar image_url - imagens vêm apenas da tabela case_images
        image_url: [], // Campo depreciado, zerado
        answer_options: editingCase.answer_options || ["", "", "", ""],
        answer_feedbacks: editingCase.answer_feedbacks || ["", "", "", ""],
        answer_short_tips: editingCase.answer_short_tips || ["", "", "", ""],
        correct_answer_index: editingCase.correct_answer_index || 0,
        // ... keep existing code (todos os outros campos do formulário)
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

  // Handler para imagens temporárias
  const handleTempImageUpload = (files: File[]) => {
    setTempImages(prev => [...prev, ...files]);
    toast({
      title: "📸 Imagens Adicionadas",
      description: `${files.length} imagem(ns) prontas para processamento após salvar o caso.`
    });
  };

  const removeTempImage = (index: number) => {
    setTempImages(prev => prev.filter((_, i) => i !== index));
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
    setFeedback("Salvando caso...");

    try {
      const selectedCategory = categories.find(c => String(c.id) === String(form.category_id));
      const primary_diagnosis = form.primary_diagnosis ?? "";

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
        // IMPORTANTE: image_url sempre vazio - imagens vão para case_images
        image_url: [],
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
        // ... keep existing code (todos os outros campos estruturados)
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
      let caseId: string;

      // ETAPA 1: Salvar caso primeiro
      if (isEditMode) {
        ({ error, data } = await supabase
          .from("medical_cases")
          .update(payload)
          .eq("id", editingCase.id)
          .select());
        caseId = editingCase.id;
      } else {
        payload.created_at = new Date().toISOString();
        ({ error, data } = await supabase
          .from("medical_cases")
          .insert([payload])
          .select());
        caseId = data?.[0]?.id;
      }

      if (error || !data?.[0]) {
        throw new Error(error?.message || "Erro ao salvar caso");
      }

      const resultTitle = data[0].title ?? form.title;
      console.log('✅ Caso salvo com sucesso, ID:', caseId);

      // ETAPA 2: Processar imagens com UUID real (somente se há imagens)
      if (tempImages.length > 0 && !isEditMode) {
        setFeedback("Organizando imagens especializadas...");
        setIsProcessingImages(true);

        try {
          for (let i = 0; i < tempImages.length; i++) {
            const file = tempImages[i];
            console.log(`📸 Processando imagem ${i + 1}/${tempImages.length}:`, file.name);

            await uploadSpecializedImage(file, {
              caseId: caseId,
              categoryId: form.category_id ? Number(form.category_id) : undefined,
              modality: form.modality || undefined,
              sequenceOrder: i
            });
          }

          console.log('✅ Todas as imagens processadas e organizadas com sucesso');
          setTempImages([]); // Limpar imagens temporárias
        } catch (imageError: any) {
          console.error('❌ Erro no processamento de imagens:', imageError);
          
          // ROLLBACK: Deletar caso se imagens falharam
          if (!isEditMode) {
            console.log('🔄 Executando rollback do caso devido a falha nas imagens...');
            await supabase.from("medical_cases").delete().eq("id", caseId);
            throw new Error(`Erro ao processar imagens: ${imageError.message}. Caso não foi salvo.`);
          } else {
            // Em modo edição, apenas avisar sobre falha nas imagens
            toast({
              title: "⚠️ Caso salvo, mas erro nas imagens",
              description: "O caso foi atualizado, mas houve erro ao processar algumas imagens.",
              variant: "destructive"
            });
          }
        } finally {
          setIsProcessingImages(false);
        }
      }

      // ETAPA 3: Finalização
      setFeedback(isEditMode ? "Caso atualizado com sucesso!" : "Caso cadastrado com sucesso!");
      toast({ 
        title: `✅ ${isEditMode ? "Caso Atualizado" : "Caso Criado"}!`, 
        description: `${resultTitle}${tempImages.length > 0 ? ` • ${tempImages.length} imagem(ns) organizadas` : ""}`
      });
      
      if (!isEditMode) {
        resetForm();
        setTempImages([]);
      }
      
      // Atualizar imagens especializadas
      refetchImages();
      
      onCreated?.();

    } catch (err: any) {
      console.error("❌ Erro no salvamento integrado:", err);
      setFeedback(`Erro ao ${isEditMode ? "atualizar" : "cadastrar"} caso.`);
      toast({ 
        title: `❌ Erro ao ${isEditMode ? "Atualizar" : "Criar"} Caso!`, 
        description: err.message,
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
      setIsProcessingImages(false);
      setTimeout(() => setFeedback(""), 2300);
    }
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
      submitting={submitting || isProcessingImages}
      feedback={feedback}
      renderTooltipTip={renderTooltipTip}
      // Sistema integrado de imagens temporárias
      tempImages={tempImages}
      onTempImageUpload={handleTempImageUpload}
      onRemoveTempImage={removeTempImage}
      specializedImages={specializedImages}
      isProcessingImages={isProcessingImages}
    />
  );
}
