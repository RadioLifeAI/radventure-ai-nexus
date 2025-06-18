
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface AdvancedAutofillOptions {
  action: 'autofill_structured_data' | 'autofill_clinical_summary' | 'autofill_educational_tags' | 
          'autofill_gamification' | 'autofill_quiz_complete' | 'autofill_explanation_feedback' | 
          'autofill_advanced_config' | 'master_autofill';
}

export function useCaseAutofillAdvanced() {
  const [loading, setLoading] = useState(false);
  const [lastSuggestions, setLastSuggestions] = useState<any>(null);

  const callAdvancedAutofillAPI = async (caseData: any, options: AdvancedAutofillOptions) => {
    setLoading(true);
    
    try {
      console.log('🚀 Calling advanced case-autofill API:', options);
      
      const { data, error } = await supabase.functions.invoke('case-autofill', {
        body: { 
          caseData, 
          action: options.action
        }
      });

      if (error) {
        console.error('❌ API Error:', error);
        throw error;
      }

      console.log('✅ API Response:', data);
      
      const suggestions = data?.suggestions;
      setLastSuggestions(suggestions);
      
      return suggestions;
    } catch (error: any) {
      console.error('💥 Advanced Autofill API Error:', error);
      toast({ 
        title: "Erro no auto-preenchimento avançado", 
        description: error.message || "Erro desconhecido",
        variant: "destructive" 
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const autofillStructuredData = async (caseData: any) => {
    return await callAdvancedAutofillAPI(caseData, { action: 'autofill_structured_data' });
  };

  const autofillClinicalSummary = async (caseData: any) => {
    return await callAdvancedAutofillAPI(caseData, { action: 'autofill_clinical_summary' });
  };

  const autofillEducationalTags = async (caseData: any) => {
    return await callAdvancedAutofillAPI(caseData, { action: 'autofill_educational_tags' });
  };

  const autofillGamification = async (caseData: any) => {
    return await callAdvancedAutofillAPI(caseData, { action: 'autofill_gamification' });
  };

  const autofillQuizComplete = async (caseData: any) => {
    return await callAdvancedAutofillAPI(caseData, { action: 'autofill_quiz_complete' });
  };

  const autofillExplanationFeedback = async (caseData: any) => {
    return await callAdvancedAutofillAPI(caseData, { action: 'autofill_explanation_feedback' });
  };

  const autofillAdvancedConfig = async (caseData: any) => {
    return await callAdvancedAutofillAPI(caseData, { action: 'autofill_advanced_config' });
  };

  const masterAutofill = async (caseData: any) => {
    return await callAdvancedAutofillAPI(caseData, { action: 'master_autofill' });
  };

  return {
    loading,
    lastSuggestions,
    autofillStructuredData,
    autofillClinicalSummary,
    autofillEducationalTags,
    autofillGamification,
    autofillQuizComplete,
    autofillExplanationFeedback,
    autofillAdvancedConfig,
    masterAutofill,
    callAdvancedAutofillAPI
  };
}
