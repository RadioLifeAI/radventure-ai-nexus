
import React from "react";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2 } from "lucide-react";
import { useCaseAutofillAPIExpanded } from "../hooks/useCaseAutofillAPIExpanded";
import { toast } from "@/components/ui/use-toast";

interface CaseMasterAIProps {
  form: any;
  setForm: (form: any) => void;
  onFieldsUpdated?: (fields: string[]) => void;
  disabled?: boolean;
}

export function CaseMasterAI({ 
  form, 
  setForm, 
  onFieldsUpdated,
  disabled = false 
}: CaseMasterAIProps) {
  const { autofillMasterComplete, loading } = useCaseAutofillAPIExpanded();

  const handleAutofillMasterComplete = async () => {
    try {
      console.log('🪄 Iniciando AI: Preencher TUDO...');
      
      const suggestions = await autofillMasterComplete(form);
      
      if (!suggestions) {
        console.log('❌ Nenhuma sugestão recebida');
        return;
      }

      console.log('✅ Sugestões recebidas:', suggestions);

      // Aplicar TODAS as sugestões ao formulário
      const updatedFields: string[] = [];
      const updates: any = {};

      // Lista completa de todos os campos que podem ser preenchidos
      const allFields = [
        // Básicos
        'category_id', 'difficulty_level', 'points', 'modality', 'subtype',
        'patient_age', 'patient_gender', 'symptoms_duration',
        // Estruturados
        'primary_diagnosis', 'secondary_diagnoses', 'case_classification', 'cid10_code',
        'anatomical_regions', 'finding_types', 'laterality', 'main_symptoms',
        'vital_signs', 'medical_history', 'learning_objectives', 'pathology_types',
        'clinical_presentation_tags', 'case_complexity_factors', 'search_keywords',
        'structured_metadata', 'case_rarity', 'educational_value', 'clinical_relevance',
        'estimated_solve_time', 'target_audience', 'medical_subspecialty', 'exam_context',
        'differential_diagnoses', 'similar_cases_ids',
        // Quiz
        'main_question', 'answer_options', 'correct_answer_index', 'answer_feedbacks', 'answer_short_tips',
        // Explicação
        'explanation', 'manual_hint',
        // Configurações avançadas
        'can_skip', 'max_elimination', 'ai_hint_enabled', 'skip_penalty_points',
        'elimination_penalty_points', 'ai_tutor_level', 'achievement_triggers'
      ];

      allFields.forEach(field => {
        if (suggestions[field] !== undefined && suggestions[field] !== null) {
          updates[field] = suggestions[field];
          updatedFields.push(field);
        }
      });

      if (Object.keys(updates).length > 0) {
        setForm((prev: any) => ({ ...prev, ...updates }));
        onFieldsUpdated?.(updatedFields);
        
        toast({ 
          title: `🪄 AI MASTER: Formulário Completo!`,
          description: `${updatedFields.length} campos preenchidos automaticamente. Caso pronto para revisão!` 
        });
      } else {
        toast({ 
          title: "Formulário já está completo",
          description: "Todos os campos já estão preenchidos ou não puderam ser determinados."
        });
      }

    } catch (error) {
      console.error('💥 Erro na AI Master:', error);
      toast({ 
        title: "Erro na AI Master", 
        description: "Tente novamente ou preencha o diagnóstico principal primeiro.",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-lg shadow-md">
      <Button
        type="button"
        onClick={handleAutofillMasterComplete}
        disabled={loading || disabled}
        variant="outline"
        size="lg"
        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 border-pink-500 font-bold"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        ) : (
          <Wand2 className="h-5 w-5 mr-2" />
        )}
        🪄 AI: Preencher TUDO
      </Button>
      
      <div className="text-sm text-purple-700">
        <div className="font-bold">AUTO-PREENCHIMENTO TOTAL:</div>
        <div className="text-xs">Básicos • Estruturados • Quiz • Explicação • Config • TUDO!</div>
      </div>
    </div>
  );
}
