
import React from "react";
import { Button } from "@/components/ui/button";
import { Settings, Loader2 } from "lucide-react";
import { useCaseAutofillAPIExpanded } from "../hooks/useCaseAutofillAPIExpanded";
import { toast } from "@/components/ui/use-toast";

interface CaseAdvancedConfigAIProps {
  form: any;
  setForm: (form: any) => void;
  onFieldsUpdated?: (fields: string[]) => void;
  disabled?: boolean;
}

export function CaseAdvancedConfigAI({ 
  form, 
  setForm, 
  onFieldsUpdated,
  disabled = false 
}: CaseAdvancedConfigAIProps) {
  const { autofillAdvancedConfig, loading } = useCaseAutofillAPIExpanded();

  const handleAutofillAdvancedConfig = async () => {
    try {
      console.log('🤖 Iniciando AI: Config Inteligente...');
      
      const suggestions = await autofillAdvancedConfig(form);
      
      if (!suggestions) {
        console.log('❌ Nenhuma sugestão recebida');
        return;
      }

      console.log('✅ Sugestões recebidas:', suggestions);

      // Aplicar sugestões ao formulário
      const updatedFields: string[] = [];
      const updates: any = {};

      const configFields = [
        'can_skip', 'max_elimination', 'ai_hint_enabled', 'skip_penalty_points',
        'elimination_penalty_points', 'ai_tutor_level', 'achievement_triggers'
      ];

      configFields.forEach(field => {
        if (suggestions[field] !== undefined && suggestions[field] !== null) {
          updates[field] = suggestions[field];
          updatedFields.push(field);
        }
      });

      if (Object.keys(updates).length > 0) {
        setForm((prev: any) => ({ ...prev, ...updates }));
        onFieldsUpdated?.(updatedFields);
        
        toast({ 
          title: `🤖 AI: Config Inteligente Aplicada!`,
          description: `${updatedFields.length} configurações de gamificação otimizadas para o caso.` 
        });
      } else {
        toast({ 
          title: "Nenhuma configuração para otimizar",
          description: "As configurações já estão otimizadas ou não puderam ser determinadas."
        });
      }

    } catch (error) {
      console.error('💥 Erro na AI de config avançada:', error);
      toast({ 
        title: "Erro na AI de Config Inteligente", 
        description: "Tente novamente ou preencha o diagnóstico principal primeiro.",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
      <Button
        type="button"
        onClick={handleAutofillAdvancedConfig}
        disabled={loading || disabled}
        variant="outline"
        size="sm"
        className="bg-purple-500 text-white hover:bg-purple-600 border-purple-500"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Settings className="h-4 w-4 mr-2" />
        )}
        🤖 AI: Config Inteligente
      </Button>
      
      <div className="text-xs text-purple-700">
        <div>Otimiza configurações de gamificação:</div>
        <div className="font-medium">Eliminações • Penalidades • AI Tutor • Conquistas</div>
      </div>
    </div>
  );
}
