
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface AutofillOptions {
  action: 'smart_autofill' | 'template_autofill' | 'field_completion' | 'consistency_check' | 'smart_suggestions';
  templateType?: string;
}

export function useCaseAutofillAPI() {
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
    smartAutofill,
    applyTemplate,
    completeFields,
    checkConsistency,
    getSmartSuggestions,
    callAutofillAPI
  };
}
