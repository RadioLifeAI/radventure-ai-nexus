
import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Loader2, Shuffle } from "lucide-react";
import { useCaseAutofillAPIExpanded } from "../hooks/useCaseAutofillAPIExpanded";
import { shuffleAlternativesWithFeedback } from "../hooks/shuffleUtils";
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

    if (!form.differential_diagnoses || form.differential_diagnoses.length < 4) {
      toast({ 
        title: "Diagnósticos Diferenciais Incompletos", 
        description: "Execute 'AI: Dados Estruturados' primeiro para gerar 4 diagnósticos diferenciais.",
        variant: "destructive" 
      });
      return false;
    }

    if (!form.category_id || !form.difficulty_level || !form.modality) {
      toast({ 
        title: "Dados Básicos Incompletos", 
        description: "Execute 'AI: Dados Básicos' primeiro para definir categoria, dificuldade e modalidade.",
        variant: "destructive" 
      });
      return false;
    }

    return true;
  };

  const handleAutofillQuizComplete = async () => {
    try {
      console.log('🤖 Iniciando AI: Quiz Inteligente...');
      
      // Verificar pré-requisitos
      if (!checkPrerequisites()) {
        return;
      }
      
      const suggestions = await autofillQuizComplete(form);
      
      if (!suggestions) {
        console.log('❌ Nenhuma sugestão recebida');
        return;
      }

      console.log('✅ Sugestões de quiz recebidas:', suggestions);

      // Aplicar sugestões ao formulário
      const updatedFields: string[] = [];
      const updates: any = {};

      // Mapeamento dos campos do quiz
      const quizFields = [
        'main_question', 'answer_options', 'correct_answer_index', 
        'answer_feedbacks', 'answer_short_tips'
      ];

      quizFields.forEach(field => {
        if (suggestions[field] !== undefined && suggestions[field] !== null) {
          updates[field] = suggestions[field];
          updatedFields.push(field);
        }
      });

      // EMBARALHAR AUTOMATICAMENTE APÓS GERAR O QUIZ
      if (updates.answer_options && Array.isArray(updates.answer_options) && updates.answer_options.length === 4) {
        const shuffled = shuffleAlternativesWithFeedback(
          updates.answer_options,
          updates.answer_feedbacks || [],
          updates.answer_short_tips || [],
          updates.correct_answer_index || 0
        );
        
        updates.answer_options = shuffled.options;
        updates.answer_feedbacks = shuffled.feedbacks;
        updates.answer_short_tips = shuffled.tips;
        updates.correct_answer_index = shuffled.correctIdx;
        
        console.log('🔀 Quiz embaralhado automaticamente após geração');
      }

      if (Object.keys(updates).length > 0) {
        setForm((prev: any) => ({ ...prev, ...updates }));
        onFieldsUpdated?.(updatedFields);
        
        const optionsCount = updates.answer_options ? updates.answer_options.length : 0;
        toast({ 
          title: `🤖 AI: Quiz Inteligente Gerado!`,
          description: `Quiz completo com ${optionsCount} alternativas geradas e embaralhadas automaticamente.` 
        });
      } else {
        toast({ 
          title: "Nenhum campo de quiz para atualizar",
          description: "O quiz já está completo ou não pôde ser determinado."
        });
      }

    } catch (error) {
      console.error('💥 Erro na AI de quiz:', error);
      toast({ 
        title: "Erro na AI de Quiz Inteligente", 
        description: "Tente novamente ou verifique se as etapas anteriores foram concluídas.",
        variant: "destructive" 
      });
    }
  };

  const handleShuffleQuiz = () => {
    if (!form.answer_options || form.answer_options.length !== 4) {
      toast({
        title: "Quiz Incompleto",
        description: "Preencha todas as 4 alternativas antes de embaralhar.",
        variant: "destructive"
      });
      return;
    }

    const shuffled = shuffleAlternativesWithFeedback(
      form.answer_options,
      form.answer_feedbacks || [],
      form.answer_short_tips || [],
      form.correct_answer_index || 0
    );

    setForm((prev: any) => ({
      ...prev,
      answer_options: shuffled.options,
      answer_feedbacks: shuffled.feedbacks,
      answer_short_tips: shuffled.tips,
      correct_answer_index: shuffled.correctIdx,
    }));

    toast({
      title: "🔀 Quiz Embaralhado!",
      description: "Alternativas reorganizadas mantendo a integridade dos feedbacks."
    });
  };

  // Verificar se pode usar o Quiz AI
  const canUseQuizAI = form.primary_diagnosis?.trim() && 
                       form.differential_diagnoses?.length >= 4 &&
                       form.category_id && form.difficulty_level && form.modality;

  return (
    <div className="space-y-3">
      {/* Botão Principal AI Quiz */}
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <Button
          type="button"
          onClick={handleAutofillQuizComplete}
          disabled={loading || disabled || !canUseQuizAI}
          variant="outline"
          size="sm"
          className="bg-green-500 text-white hover:bg-green-600 border-green-500 disabled:bg-gray-400"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <BookOpen className="h-4 w-4 mr-2" />
          )}
          🤖 AI: Quiz Inteligente
        </Button>
        
        <div className="text-xs text-green-700">
          <div>Gera quiz baseado no diagnóstico:</div>
          <div className="font-medium">Pergunta • 4 Alternativas • Feedbacks • Embaralha</div>
          {!canUseQuizAI && (
            <div className="text-red-600 font-medium">⚠️ Complete: Diagnóstico → Estruturados → Básicos</div>
          )}
        </div>
      </div>

      {/* Botão Separado para Embaralhar */}
      <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
        <Button
          type="button"
          onClick={handleShuffleQuiz}
          disabled={!form.answer_options || form.answer_options.length !== 4}
          variant="outline"
          size="sm"
          className="bg-orange-500 text-white hover:bg-orange-600 border-orange-500"
        >
          <Shuffle className="h-4 w-4 mr-2" />
          🔀 Embaralhar Quiz
        </Button>
        
        <div className="text-xs text-orange-700">
          Reorganiza alternativas mantendo feedbacks corretos
        </div>
      </div>
    </div>
  );
}
