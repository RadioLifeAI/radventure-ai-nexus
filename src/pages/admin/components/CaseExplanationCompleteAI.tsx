
import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Loader2 } from "lucide-react";
import { useCaseAutofillAPIExpanded } from "../hooks/useCaseAutofillAPIExpanded";
import { toast } from "@/components/ui/use-toast";

interface CaseExplanationCompleteAIProps {
  form: any;
  setForm: (form: any) => void;
  onFieldsUpdated?: (fields: string[]) => void;
  disabled?: boolean;
}

export function CaseExplanationCompleteAI({ 
  form, 
  setForm, 
  onFieldsUpdated,
  disabled = false 
}: CaseExplanationCompleteAIProps) {
  const { autofillExplanationComplete, loading } = useCaseAutofillAPIExpanded();

  const handleAutofillExplanationComplete = async () => {
    try {
      console.log('🤖 Iniciando AI: Explicação e Feedback...');
      
      const suggestions = await autofillExplanationComplete(form);
      
      if (!suggestions) {
        console.log('❌ Nenhuma sugestão recebida');
        return;
      }

      console.log('✅ Sugestões recebidas:', suggestions);

      // Aplicar sugestões ao formulário
      const updatedFields: string[] = [];
      const updates: any = {};

      // CORREÇÃO: Lidar com estrutura de objeto na explicação
      if (suggestions.explanation) {
        let explanationText = "";
        
        if (typeof suggestions.explanation === 'string') {
          // Se já é string, usar diretamente
          explanationText = suggestions.explanation;
        } else if (typeof suggestions.explanation === 'object') {
          // Se é objeto, converter para texto estruturado
          const explanationObj = suggestions.explanation;
          const sections = [];
          
          // Processar cada seção do objeto
          Object.keys(explanationObj).forEach((key, index) => {
            const section = explanationObj[key];
            if (typeof section === 'object' && section.title && section.content) {
              sections.push(`**${section.title}**\n${section.content}`);
            } else if (typeof section === 'string') {
              sections.push(`**Seção ${index + 1}**\n${section}`);
            }
          });
          
          explanationText = sections.join('\n\n');
        }
        
        if (explanationText.trim()) {
          updates.explanation = explanationText;
          updatedFields.push('explanation');
        }
      }
      
      if (suggestions.manual_hint) {
        updates.manual_hint = suggestions.manual_hint;
        updatedFields.push('manual_hint');
      }

      if (Object.keys(updates).length > 0) {
        setForm((prev: any) => ({ ...prev, ...updates }));
        onFieldsUpdated?.(updatedFields);
        
        toast({ 
          title: `🤖 AI: Explicação e Feedback Gerados!`,
          description: `Explicação educacional detalhada e dica manual criadas com base no caso.` 
        });
      } else {
        toast({ 
          title: "Nenhuma explicação para gerar",
          description: "A explicação já está completa ou não pôde ser gerada."
        });
      }

    } catch (error) {
      console.error('💥 Erro na AI de explicação completa:', error);
      toast({ 
        title: "Erro na AI de Explicação e Feedback", 
        description: "Tente novamente ou preencha o diagnóstico principal primeiro.",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
      <Button
        type="button"
        onClick={handleAutofillExplanationComplete}
        disabled={loading || disabled}
        variant="outline"
        size="sm"
        className="bg-green-500 text-white hover:bg-green-600 border-green-500"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <BookOpen className="h-4 w-4 mr-2" />
        )}
        🤖 AI: Explicação e Feedback
      </Button>
      
      <div className="text-xs text-green-700">
        <div>Gera explicação educacional completa:</div>
        <div className="font-medium">Análise • Correlação • Diagnóstico Diferencial • Dicas</div>
      </div>
    </div>
  );
}
