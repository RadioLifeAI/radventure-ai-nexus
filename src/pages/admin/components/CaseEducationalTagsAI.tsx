
import React from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Tags, Search, Loader2 } from "lucide-react";
import { useCaseAutofillAPI } from "../hooks/useCaseAutofillAPI";
import { toast } from "@/components/ui/use-toast";

interface CaseEducationalTagsAIProps {
  form: any;
  setForm: (updater: (prev: any) => any) => void;
  onFieldsHighlighted?: (fields: string[]) => void;
}

export function CaseEducationalTagsAI({ form, setForm, onFieldsHighlighted }: CaseEducationalTagsAIProps) {
  const { autofillEducationalTags, loading } = useCaseAutofillAPI();

  const handleAutofillEducationalTags = async () => {
    if (!form.primary_diagnosis && !form.findings) {
      toast({ 
        title: "Dados insuficientes", 
        description: "Preencha o diagnóstico principal ou achados para gerar tags educacionais.",
        variant: "destructive"
      });
      return;
    }

    try {
      const suggestions = await autofillEducationalTags(form);
      
      if (suggestions) {
        setForm((prev: any) => ({
          ...prev,
          learning_objectives: suggestions.learning_objectives || [],
          clinical_presentation_tags: suggestions.clinical_presentation_tags || [],
          search_keywords: suggestions.search_keywords || [],
          target_audience: suggestions.target_audience || [],
          medical_subspecialty: suggestions.medical_subspecialty || [],
          case_complexity_factors: suggestions.case_complexity_factors || []
        }));

        const highlightFields = [
          'learning_objectives', 'clinical_presentation_tags', 'search_keywords',
          'target_audience', 'medical_subspecialty', 'case_complexity_factors'
        ];
        
        onFieldsHighlighted?.(highlightFields);
        setTimeout(() => onFieldsHighlighted?.([]), 2000);

        toast({ 
          title: "✅ Tags educacionais geradas!", 
          description: "Objetivos de aprendizado, tags e palavras-chave criados automaticamente." 
        });
      }
    } catch (error) {
      console.error('Erro ao gerar tags educacionais:', error);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAutofillEducationalTags}
        disabled={loading}
        className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 hover:from-purple-100 hover:to-violet-100"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <GraduationCap className="h-4 w-4 mr-2" />
        )}
        🎓 AI: Tags Educacionais
      </Button>
    </div>
  );
}
