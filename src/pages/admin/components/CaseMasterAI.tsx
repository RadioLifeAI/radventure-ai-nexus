
import React from "react";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2 } from "lucide-react";
import { useCaseAutofillAPIExpanded } from "../hooks/useCaseAutofillAPIExpanded";
import { useCaseTitleGenerator } from "../hooks/useCaseTitleGenerator";
import { toast } from "@/components/ui/use-toast";

interface CaseMasterAIProps {
  form: any;
  setForm: (form: any) => void;
  onFieldsUpdated?: (fields: string[]) => void;
  disabled?: boolean;
  categories?: { id: number; name: string }[];
}

export function CaseMasterAI({ 
  form, 
  setForm, 
  onFieldsUpdated,
  disabled = false,
  categories = []
}: CaseMasterAIProps) {
  const { autofillMasterComplete, loading } = useCaseAutofillAPIExpanded();
  const { generateTitle } = useCaseTitleGenerator(categories);

  const handleAutofillMasterComplete = async () => {
    try {
      console.log('🪄 Iniciando AI MASTER: Preencher TUDO...');
      
      // Verificar se há pelo menos um diagnóstico principal
      if (!form.primary_diagnosis?.trim()) {
        toast({ 
          title: "Diagnóstico Principal Obrigatório", 
          description: "Digite o diagnóstico principal primeiro para que a AI possa preencher todo o formulário.",
          variant: "destructive" 
        });
        return;
      }
      
      const suggestions = await autofillMasterComplete(form);
      
      if (!suggestions) {
        console.log('❌ Nenhuma sugestão recebida');
        return;
      }

      console.log('✅ Sugestões MASTER recebidas:', suggestions);

      // Aplicar TODAS as sugestões ao formulário em sequência inteligente
      const updatedFields: string[] = [];
      const updates: any = {};

      // SEÇÃO 1: Dados Básicos
      const basicFields = [
        'category_id', 'difficulty_level', 'points', 'modality', 'subtype',
        'patient_age', 'patient_gender', 'symptoms_duration', 'findings', 'patient_clinical_info'
      ];

      // SEÇÃO 2: Dados Estruturados  
      const structuredFields = [
        'primary_diagnosis', 'differential_diagnoses', 'anatomical_regions', 'main_symptoms',
        'learning_objectives', 'pathology_types', 'clinical_presentation_tags',
        'case_complexity_factors', 'search_keywords', 'case_classification',
        'cid10_code', 'laterality', 'vital_signs', 'medical_history',
        'structured_metadata', 'case_rarity', 'educational_value', 'clinical_relevance',
        'estimated_solve_time', 'target_audience', 'medical_subspecialty', 'exam_context'
      ];

      // SEÇÃO 3: Quiz
      const quizFields = [
        'main_question', 'answer_options', 'correct_answer_index', 
        'answer_feedbacks', 'answer_short_tips'
      ];

      // SEÇÃO 4: Explicação
      const explanationFields = ['explanation', 'manual_hint'];

      // SEÇÃO 5: Configurações Avançadas
      const configFields = [
        'can_skip', 'max_elimination', 'ai_hint_enabled', 'skip_penalty_points',
        'elimination_penalty_points', 'ai_tutor_level', 'achievement_triggers'
      ];

      // Aplicar todas as seções em ordem
      const allFields = [...basicFields, ...structuredFields, ...quizFields, ...explanationFields, ...configFields];

      allFields.forEach(field => {
        if (suggestions[field] !== undefined && suggestions[field] !== null) {
          // CORREÇÃO: Não aplicar valores "string" literais
          if (suggestions[field] === "string" || suggestions[field] === "diagnóstico_correto") {
            console.warn(`⚠️ Ignorando valor literal "${suggestions[field]}" para campo ${field}`);
            return;
          }
          
          // Conversão específica para campos numéricos
          if (field === 'category_id' && typeof suggestions[field] === 'number') {
            updates[field] = suggestions[field];
          } else if (field === 'difficulty_level' && typeof suggestions[field] === 'number') {
            updates[field] = suggestions[field];
          } else if (field === 'points' && typeof suggestions[field] === 'number') {
            updates[field] = suggestions[field];
          } else {
            updates[field] = suggestions[field];
          }
          updatedFields.push(field);
        }
      });

      // VALIDAÇÃO ESPECÍFICA: Garantir 4 diagnósticos diferenciais
      if (suggestions.differential_diagnoses && Array.isArray(suggestions.differential_diagnoses)) {
        if (suggestions.differential_diagnoses.length !== 4) {
          console.warn(`⚠️ Esperados 4 diagnósticos diferenciais, recebidos ${suggestions.differential_diagnoses.length}`);
        }
        updates.differential_diagnoses = suggestions.differential_diagnoses.slice(0, 4);
      }

      // VALIDAÇÃO ESPECÍFICA: Quiz baseado em diagnósticos - Corrigir alternativas com "diagnóstico_correto"
      if (suggestions.answer_options && Array.isArray(suggestions.answer_options)) {
        const correctedOptions = suggestions.answer_options.map((option: string, index: number) => {
          if (option === "diagnóstico_correto" && suggestions.correct_answer_index === index) {
            return form.primary_diagnosis || suggestions.primary_diagnosis || "Opção correta";
          }
          return option;
        });
        updates.answer_options = correctedOptions.slice(0, 4);
      }

      // GERAÇÃO AUTOMÁTICA DO TÍTULO MASTER
      if (updates.category_id && updates.modality && updates.difficulty_level) {
        const titleData = generateTitle(
          updates.category_id, 
          updates.modality, 
          updates.difficulty_level
        );
        updates.title = titleData.title;
        updates.case_number = titleData.case_number;
        updatedFields.push('title', 'case_number');
        
        console.log('📝 Título MASTER gerado automaticamente:', titleData.title);
      }

      if (Object.keys(updates).length > 0) {
        setForm((prev: any) => ({ ...prev, ...updates }));
        onFieldsUpdated?.(updatedFields);
        
        const sections = [
          updatedFields.some(f => basicFields.includes(f)) ? 'Básicos' : '',
          updatedFields.some(f => structuredFields.includes(f)) ? 'Estruturados' : '',
          updatedFields.some(f => quizFields.includes(f)) ? 'Quiz' : '',
          updatedFields.some(f => explanationFields.includes(f)) ? 'Explicação' : '',
          updatedFields.some(f => configFields.includes(f)) ? 'Configurações' : ''
        ].filter(Boolean).join(' • ');
        
        const titleMessage = updates.title ? ` | Título: "${updates.title}"` : '';
        
        toast({ 
          title: `🪄 AI MASTER: Formulário Completo!`,
          description: `${updatedFields.length} campos preenchidos: ${sections}${titleMessage}` 
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
        <div className="font-bold">AUTO-PREENCHIMENTO INTELIGENTE:</div>
        <div className="text-xs">Sequência: Básicos (+ Título) → Estruturados → Quiz → Explicação → Config</div>
      </div>
    </div>
  );
}
