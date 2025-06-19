
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

  // Verificar se as etapas anteriores foram concluídas
  const checkPrerequisites = () => {
    if (!form.primary_diagnosis?.trim()) {
      toast({ 
        title: "Diagnóstico Principal Obrigatório", 
        description: "Preencha o diagnóstico principal primeiro.",
        variant: "destructive" 
      });
      return false;
    }

    if (!form.main_question || !form.answer_options || form.answer_options.length < 4) {
      toast({ 
        title: "Quiz Incompleto", 
        description: "Execute 'AI: Quiz Inteligente' primeiro para gerar pergunta e alternativas.",
        variant: "destructive" 
      });
      return false;
    }

    if (!form.findings || !form.patient_clinical_info) {
      toast({ 
        title: "Achados e Info Clínica Incompletos", 
        description: "Execute 'AI: Dados Básicos' primeiro para gerar achados e informações clínicas.",
        variant: "destructive" 
      });
      return false;
    }

    return true;
  };

  const handleAutofillExplanationComplete = async () => {
    try {
      console.log('🤖 Iniciando AI: Explicação e Feedback...');
      
      // Verificar pré-requisitos
      if (!checkPrerequisites()) {
        return;
      }
      
      const suggestions = await autofillExplanationComplete(form);
      
      if (!suggestions) {
        console.log('❌ Nenhuma sugestão recebida');
        return;
      }

      console.log('✅ Sugestões recebidas:', suggestions);

      // Aplicar sugestões ao formulário
      const updatedFields: string[] = [];
      const updates: any = {};

      // CORREÇÃO: Garantir que explanation seja sempre string
      if (suggestions.explanation) {
        // Se é string, usar diretamente
        if (typeof suggestions.explanation === 'string') {
          updates.explanation = suggestions.explanation;
          updatedFields.push('explanation');
        } 
        // Se é objeto, converter para texto estruturado
        else if (typeof suggestions.explanation === 'object') {
          const explanationObj = suggestions.explanation;
          const sections = [];
          
          Object.keys(explanationObj).forEach((key, index) => {
            const section = explanationObj[key];
            if (typeof section === 'object' && section.title && section.content) {
              sections.push(`**${section.title}**\n${section.content}`);
            } else if (typeof section === 'string') {
              sections.push(`**Seção ${index + 1}**\n${section}`);
            }
          });
          
          if (sections.length > 0) {
            updates.explanation = sections.join('\n\n');
            updatedFields.push('explanation');
          }
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
        description: "Tente novamente ou verifique se as etapas anteriores foram concluídas.",
        variant: "destructive" 
      });
    }
  };

  // Verificar se pode usar o Explanation AI
  const canUseExplanationAI = form.primary_diagnosis?.trim() && 
                              form.main_question && 
                              form.answer_options?.length >= 4 &&
                              form.findings && 
                              form.patient_clinical_info;

  return (
    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
      <Button
        type="button"
        onClick={handleAutofillExplanationComplete}
        disabled={loading || disabled || !canUseExplanationAI}
        variant="outline"
        size="sm"
        className="bg-green-500 text-white hover:bg-green-600 border-green-500 disabled:bg-gray-400"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <BookOpen className="h-4 w-4 mr-2" />
        )}
        🤖 AI: Explicação Completa
      </Button>
      
      <div className="text-xs text-green-700">
        <div>Gera explicação educacional baseada no caso:</div>
        <div className="font-medium">Análise • Correlação • Diagnóstico Diferencial • Dicas</div>
        {!canUseExplanationAI && (
          <div className="text-red-600 font-medium">⚠️ Complete: Diagnóstico → Estruturados → Básicos → Quiz</div>
        )}
      </div>
    </div>
  );
}
