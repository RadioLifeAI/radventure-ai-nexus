
import React from "react";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2, CheckCircle } from "lucide-react";
import { useCaseAutofillAPI } from "../hooks/useCaseAutofillAPI";
import { toast } from "@/components/ui/use-toast";

interface CaseMasterAutofillAIProps {
  form: any;
  setForm: (updater: (prev: any) => any) => void;
  onFieldsHighlighted?: (fields: string[]) => void;
}

export function CaseMasterAutofillAI({ form, setForm, onFieldsHighlighted }: CaseMasterAutofillAIProps) {
  const { completeAutofill, loading } = useCaseAutofillAPI();

  const handleCompleteAutofill = async () => {
    if (!form.primary_diagnosis && !form.findings) {
      toast({ 
        title: "Dados insuficientes", 
        description: "Preencha pelo menos o diagnóstico principal ou achados radiológicos para usar o auto-preenchimento completo.",
        variant: "destructive"
      });
      return;
    }

    try {
      const suggestions = await completeAutofill(form);
      
      if (suggestions) {
        // Preservar dados já preenchidos, apenas completar os vazios
        setForm((prev: any) => ({
          ...prev,
          // Dados básicos
          category_id: suggestions.category_id || prev.category_id,
          difficulty_level: suggestions.difficulty_level || prev.difficulty_level,
          points: suggestions.points || prev.points,
          modality: suggestions.modality || prev.modality,
          subtype: suggestions.subtype || prev.subtype,
          
          // Diagnósticos estruturados
          primary_diagnosis: suggestions.primary_diagnosis || prev.primary_diagnosis,
          secondary_diagnoses: suggestions.secondary_diagnoses || [],
          cid10_code: suggestions.cid10_code || prev.cid10_code,
          case_classification: suggestions.case_classification || prev.case_classification,
          differential_diagnoses: suggestions.differential_diagnoses || [],
          anatomical_regions: suggestions.anatomical_regions || [],
          finding_types: suggestions.finding_types || [],
          laterality: suggestions.laterality || prev.laterality,
          pathology_types: suggestions.pathology_types || [],
          
          // Resumo clínico
          main_symptoms: suggestions.main_symptoms || [],
          vital_signs: suggestions.vital_signs || {},
          medical_history: suggestions.medical_history || [],
          
          // Tags educacionais
          learning_objectives: suggestions.learning_objectives || [],
          clinical_presentation_tags: suggestions.clinical_presentation_tags || [],
          search_keywords: suggestions.search_keywords || [],
          target_audience: suggestions.target_audience || [],
          medical_subspecialty: suggestions.medical_subspecialty || [],
          case_complexity_factors: suggestions.case_complexity_factors || [],
          
          // Métricas de gamificação
          case_rarity: suggestions.case_rarity || prev.case_rarity,
          educational_value: suggestions.educational_value || prev.educational_value,
          clinical_relevance: suggestions.clinical_relevance || prev.clinical_relevance,
          estimated_solve_time: suggestions.estimated_solve_time || prev.estimated_solve_time,
          exam_context: suggestions.exam_context || prev.exam_context,
          
          // Quiz
          main_question: suggestions.main_question || prev.main_question,
          answer_options: suggestions.answer_options || ["", "", "", ""],
          correct_answer_index: suggestions.correct_answer_index ?? prev.correct_answer_index,
          answer_feedbacks: suggestions.answer_feedbacks || ["", "", "", ""],
          answer_short_tips: suggestions.answer_short_tips || ["", "", "", ""],
          
          // Configurações avançadas
          can_skip: suggestions.can_skip ?? prev.can_skip,
          max_elimination: suggestions.max_elimination ?? prev.max_elimination,
          ai_hint_enabled: suggestions.ai_hint_enabled ?? prev.ai_hint_enabled,
          manual_hint: suggestions.manual_hint || prev.manual_hint,
          skip_penalty_points: suggestions.skip_penalty_points ?? prev.skip_penalty_points,
          elimination_penalty_points: suggestions.elimination_penalty_points ?? prev.elimination_penalty_points,
          ai_tutor_level: suggestions.ai_tutor_level || prev.ai_tutor_level
        }));

        // Destacar TODOS os campos preenchidos
        const allFields = [
          'category_id', 'difficulty_level', 'points', 'modality', 'subtype',
          'primary_diagnosis', 'secondary_diagnoses', 'cid10_code', 'case_classification',
          'differential_diagnoses', 'anatomical_regions', 'finding_types', 'laterality',
          'pathology_types', 'main_symptoms', 'vital_signs', 'medical_history',
          'learning_objectives', 'clinical_presentation_tags', 'search_keywords',
          'target_audience', 'medical_subspecialty', 'case_complexity_factors',
          'case_rarity', 'educational_value', 'clinical_relevance', 'estimated_solve_time',
          'exam_context', 'main_question', 'answer_options', 'answer_feedbacks',
          'answer_short_tips', 'can_skip', 'max_elimination', 'ai_hint_enabled',
          'manual_hint', 'skip_penalty_points', 'elimination_penalty_points', 'ai_tutor_level'
        ];
        
        onFieldsHighlighted?.(allFields);
        setTimeout(() => onFieldsHighlighted?.([]), 3000);

        toast({ 
          title: "🪄 Auto-preenchimento completo realizado!", 
          description: "Todos os campos foram preenchidos automaticamente com base no diagnóstico fornecido. Tempo estimado poupado: ~30 minutos.",
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Erro no auto-preenchimento completo:', error);
    }
  };

  return (
    <div className="w-full">
      <Button
        type="button"
        onClick={handleCompleteAutofill}
        disabled={loading}
        size="lg"
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-3" />
            Analisando com IA...
          </>
        ) : (
          <>
            <Wand2 className="h-5 w-5 mr-3" />
            🪄 AI: Preencher Tudo Automaticamente
          </>
        )}
      </Button>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Preenche automaticamente TODOS os campos baseado no diagnóstico principal e achados radiológicos
      </p>
    </div>
  );
}
