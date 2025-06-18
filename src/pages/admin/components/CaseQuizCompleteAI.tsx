
import React from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle, Loader2 } from "lucide-react";
import { useCaseAutofillAPIExpanded } from "../hooks/useCaseAutofillAPIExpanded";
import { toast } from "@/components/ui/use-toast";

interface CaseQuizCompleteAIProps {
  form: any;
  setForm: (form: any) => void;
  onFieldsUpdated?: (fields: string[]) => void;
  disabled?: boolean;
}

export function CaseQuizCompleteAI({ 
  form, 
  setForm, 
  onFieldsUpdated,
  disabled = false 
}: CaseQuizCompleteAIProps) {
  const { autofillQuizComplete, loading } = useCaseAutofillAPIExpanded();

  const handleAutofillQuizComplete = async () => {
    try {
      console.log('🤖 Iniciando AI: Quiz Completo baseado em diagnósticos...');
      
      // Verificar se temos diagnóstico principal e diferenciais
      if (!form.primary_diagnosis) {
        toast({ 
          title: "Diagnóstico Principal Obrigatório", 
          description: "Preencha o diagnóstico principal primeiro. Use 'AI: Dados Estruturados' se necessário.",
          variant: "destructive" 
        });
        return;
      }

      const suggestions = await autofillQuizComplete(form);
      
      if (!suggestions) {
        console.log('❌ Nenhuma sugestão recebida');
        return;
      }

      console.log('✅ Sugestões recebidas:', suggestions);

      // Aplicar sugestões ao formulário
      const updatedFields: string[] = [];
      const updates: any = {};

      if (suggestions.main_question) {
        updates.main_question = suggestions.main_question;
        updatedFields.push('main_question');
      }
      
      if (suggestions.answer_options && Array.isArray(suggestions.answer_options)) {
        // Garantir que temos exatamente 4 alternativas
        if (suggestions.answer_options.length === 4) {
          updates.answer_options = suggestions.answer_options;
          updatedFields.push('answer_options');
        } else {
          console.warn(`⚠️ Esperadas 4 alternativas, recebidas ${suggestions.answer_options.length}`);
        }
      }
      
      if (suggestions.correct_answer_index !== undefined) {
        updates.correct_answer_index = suggestions.correct_answer_index;
        updatedFields.push('correct_answer_index');
      }
      
      if (suggestions.answer_feedbacks && Array.isArray(suggestions.answer_feedbacks)) {
        if (suggestions.answer_feedbacks.length === 4) {
          updates.answer_feedbacks = suggestions.answer_feedbacks;
          updatedFields.push('answer_feedbacks');
        }
      }
      
      if (suggestions.answer_short_tips && Array.isArray(suggestions.answer_short_tips)) {
        if (suggestions.answer_short_tips.length === 4) {
          updates.answer_short_tips = suggestions.answer_short_tips;
          updatedFields.push('answer_short_tips');
        }
      }

      if (Object.keys(updates).length > 0) {
        setForm((prev: any) => ({ ...prev, ...updates }));
        onFieldsUpdated?.(updatedFields);
        
        const diffCount = form.differential_diagnoses ? form.differential_diagnoses.length : 0;
        toast({ 
          title: `🤖 AI: Quiz Completo Gerado!`,
          description: `Quiz baseado no diagnóstico principal + ${diffCount} diagnósticos diferenciais.` 
        });
      } else {
        toast({ 
          title: "Nenhum quiz para gerar",
          description: "O quiz já está completo ou não pôde ser gerado. Verifique os diagnósticos."
        });
      }

    } catch (error) {
      console.error('💥 Erro na AI de quiz completo:', error);
      toast({ 
        title: "Erro na AI de Quiz Completo", 
        description: "Tente novamente ou preencha os diagnósticos primeiro.",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <Button
        type="button"
        onClick={handleAutofillQuizComplete}
        disabled={loading || disabled}
        variant="outline"
        size="sm"
        className="bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <HelpCircle className="h-4 w-4 mr-2" />
        )}
        🤖 AI: Quiz Completo
      </Button>
      
      <div className="text-xs text-yellow-700">
        <div>Gera quiz baseado nos diagnósticos:</div>
        <div className="font-medium">Principal + 3 Diferenciais • Pergunta • Feedbacks</div>
      </div>
    </div>
  );
}
