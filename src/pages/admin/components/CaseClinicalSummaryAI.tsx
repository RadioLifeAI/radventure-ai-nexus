
import React from "react";
import { Button } from "@/components/ui/button";
import { Stethoscope, Activity, FileText, Loader2 } from "lucide-react";
import { useCaseAutofillAPI } from "../hooks/useCaseAutofillAPI";
import { toast } from "@/components/ui/use-toast";

interface CaseClinicalSummaryAIProps {
  form: any;
  setForm: (updater: (prev: any) => any) => void;
  onFieldsHighlighted?: (fields: string[]) => void;
}

export function CaseClinicalSummaryAI({ form, setForm, onFieldsHighlighted }: CaseClinicalSummaryAIProps) {
  const { autofillClinicalSummary, loading } = useCaseAutofillAPI();

  const handleAutofillClinicalSummary = async () => {
    if (!form.primary_diagnosis && !form.findings) {
      toast({ 
        title: "Dados insuficientes", 
        description: "Preencha o diagnóstico principal ou achados para gerar resumo clínico.",
        variant: "destructive"
      });
      return;
    }

    try {
      const suggestions = await autofillClinicalSummary(form);
      
      if (suggestions) {
        setForm((prev: any) => ({
          ...prev,
          main_symptoms: suggestions.main_symptoms || [],
          vital_signs: suggestions.vital_signs || {},
          medical_history: suggestions.medical_history || [],
          patient_age: suggestions.patient_age || prev.patient_age,
          patient_gender: suggestions.patient_gender || prev.patient_gender,
          symptoms_duration: suggestions.symptoms_duration || prev.symptoms_duration
        }));

        const highlightFields = [
          'main_symptoms', 'vital_signs', 'medical_history',
          'patient_age', 'patient_gender', 'symptoms_duration'
        ];
        
        onFieldsHighlighted?.(highlightFields);
        setTimeout(() => onFieldsHighlighted?.([]), 2000);

        toast({ 
          title: "✅ Resumo clínico gerado!", 
          description: "Sintomas, sinais vitais e histórico preenchidos automaticamente." 
        });
      }
    } catch (error) {
      console.error('Erro ao gerar resumo clínico:', error);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAutofillClinicalSummary}
        disabled={loading}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Stethoscope className="h-4 w-4 mr-2" />
        )}
        💊 AI: Gerar Resumo Clínico
      </Button>
    </div>
  );
}
