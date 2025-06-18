
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquareQuote, MessageCircle, Lightbulb, Loader2 } from "lucide-react";
import { useCaseAutofillAPI } from "../hooks/useCaseAutofillAPI";
import { toast } from "@/components/ui/use-toast";

interface CaseQuizContentAIProps {
  form: any;
  setForm: (updater: (prev: any) => any) => void;
  onFieldsHighlighted?: (fields: string[]) => void;
}

export function CaseQuizContentAI({ form, setForm, onFieldsHighlighted }: CaseQuizContentAIProps) {
  const { autofillQuizContent, loading } = useCaseAutofillAPI();

  const handleAutofillQuizContent = async () => {
    if (!form.primary_diagnosis && !form.findings) {
      toast({ 
        title: "Dados insuficientes", 
        description: "Preencha o diagnóstico principal ou achados para gerar conteúdo do quiz.",
        variant: "destructive"
      });
      return;
    }

    try {
      const suggestions = await autofillQuizContent(form);
      
      if (suggestions) {
        setForm((prev: any) => ({
          ...prev,
          main_question: suggestions.main_question || prev.main_question,
          answer_options: suggestions.answer_options || ["", "", "", ""],
          correct_answer_index: suggestions.correct_answer_index || 0,
          answer_feedbacks: suggestions.answer_feedbacks || ["", "", "", ""],
          answer_short_tips: suggestions.answer_short_tips || ["", "", "", ""]
        }));

        const highlightFields = [
          'main_question', 'answer_options', 'answer_feedbacks', 'answer_short_tips'
        ];
        
        onFieldsHighlighted?.(highlightFields);
        setTimeout(() => onFieldsHighlighted?.([]), 2000);

        toast({ 
          title: "✅ Conteúdo do quiz gerado!", 
          description: "Pergunta principal, alternativas e feedbacks criados automaticamente." 
        });
      }
    } catch (error) {
      console.error('Erro ao gerar conteúdo do quiz:', error);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAutofillQuizContent}
        disabled={loading}
        className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200 hover:from-teal-100 hover:to-cyan-100"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <MessageSquareQuote className="h-4 w-4 mr-2" />
        )}
        ❓ AI: Gerar Quiz Completo
      </Button>
    </div>
  );
}
