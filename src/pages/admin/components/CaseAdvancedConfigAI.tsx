
import React from "react";
import { Button } from "@/components/ui/button";
import { Settings, Zap, Shield, Loader2 } from "lucide-react";
import { useCaseAutofillAPI } from "../hooks/useCaseAutofillAPI";
import { toast } from "@/components/ui/use-toast";

interface CaseAdvancedConfigAIProps {
  form: any;
  setForm: (updater: (prev: any) => any) => void;
  onFieldsHighlighted?: (fields: string[]) => void;
}

export function CaseAdvancedConfigAI({ form, setForm, onFieldsHighlighted }: CaseAdvancedConfigAIProps) {
  const { autofillAdvancedConfig, loading } = useCaseAutofillAPI();

  const handleAutofillAdvancedConfig = async () => {
    if (!form.primary_diagnosis && !form.difficulty_level) {
      toast({ 
        title: "Dados insuficientes", 
        description: "Preencha o diagnóstico principal ou nível de dificuldade para configurar parâmetros avançados.",
        variant: "destructive"
      });
      return;
    }

    try {
      const suggestions = await autofillAdvancedConfig(form);
      
      if (suggestions) {
        setForm((prev: any) => ({
          ...prev,
          can_skip: suggestions.can_skip ?? true,
          max_elimination: suggestions.max_elimination ?? 2,
          ai_hint_enabled: suggestions.ai_hint_enabled ?? true,
          manual_hint: suggestions.manual_hint || prev.manual_hint,
          skip_penalty_points: suggestions.skip_penalty_points ?? 5,
          elimination_penalty_points: suggestions.elimination_penalty_points ?? 2,
          ai_tutor_level: suggestions.ai_tutor_level || "intermediario"
        }));

        const highlightFields = [
          'can_skip', 'max_elimination', 'ai_hint_enabled', 'manual_hint',
          'skip_penalty_points', 'elimination_penalty_points', 'ai_tutor_level'
        ];
        
        onFieldsHighlighted?.(highlightFields);
        setTimeout(() => onFieldsHighlighted?.([]), 2000);

        toast({ 
          title: "✅ Configurações avançadas aplicadas!", 
          description: "Parâmetros de gamificação e penalidades configurados automaticamente." 
        });
      }
    } catch (error) {
      console.error('Erro ao configurar parâmetros avançados:', error);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAutofillAdvancedConfig}
        disabled={loading}
        className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 hover:from-gray-100 hover:to-slate-100"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Settings className="h-4 w-4 mr-2" />
        )}
        ⚙️ AI: Configurar Gamificação
      </Button>
    </div>
  );
}
