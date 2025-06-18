
import { useState, useCallback } from "react";
import { useCaseAutofillAPIExpanded } from "./useCaseAutofillAPIExpanded";

export function useDynamicSuggestions() {
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const { autofillStructuredComplete } = useCaseAutofillAPIExpanded();

  const generateSuggestions = useCallback(async (primaryDiagnosis: string) => {
    if (!primaryDiagnosis.trim()) {
      setSuggestions({});
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Gerando sugestões dinâmicas para:', primaryDiagnosis);
      
      const result = await autofillStructuredComplete({ primary_diagnosis: primaryDiagnosis });
      
      if (result) {
        // Extrair sugestões específicas para cada campo
        const dynamicSuggestions = {
          anatomical_regions: result.anatomical_regions || [],
          main_symptoms: result.main_symptoms || [],
          medical_history: result.medical_history || [],
          pathology_types: result.pathology_types || [],
          clinical_presentation_tags: result.clinical_presentation_tags || [],
          case_complexity_factors: result.case_complexity_factors || [],
          search_keywords: result.search_keywords || [],
          differential_diagnoses: result.differential_diagnoses || [],
          finding_types: result.finding_types || [],
          learning_objectives: result.learning_objectives || [],
          target_audience: result.target_audience || []
        };
        
        setSuggestions(dynamicSuggestions);
        console.log('✅ Sugestões dinâmicas geradas:', dynamicSuggestions);
        return dynamicSuggestions;
      }
    } catch (error) {
      console.error('❌ Erro ao gerar sugestões dinâmicas:', error);
    } finally {
      setLoading(false);
    }
  }, [autofillStructuredComplete]);

  const clearSuggestions = useCallback(() => {
    setSuggestions({});
  }, []);

  return {
    suggestions,
    loading,
    generateSuggestions,
    clearSuggestions
  };
}
