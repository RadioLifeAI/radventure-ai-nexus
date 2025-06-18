
import React from "react";
import { Button } from "@/components/ui/button";
import { Gamepad2, Target, Star, Loader2 } from "lucide-react";
import { useCaseAutofillAPI } from "../hooks/useCaseAutofillAPI";
import { toast } from "@/components/ui/use-toast";

interface CaseGamificationAIProps {
  form: any;
  setForm: (updater: (prev: any) => any) => void;
  onFieldsHighlighted?: (fields: string[]) => void;
}

export function CaseGamificationAI({ form, setForm, onFieldsHighlighted }: CaseGamificationAIProps) {
  const { autofillGamificationMetrics, loading } = useCaseAutofillAPI();

  const handleAutofillGamificationMetrics = async () => {
    if (!form.primary_diagnosis && !form.findings) {
      toast({ 
        title: "Dados insuficientes", 
        description: "Preencha o diagnóstico principal ou achados para calcular métricas de gamificação.",
        variant: "destructive"
      });
      return;
    }

    try {
      const suggestions = await autofillGamificationMetrics(form);
      
      if (suggestions) {
        setForm((prev: any) => ({
          ...prev,
          case_rarity: suggestions.case_rarity || "comum",
          educational_value: suggestions.educational_value || 5,
          clinical_relevance: suggestions.clinical_relevance || 5,
          estimated_solve_time: suggestions.estimated_solve_time || 5,
          exam_context: suggestions.exam_context || "rotina",
          difficulty_level: suggestions.difficulty_level || prev.difficulty_level,
          points: suggestions.points || prev.points
        }));

        const highlightFields = [
          'case_rarity', 'educational_value', 'clinical_relevance',
          'estimated_solve_time', 'exam_context', 'difficulty_level', 'points'
        ];
        
        onFieldsHighlighted?.(highlightFields);
        setTimeout(() => onFieldsHighlighted?.([]), 2000);

        toast({ 
          title: "✅ Métricas de gamificação calculadas!", 
          description: "Dificuldade, raridade e valor educacional definidos automaticamente." 
        });
      }
    } catch (error) {
      console.error('Erro ao calcular métricas de gamificação:', error);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAutofillGamificationMetrics}
        disabled={loading}
        className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 hover:from-orange-100 hover:to-red-100"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Gamepad2 className="h-4 w-4 mr-2" />
        )}
        ⭐ AI: Calcular Métricas
      </Button>
    </div>
  );
}
