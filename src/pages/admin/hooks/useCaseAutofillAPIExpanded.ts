
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface AutofillOptions {
  action: 'smart_autofill' | 'template_autofill' | 'field_completion' | 'consistency_check' | 'smart_suggestions' |
         'autofill_basic_complete' | 'autofill_structured_complete' | 'autofill_quiz_complete' | 
         'autofill_explanation_complete' | 'autofill_advanced_config' | 'autofill_master_complete';
  templateType?: string;
}

export function useCaseAutofillAPIExpanded() {
  const [loading, setLoading] = useState(false);
  const [lastSuggestions, setLastSuggestions] = useState<any>(null);

  const callAutofillAPI = async (caseData: any, options: AutofillOptions) => {
    setLoading(true);
    
    try {
      console.log('🚀 Calling case-autofill API:', options);
      
      const { data, error } = await supabase.functions.invoke('case-autofill', {
        body: { 
          caseData, 
          action: options.action,
          templateType: options.templateType 
        }
      });

      if (error) {
        console.error('❌ API Error:', error);
        
        // Tratamento especial para erro de diagnóstico obrigatório
        if (error.message?.includes('Diagnóstico principal é obrigatório')) {
          toast({ 
            title: "Diagnóstico Principal Obrigatório", 
            description: "Preencha o diagnóstico principal antes de usar a AI nesta seção.",
            variant: "destructive" 
          });
          return null;
        }
        
        throw error;
      }

      console.log('✅ API Response:', data);
      
      const suggestions = data?.suggestions;
      setLastSuggestions(suggestions);
      
      return suggestions;
    } catch (error: any) {
      console.error('💥 Autofill API Error:', error);
      toast({ 
        title: "Erro no auto-preenchimento", 
        description: error.message || "Erro desconhecido",
        variant: "destructive" 
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Funções específicas por seção
  const autofillBasicComplete = async (caseData: any) => {
    return await callAutofillAPI(caseData, { action: 'autofill_basic_complete' });
  };

  const autofillStructuredComplete = async (caseData: any) => {
    return await callAutofillAPI(caseData, { action: 'autofill_structured_complete' });
  };

  const autofillQuizComplete = async (caseData: any) => {
    return await callAutofillAPI(caseData, { action: 'autofill_quiz_complete' });
  };

  const autofillExplanationComplete = async (caseData: any) => {
    return await callAutofillAPI(caseData, { action: 'autofill_explanation_complete' });
  };

  const autofillAdvancedConfig = async (caseData: any) => {
    return await callAutofillAPI(caseData, { action: 'autofill_advanced_config' });
  };

  const autofillMasterComplete = async (caseData: any) => {
    return await callAutofillAPI(caseData, { action: 'autofill_master_complete' });
  };

  // Funções existentes mantidas para compatibilidade
  const smartAutofill = async (caseData: any) => {
    return await callAutofillAPI(caseData, { action: 'smart_autofill' });
  };

  const applyTemplate = async (caseData: any, templateType: string) => {
    return await callAutofillAPI(caseData, { action: 'template_autofill', templateType });
  };

  const completeFields = async (caseData: any) => {
    return await callAutofillAPI(caseData, { action: 'field_completion' });
  };

  const checkConsistency = async (caseData: any) => {
    return await callAutofillAPI(caseData, { action: 'consistency_check' });
  };

  const getSmartSuggestions = async (caseData: any) => {
    return await callAutofillAPI(caseData, { action: 'smart_suggestions' });
  };

  return {
    loading,
    lastSuggestions,
    // Novas funções por seção
    autofillBasicComplete,
    autofillStructuredComplete,
    autofillQuizComplete,
    autofillExplanationComplete,
    autofillAdvancedConfig,
    autofillMasterComplete,
    // Funções existentes
    smartAutofill,
    applyTemplate,
    completeFields,
    checkConsistency,
    getSmartSuggestions,
    callAutofillAPI
  };
}
