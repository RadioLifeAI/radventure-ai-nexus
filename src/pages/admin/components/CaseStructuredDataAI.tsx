
import React from "react";
import { Button } from "@/components/ui/button";
import { Database, Loader2 } from "lucide-react";
import { useCaseAutofillAPIExpanded } from "../hooks/useCaseAutofillAPIExpanded";
import { toast } from "@/components/ui/use-toast";

interface CaseStructuredDataAIProps {
  form: any;
  setForm: (form: any) => void;
  onFieldsUpdated?: (fields: string[]) => void;
  onSuggestionsGenerated?: (suggestions: any) => void;
  disabled?: boolean;
}

export function CaseStructuredDataAI({ 
  form, 
  setForm, 
  onFieldsUpdated,
  onSuggestionsGenerated,
  disabled = false
}: CaseStructuredDataAIProps) {
  const { autofillStructuredComplete, loading } = useCaseAutofillAPIExpanded();

  // Validação robusta do diagnóstico principal
  const hasPrimaryDiagnosis = React.useMemo(() => {
    const diagnosis = form.primary_diagnosis?.trim();
    const isValid = Boolean(diagnosis && diagnosis.length > 3);
    
    console.log('🔍 CaseStructuredDataAI - Validação diagnóstico:', {
      primary_diagnosis: form.primary_diagnosis,
      trimmed: diagnosis,
      length: diagnosis?.length,
      isValid
    });
    
    return isValid;
  }, [form.primary_diagnosis]);

  const handleAutofillStructuredComplete = async () => {
    try {
      console.log('🤖 CaseStructuredDataAI - Iniciando preenchimento de dados estruturados...');
      
      // VALIDAÇÃO OBRIGATÓRIA
      if (!hasPrimaryDiagnosis) {
        console.log('❌ CaseStructuredDataAI - Diagnóstico principal obrigatório');
        toast({ 
          title: "💡 Diagnóstico Principal Obrigatório", 
          description: "Preencha o diagnóstico principal primeiro para habilitar a AI de Dados Estruturados",
          variant: "destructive" 
        });
        return;
      }
      
      console.log('🔍 CaseStructuredDataAI - Estado inicial do form:', {
        primary_diagnosis: form.primary_diagnosis,
        differential_diagnoses: form.differential_diagnoses,
        anatomical_regions: form.anatomical_regions
      });
      
      const suggestions = await autofillStructuredComplete(form);
      
      if (!suggestions) {
        console.log('❌ CaseStructuredDataAI - Nenhuma sugestão recebida');
        toast({ 
          title: "Erro na AI de Dados Estruturados", 
          description: "Não foi possível gerar sugestões estruturadas.",
          variant: "destructive" 
        });
        return;
      }

      console.log('✅ CaseStructuredDataAI - Sugestões recebidas:', suggestions);

      // APLICAÇÃO DE SUGESTÕES ESTRUTURADAS DE FORMA ROBUSTA
      const updatedFields: string[] = [];
      const updates: any = {};

      // Campos estruturados principais com validação rigorosa
      const structuredFields = [
        'primary_diagnosis', 'secondary_diagnoses', 'case_classification', 'cid10_code',
        'anatomical_regions', 'finding_types', 'laterality', 'main_symptoms', 
        'vital_signs', 'medical_history', 'learning_objectives', 'pathology_types',
        'clinical_presentation_tags', 'case_complexity_factors', 'search_keywords',
        'structured_metadata', 'case_rarity', 'educational_value', 'clinical_relevance',
        'estimated_solve_time', 'target_audience', 'medical_subspecialty', 
        'exam_context', 'differential_diagnoses'
      ];

      structuredFields.forEach(field => {
        if (suggestions[field] !== undefined && suggestions[field] !== null) {
          // Validação especial para arrays
          if (Array.isArray(suggestions[field])) {
            if (suggestions[field].length > 0) {
              updates[field] = suggestions[field];
              updatedFields.push(field);
              console.log(`✅ CaseStructuredDataAI - Campo array ${field} atualizado:`, suggestions[field]);
            }
          } 
          // Validação especial para objetos
          else if (typeof suggestions[field] === 'object' && suggestions[field] !== null) {
            if (Object.keys(suggestions[field]).length > 0) {
              updates[field] = suggestions[field];
              updatedFields.push(field);
              console.log(`✅ CaseStructuredDataAI - Campo objeto ${field} atualizado:`, suggestions[field]);
            }
          }
          // Validação para strings e números
          else if (suggestions[field] !== '' && suggestions[field] !== 0) {
            updates[field] = suggestions[field];
            updatedFields.push(field);
            console.log(`✅ CaseStructuredDataAI - Campo ${field} atualizado:`, suggestions[field]);
          }
        }
      });

      if (Object.keys(updates).length > 0) {
        console.log('🔄 CaseStructuredDataAI - Aplicando updates:', updates);
        console.log('🔍 CaseStructuredDataAI - Form antes da atualização:', form);
        
        // CORREÇÃO CRÍTICA: Forçar atualização com callback robusto
        setForm((prevForm: any) => {
          const newForm = { ...prevForm, ...updates };
          console.log('✅ CaseStructuredDataAI - Form atualizado com sucesso!');
          console.log('🔍 CaseStructuredDataAI - Form anterior:', prevForm);
          console.log('🔍 CaseStructuredDataAI - Form novo:', newForm);
          console.log('🔍 CaseStructuredDataAI - Diferenças aplicadas:', updates);
          
          // Verificação de propagação após timeout
          setTimeout(() => {
            console.log('🔄 CaseStructuredDataAI - Verificação pós-atualização (após 100ms)');
          }, 100);
          
          return newForm;
        });
        
        // Notificar callbacks
        if (onFieldsUpdated) {
          onFieldsUpdated(updatedFields);
        }
        if (onSuggestionsGenerated) {
          onSuggestionsGenerated(suggestions);
        }
        
        toast({ 
          title: `🤖 AI: Dados Estruturados Preenchidos!`,
          description: `${updatedFields.length} campos estruturados atualizados incluindo diagnóstico principal e diferenciais.` 
        });
      } else {
        console.log('⚠️ CaseStructuredDataAI - Nenhum campo válido para atualizar');
        toast({ 
          title: "Dados insuficientes", 
          description: "Não foi possível determinar dados estruturados com as informações fornecidas."
        });
      }

    } catch (error) {
      console.error('💥 CaseStructuredDataAI - Erro:', error);
      toast({ 
        title: "Erro na AI de Dados Estruturados", 
        description: "Tente novamente ou verifique se há informações suficientes.",
        variant: "destructive" 
      });
    }
  };

  console.log('🎨 CaseStructuredDataAI - Renderizando botão com hasPrimaryDiagnosis:', hasPrimaryDiagnosis);

  return (
    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
      <Button
        type="button"
        onClick={handleAutofillStructuredComplete}
        disabled={loading || disabled || !hasPrimaryDiagnosis}
        variant="outline"
        size="sm"
        className={`${
          hasPrimaryDiagnosis 
            ? 'bg-green-500 text-white hover:bg-green-600 border-green-500' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
        }`}
        data-testid="ai-structured-data-button"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Database className="h-4 w-4 mr-2" />
        )}
        🤖 AI: Dados Estruturados
      </Button>
      
      <div className="text-xs text-green-700">
        <div>Preenche campos estruturados automaticamente:</div>
        <div className="font-medium">Diagnóstico • Diferenciais • Regiões Anatômicas • Metadados</div>
        {!hasPrimaryDiagnosis && (
          <div className="text-red-600 font-semibold mt-1">
            💡 Preencha o Diagnóstico Principal primeiro para habilitar a AI de Dados Estruturados
          </div>
        )}
        {hasPrimaryDiagnosis && (
          <div className="text-green-600 font-semibold mt-1">
            ✅ Use PRIMEIRO - Base para todos os outros botões AI
          </div>
        )}
      </div>
    </div>
  );
}
