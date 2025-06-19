
import React from "react";
import { Button } from "@/components/ui/button";
import { Brain, Loader2 } from "lucide-react";
import { useCaseAutofillAPIExpanded } from "../hooks/useCaseAutofillAPIExpanded";
import { useCaseTitleGenerator } from "../hooks/useCaseTitleGenerator";
import { toast } from "@/components/ui/use-toast";

interface CaseBasicSectionAIProps {
  form: any;
  setForm: (form: any) => void;
  onFieldsUpdated?: (fields: string[]) => void;
  disabled?: boolean;
  categories?: { id: number; name: string }[];
}

export function CaseBasicSectionAI({ 
  form, 
  setForm, 
  onFieldsUpdated,
  disabled = false,
  categories = []
}: CaseBasicSectionAIProps) {
  const { autofillBasicComplete, loading } = useCaseAutofillAPIExpanded();
  const { generateTitle } = useCaseTitleGenerator(categories);

  // CORREÇÃO: Validação mais rigorosa e com logs detalhados
  const hasStructuredData = React.useMemo(() => {
    console.log('🔍 CaseBasicSectionAI - Validando dados estruturados:', {
      primary_diagnosis: form.primary_diagnosis,
      differential_diagnoses: form.differential_diagnoses,
      anatomical_regions: form.anatomical_regions,
      primary_diagnosis_length: form.primary_diagnosis?.trim()?.length,
      differential_diagnoses_length: Array.isArray(form.differential_diagnoses) ? form.differential_diagnoses.length : 0,
      anatomical_regions_length: Array.isArray(form.anatomical_regions) ? form.anatomical_regions.length : 0
    });

    const hasPrimary = Boolean(form.primary_diagnosis?.trim() && form.primary_diagnosis.trim().length > 3);
    const hasDifferentials = Array.isArray(form.differential_diagnoses) && form.differential_diagnoses.length >= 1;
    const hasAnatomical = Array.isArray(form.anatomical_regions) && form.anatomical_regions.length >= 1;
    
    const result = hasPrimary && hasDifferentials && hasAnatomical;
    
    console.log('🔍 CaseBasicSectionAI - Resultado da validação:', {
      hasPrimary,
      hasDifferentials,
      hasAnatomical,
      finalResult: result
    });
    
    return result;
  }, [form.primary_diagnosis, form.differential_diagnoses, form.anatomical_regions]);

  const handleAutofillBasicComplete = async () => {
    try {
      console.log('🤖 CaseBasicSectionAI - Iniciando preenchimento de dados básicos...');
      console.log('🔍 CaseBasicSectionAI - Estado atual do form:', {
        primary_diagnosis: form.primary_diagnosis,
        differential_diagnoses: form.differential_diagnoses,
        anatomical_regions: form.anatomical_regions,
        category_id: form.category_id,
        difficulty_level: form.difficulty_level,
        modality: form.modality
      });
      
      if (!hasStructuredData) {
        console.log('❌ CaseBasicSectionAI - Dados estruturados incompletos');
        toast({ 
          title: "Dados Estruturados Obrigatórios", 
          description: "Use primeiro o botão 'AI: Dados Estruturados' para preencher: Diagnóstico Principal + Diagnósticos Diferenciais + Regiões Anatômicas",
          variant: "destructive" 
        });
        return;
      }
      
      console.log('✅ CaseBasicSectionAI - Dados estruturados válidos, chamando API...');
      
      const suggestions = await autofillBasicComplete(form);
      
      if (!suggestions) {
        console.log('❌ CaseBasicSectionAI - Nenhuma sugestão recebida da API');
        toast({ 
          title: "Erro na AI", 
          description: "Não foi possível gerar sugestões. Tente novamente.",
          variant: "destructive" 
        });
        return;
      }

      console.log('✅ CaseBasicSectionAI - Sugestões recebidas:', suggestions);

      // CORREÇÃO: Aplicar sugestões de forma mais robusta com validação
      const updatedFields: string[] = [];
      const updates: any = {};

      // Campos básicos com validação de tipo
      const basicFields = [
        { field: 'category_id', type: 'number' },
        { field: 'difficulty_level', type: 'number' },
        { field: 'points', type: 'number' },
        { field: 'modality', type: 'string' },
        { field: 'subtype', type: 'string' },
        { field: 'patient_age', type: 'string' },
        { field: 'patient_gender', type: 'string' },
        { field: 'symptoms_duration', type: 'string' },
        { field: 'findings', type: 'string' },
        { field: 'patient_clinical_info', type: 'string' }
      ];

      basicFields.forEach(({ field, type }) => {
        if (suggestions[field] !== undefined && suggestions[field] !== null && suggestions[field] !== '') {
          let value = suggestions[field];
          
          // Conversão de tipos quando necessário
          if (type === 'number' && typeof value !== 'number') {
            value = parseInt(value) || value;
          }
          
          updates[field] = value;
          updatedFields.push(field);
          console.log(`✅ CaseBasicSectionAI - Campo ${field} será atualizado:`, value);
        }
      });

      // GERAÇÃO AUTOMÁTICA DO TÍTULO
      if (updates.category_id && updates.modality && updates.difficulty_level) {
        try {
          const titleData = generateTitle(
            Number(updates.category_id), 
            updates.modality, 
            Number(updates.difficulty_level)
          );
          updates.title = titleData.title;
          updates.case_number = titleData.case_number;
          updatedFields.push('title', 'case_number');
          
          console.log('📝 CaseBasicSectionAI - Título gerado:', titleData);
        } catch (error) {
          console.error('❌ CaseBasicSectionAI - Erro ao gerar título:', error);
        }
      }

      if (Object.keys(updates).length > 0) {
        console.log('🔄 CaseBasicSectionAI - Aplicando updates:', updates);
        
        // CORREÇÃO CRÍTICA: Garantir atualização imutável correta com callback
        setForm((prevForm: any) => {
          const newForm = { ...prevForm, ...updates };
          console.log('🔄 CaseBasicSectionAI - Form atualizado de:', prevForm);
          console.log('🔄 CaseBasicSectionAI - Form atualizado para:', newForm);
          
          // Forçar re-render após timeout para garantir propagação
          setTimeout(() => {
            console.log('🔄 CaseBasicSectionAI - Estado final após timeout:', newForm);
          }, 100);
          
          return newForm;
        });
        
        // Notificar campos atualizados
        if (onFieldsUpdated && updatedFields.length > 0) {
          console.log('📢 CaseBasicSectionAI - Notificando campos atualizados:', updatedFields);
          onFieldsUpdated(updatedFields);
        }
        
        const titleMessage = updates.title ? ` | Título: "${updates.title}"` : '';
        
        toast({ 
          title: `🤖 AI: Dados Básicos Preenchidos!`,
          description: `${updatedFields.length} campos atualizados: categoria, dificuldade, modalidade${titleMessage}.` 
        });
        
      } else {
        console.log('⚠️ CaseBasicSectionAI - Nenhum campo para atualizar');
        toast({ 
          title: "Dados já preenchidos",
          description: "Os dados básicos já estão completos ou não puderam ser determinados."
        });
      }

    } catch (error) {
      console.error('💥 CaseBasicSectionAI - Erro:', error);
      toast({ 
        title: "Erro na AI de Dados Básicos", 
        description: "Tente novamente ou preencha os dados estruturados primeiro.",
        variant: "destructive" 
      });
    }
  };

  console.log('🎨 CaseBasicSectionAI - Renderizando com hasStructuredData:', hasStructuredData);

  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <Button
        type="button"
        onClick={handleAutofillBasicComplete}
        disabled={loading || disabled || !hasStructuredData}
        variant="outline"
        size="sm"
        className={`${
          hasStructuredData 
            ? 'bg-blue-500 text-white hover:bg-blue-600 border-blue-500' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
        }`}
        data-testid="ai-basic-data-button"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Brain className="h-4 w-4 mr-2" />
        )}
        🤖 AI: Dados Básicos
      </Button>
      
      <div className="text-xs text-blue-700">
        <div>Preenche dados fundamentais do caso:</div>
        <div className="font-medium">Categoria • Dificuldade • Modalidade • Demografia • Título</div>
        {!hasStructuredData && (
          <div className="text-red-600 font-semibold mt-1">
            ⚠️ Use primeiro 'AI: Dados Estruturados' - Diagnóstico Principal + Diagnósticos Diferenciais + Regiões Anatômicas
          </div>
        )}
        {hasStructuredData && (
          <div className="text-green-600 font-semibold mt-1">
            ✅ Dados estruturados completos - Pronto para usar!
          </div>
        )}
      </div>
    </div>
  );
}
