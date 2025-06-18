
import { useCaseAutofillAdvanced } from "./useCaseAutofillAdvanced";
import { toast } from "@/components/ui/use-toast";

export function useCaseAIMaster(form: any, setForm: any, setHighlightedFields: any) {
  const {
    loading,
    autofillStructuredData,
    autofillClinicalSummary,
    autofillEducationalTags,
    autofillGamification,
    autofillQuizComplete,
    autofillExplanationFeedback,
    autofillAdvancedConfig,
    masterAutofill
  } = useCaseAutofillAdvanced();

  const handleStructuredDataAI = async () => {
    const suggestions = await autofillStructuredData(form);
    if (suggestions) {
      const fieldsToUpdate = [
        'primary_diagnosis', 'secondary_diagnoses', 'case_classification', 
        'cid10_code', 'anatomical_regions', 'finding_types', 'laterality',
        'pathology_types', 'differential_diagnoses'
      ];
      
      setForm((prev: any) => ({ ...prev, ...suggestions }));
      setHighlightedFields(fieldsToUpdate);
      setTimeout(() => setHighlightedFields([]), 2000);
      
      toast({ 
        title: "🎯 Dados Estruturados Preenchidos!", 
        description: "Diagnósticos e estruturas anatômicas geradas pela AI" 
      });
    }
  };

  const handleClinicalSummaryAI = async () => {
    const suggestions = await autofillClinicalSummary(form);
    if (suggestions) {
      const fieldsToUpdate = [
        'main_symptoms', 'vital_signs', 'medical_history', 
        'symptoms_duration', 'patient_age', 'patient_gender'
      ];
      
      setForm((prev: any) => ({ ...prev, ...suggestions }));
      setHighlightedFields(fieldsToUpdate);
      setTimeout(() => setHighlightedFields([]), 2000);
      
      toast({ 
        title: "🧠 Resumo Clínico Gerado!", 
        description: "Sintomas, sinais vitais e histórico preenchidos pela AI" 
      });
    }
  };

  const handleEducationalTagsAI = async () => {
    const suggestions = await autofillEducationalTags(form);
    if (suggestions) {
      const fieldsToUpdate = [
        'learning_objectives', 'clinical_presentation_tags', 'case_complexity_factors',
        'search_keywords', 'target_audience', 'medical_subspecialty', 'structured_metadata'
      ];
      
      setForm((prev: any) => ({ ...prev, ...suggestions }));
      setHighlightedFields(fieldsToUpdate);
      setTimeout(() => setHighlightedFields([]), 2000);
      
      toast({ 
        title: "📚 Tags Educacionais Criadas!", 
        description: "Objetivos de aprendizado e metadados gerados pela AI" 
      });
    }
  };

  const handleGamificationAI = async () => {
    const suggestions = await autofillGamification(form);
    if (suggestions) {
      const fieldsToUpdate = [
        'case_rarity', 'educational_value', 'clinical_relevance',
        'estimated_solve_time', 'exam_context', 'achievement_triggers'
      ];
      
      setForm((prev: any) => ({ ...prev, ...suggestions }));
      setHighlightedFields(fieldsToUpdate);
      setTimeout(() => setHighlightedFields([]), 2000);
      
      toast({ 
        title: "🏆 Métricas de Gamificação Definidas!", 
        description: "Raridade, valor educacional e contexto configurados pela AI" 
      });
    }
  };

  const handleQuizCompleteAI = async () => {
    const suggestions = await autofillQuizComplete(form);
    if (suggestions) {
      const fieldsToUpdate = [
        'main_question', 'answer_options', 'correct_answer_index',
        'answer_feedbacks', 'answer_short_tips'
      ];
      
      setForm((prev: any) => ({ ...prev, ...suggestions }));
      setHighlightedFields(fieldsToUpdate);
      setTimeout(() => setHighlightedFields([]), 2000);
      
      toast({ 
        title: "❓ Quiz Completo Gerado!", 
        description: "Pergunta, alternativas, feedbacks e dicas criados pela AI" 
      });
    }
  };

  const handleExplanationFeedbackAI = async () => {
    const suggestions = await autofillExplanationFeedback(form);
    if (suggestions) {
      const fieldsToUpdate = ['explanation', 'manual_hint'];
      
      setForm((prev: any) => ({ ...prev, ...suggestions }));
      setHighlightedFields(fieldsToUpdate);
      setTimeout(() => setHighlightedFields([]), 2000);
      
      toast({ 
        title: "💡 Explicação e Feedback Gerados!", 
        description: "Explicação detalhada e dica estratégica criadas pela AI" 
      });
    }
  };

  const handleAdvancedConfigAI = async () => {
    const suggestions = await autofillAdvancedConfig(form);
    if (suggestions) {
      const fieldsToUpdate = [
        'can_skip', 'max_elimination', 'ai_hint_enabled',
        'skip_penalty_points', 'elimination_penalty_points', 'ai_tutor_level', 'points'
      ];
      
      setForm((prev: any) => ({ ...prev, ...suggestions }));
      setHighlightedFields(fieldsToUpdate);
      setTimeout(() => setHighlightedFields([]), 2000);
      
      toast({ 
        title: "⚙️ Configurações Otimizadas!", 
        description: "Ajustes automáticos de dificuldade e gamificação aplicados" 
      });
    }
  };

  const handleMasterAutofillAI = async () => {
    const suggestions = await masterAutofill(form);
    if (suggestions) {
      // Extrair dados de todas as seções
      const allUpdates = {
        ...(suggestions.basic_data || {}),
        ...(suggestions.structured_data || {}),
        ...(suggestions.clinical_summary || {}),
        ...(suggestions.educational_tags || {}),
        ...(suggestions.gamification || {}),
        ...(suggestions.quiz || {}),
        ...(suggestions.explanation || {}),
        ...(suggestions.advanced_config || {})
      };
      
      const allFields = Object.keys(allUpdates);
      
      setForm((prev: any) => ({ ...prev, ...allUpdates }));
      setHighlightedFields(allFields);
      setTimeout(() => setHighlightedFields([]), 3000);
      
      toast({ 
        title: "🪄 PREENCHIMENTO TOTAL CONCLUÍDO!", 
        description: `${allFields.length} campos preenchidos automaticamente pela AI`,
        duration: 5000
      });
    }
  };

  return {
    loading,
    handleStructuredDataAI,
    handleClinicalSummaryAI,
    handleEducationalTagsAI,
    handleGamificationAI,
    handleQuizCompleteAI,
    handleExplanationFeedbackAI,
    handleAdvancedConfigAI,
    handleMasterAutofillAI
  };
}
