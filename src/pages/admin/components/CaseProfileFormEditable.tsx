
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CaseModalityFieldsUnified } from "./CaseModalityFieldsUnified";
import { useUnifiedFormDataSource } from "@/hooks/useUnifiedFormDataSource";
import { useSpecializedCaseImages } from "@/hooks/useSpecializedCaseImages";
import { AdvancedImageManagerModal } from "./AdvancedImageManagerModal";
import { 
  Save, 
  FolderTree,
  TestTube,
  ImageIcon,
  Sparkles
} from "lucide-react";

interface CaseProfileFormEditableProps {
  editingCase?: any;
  onCreated?: () => void;
}

export function CaseProfileFormEditable({ 
  editingCase, 
  onCreated 
}: CaseProfileFormEditableProps) {
  const { specialties, difficulties, isLoading } = useUnifiedFormDataSource();
  const [form, setForm] = useState<any>({
    category_id: "",
    difficulty_level: "",
    modality: "",
    subtype: "",
    title: "",
    findings: "",
    patient_clinical_info: "",
    main_question: "",
    explanation: "",
    answer_options: ["", "", "", ""],
    answer_feedbacks: ["", "", "", ""],
    answer_short_tips: ["", "", "", ""],
    correct_answer_index: 0,
    patient_age: "",
    patient_gender: "",
    symptoms_duration: "",
    points: 10,
    can_skip: true,
    max_elimination: 0,
    ai_hint_enabled: false,
    manual_hint: "",
    skip_penalty_points: 0,
    elimination_penalty_points: 0,
    ai_tutor_level: "desligado",
    is_radiopaedia_case: false,
    reference_citation: "",
    reference_url: "",
    access_date: "",
    primary_diagnosis: "",
    secondary_diagnoses: [],
    case_classification: "diagnostico",
    cid10_code: "",
    anatomical_regions: [],
    finding_types: [],
    laterality: "",
    main_symptoms: [],
    vital_signs: {},
    medical_history: [],
    learning_objectives: [],
    pathology_types: [],
    clinical_presentation_tags: [],
    case_complexity_factors: [],
    search_keywords: [],
    structured_metadata: {},
    case_rarity: "comum",
    educational_value: 5,
    clinical_relevance: 5,
    estimated_solve_time: 5,
    prerequisite_cases: [],
    unlocks_cases: [],
    achievement_triggers: {},
    target_audience: [],
    medical_subspecialty: [],
    exam_context: "rotina",
    differential_diagnoses: [],
    similar_cases_ids: []
  });

  const [submitting, setSubmitting] = useState(false);
  const [showAdvancedImageModal, setShowAdvancedImageModal] = useState(false);

  // Hook especializado para imagens
  const { 
    images: specializedImages, 
    uploading, 
    processing, 
    uploadSpecializedImage 
  } = useSpecializedCaseImages(editingCase?.id);

  const isEditMode = !!editingCase;

  // Preencher form com dados existentes
  useEffect(() => {
    if (editingCase) {
      setForm({
        ...editingCase,
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
        vital_signs: editingCase.vital_signs || {},
        structured_metadata: editingCase.structured_metadata || {},
        achievement_triggers: editingCase.achievement_triggers || {},
        prerequisite_cases: editingCase.prerequisite_cases || [],
        unlocks_cases: editingCase.unlocks_cases || []
      });
    }
  }, [editingCase]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleModalityChange = (val: { modality: string; subtype: string }) => {
    setForm((prev: any) => ({ ...prev, modality: val.modality, subtype: val.subtype }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setForm((prev: any) => {
      const newOptions = [...prev.answer_options];
      newOptions[index] = value;
      return { ...prev, answer_options: newOptions };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      const selectedCategory = specialties.find(c => String(c.id) === String(form.category_id));

      // Converter imagens especializadas para formato correto
      const image_url = specializedImages.slice(0, 6).map((img) => ({
        url: img.original_url,
        legend: img.legend || ""
      }));

      const payload: any = {
        specialty: selectedCategory ? selectedCategory.name : null,
        category_id: form.category_id ? Number(form.category_id) : null,
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

      // Limpar valores vazios
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

      if (!error && data?.[0]) {
        const resultTitle = data[0].title ?? form.title;
        toast({ title: `Caso ${isEditMode ? "atualizado" : "criado"}! Título: ${resultTitle}` });
        onCreated?.();
      } else {
        console.error("Database error:", error);
        toast({ title: `Erro ao ${isEditMode ? "atualizar" : "cadastrar"} caso!`, variant: "destructive" });
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      toast({ title: `Erro ao ${isEditMode ? "atualizar" : "cadastrar"} caso!`, variant: "destructive" });
    }
    setSubmitting(false);
  };

  // Obter informações da organização especializada
  const getSpecializedOrganizationInfo = () => {
    if (!form.category_id || !form.modality) return null;
    
    const specialty = specialties.find(s => s.id === parseInt(form.category_id));
    return {
      specialty: specialty?.name || 'Não definida',
      modality: form.modality,
      specialized: true,
      bucketPath: `medical-cases/${specialty?.specialty_code?.toLowerCase() || 'geral'}/${form.modality?.toLowerCase() || 'img'}`
    };
  };

  const organizationInfo = getSpecializedOrganizationInfo();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sistema especializado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Sistema Especializado */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FolderTree className="h-6 w-6 text-green-600" />
              <span className="text-green-800">
                {isEditMode ? "Editar" : "Criar"} Caso - Sistema Especializado Único
              </span>
            </div>
            
            {/* Ferramentas Especializadas */}
            {editingCase && (
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={() => setShowAdvancedImageModal(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Ferramentas Especializadas
                </Button>
                
                <Badge variant="outline" className="bg-green-50 border-green-300 text-green-700">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  {specializedImages.length} imagem(ns)
                </Badge>
              </div>
            )}
          </CardTitle>
          
          {/* Banner Organizacional */}
          {organizationInfo && (
            <div className="mt-3 p-3 bg-green-100 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-green-800">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">Organização Especializada:</span>
                <span>{organizationInfo.specialty} → {organizationInfo.modality}</span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                📁 Estrutura: {organizationInfo.bucketPath}
              </p>
            </div>
          )}
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Especialidade *</label>
                <select
                  name="category_id"
                  value={form.category_id || ""}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Selecione a especialidade</option>
                  {specialties.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Dificuldade *</label>
                <select
                  name="difficulty_level"
                  value={form.difficulty_level || ""}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Selecione a dificuldade</option>
                  {difficulties.map(d => (
                    <option key={d.id} value={d.level}>
                      {d.description ? `${d.level} - ${d.description}` : `Nível ${d.level}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pontos *</label>
                <Input
                  name="points"
                  type="number"
                  value={form.points || ""}
                  onChange={handleFormChange}
                  min={1}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Modalidade e Subtipo *</label>
              <CaseModalityFieldsUnified 
                value={{ modality: form.modality || "", subtype: form.subtype || "" }} 
                onChange={handleModalityChange} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Título do Caso</label>
              <Input
                name="title"
                value={form.title || ""}
                onChange={handleFormChange}
                placeholder="Será gerado automaticamente"
                className="bg-gray-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Dados do Paciente */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Idade *</label>
                <Input
                  name="patient_age"
                  value={form.patient_age || ""}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Gênero *</label>
                <select
                  name="patient_gender"
                  value={form.patient_gender || ""}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Selecione o gênero</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="nao_informado">Não informado</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo Clínico */}
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo Clínico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Achados Radiológicos *</label>
              <Textarea
                name="findings"
                value={form.findings || ""}
                onChange={handleFormChange}
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Resumo Clínico *</label>
              <Textarea
                name="patient_clinical_info"
                value={form.patient_clinical_info || ""}
                onChange={handleFormChange}
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Pergunta Principal *</label>
              <Input
                name="main_question"
                value={form.main_question || ""}
                onChange={handleFormChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Explicação *</label>
              <Textarea
                name="explanation"
                value={form.explanation || ""}
                onChange={handleFormChange}
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Alternativas */}
        <Card>
          <CardHeader>
            <CardTitle>Alternativas de Resposta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.answer_options.map((option: string, index: number) => (
              <div key={index}>
                <label className="block text-sm font-medium mb-2">
                  Alternativa {String.fromCharCode(65 + index)} 
                  {index === form.correct_answer_index && (
                    <Badge variant="default" className="ml-2">Correta</Badge>
                  )}
                </label>
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Digite a alternativa ${String.fromCharCode(65 + index)}`}
                />
              </div>
            ))}
            
            <div>
              <label className="block text-sm font-medium mb-2">Resposta Correta</label>
              <select
                value={form.correct_answer_index}
                onChange={(e) => setForm((prev: any) => ({ ...prev, correct_answer_index: parseInt(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {form.answer_options.map((_: any, index: number) => (
                  <option key={index} value={index}>
                    Alternativa {String.fromCharCode(65 + index)}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Envio */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={submitting || uploading || processing}
            className="bg-green-600 hover:bg-green-700"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? "Atualizar Caso" : "Criar Caso"}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Modal de Ferramentas Especializadas */}
      <AdvancedImageManagerModal
        open={showAdvancedImageModal}
        onClose={() => setShowAdvancedImageModal(false)}
        caseId={editingCase?.id}
        currentImages={specializedImages.map(img => img.original_url)}
        onImagesUpdated={(images) => {
          console.log('🎉 Imagens especializadas atualizadas:', images.length);
          toast({ 
            title: "🗂️ Sistema Especializado Atualizado!", 
            description: `${images.length} imagem(ns) organizadas automaticamente.` 
          });
        }}
      />
    </div>
  );
}
