
import React from "react";
import { Button } from "@/components/ui/button";
import { Brain, Target, Stethoscope, Loader2 } from "lucide-react";
import { useCaseAutofillAPI } from "../hooks/useCaseAutofillAPI";
import { toast } from "@/components/ui/use-toast";

interface CaseStructuredDataAIProps {
  form: any;
  setForm: (updater: (prev: any) => any) => void;
  onFieldsHighlighted?: (fields: string[]) => void;
}

export function CaseStructuredDataAI({ form, setForm, onFieldsHighlighted }: CaseStructuredDataAIProps) {
  const { autofillStructuredDiagnosis, loading } = useCaseAutofillAPI();

  const handleAutofillStructuredDiagnosis = async () => {
    if (!form.primary_diagnosis && !form.findings) {
      toast({ 
        title: "Dados insuficientes", 
        description: "Preencha o diagnóstico principal ou achados para gerar dados estruturados.",
        variant: "destructive"
      });
      return;
    }

    try {
      const suggestions = await autofillStructuredDiagnosis(form);
      
      if (suggestions) {
        setForm((prev: any) => ({
          ...prev,
          primary_diagnosis: suggestions.primary_diagnosis || prev.primary_diagnosis,
          secondary_diagnoses: suggestions.secondary_diagnoses || [],
          cid10_code: suggestions.cid10_code || "",
          case_classification: suggestions.case_classification || "diagnostico",
          differential_diagnoses: suggestions.differential_diagnoses || [],
          anatomical_regions: suggestions.anatomical_regions || [],
          finding_types: suggestions.finding_types || [],
          laterality: suggestions.laterality || "",
          pathology_types: suggestions.pathology_types || []
        }));

        const highlightFields = [
          'primary_diagnosis', 'secondary_diagnoses', 'cid10_code', 
          'case_classification', 'differential_diagnoses', 'anatomical_regions',
          'finding_types', 'laterality', 'pathology_types'
        ];
        
        onFieldsHighlighted?.(highlightFields);
        setTimeout(() => onFieldsHighlighted?.([]), 2000);

        toast({ 
          title: "✅ Dados estruturados gerados!", 
          description: "Diagnósticos e dados estruturados preenchidos automaticamente." 
        });
      }
    } catch (error) {
      console.error('Erro ao gerar dados estruturados:', error);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAutofillStructuredDiagnosis}
        disabled={loading}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Brain className="h-4 w-4 mr-2" />
        )}
        🧠 AI: Completar Diagnósticos
      </Button>
    </div>
  );
}
