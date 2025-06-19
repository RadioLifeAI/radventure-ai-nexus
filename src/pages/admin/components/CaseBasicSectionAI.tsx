
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

  // Validação mais flexível e com logs de debug
  const hasStructuredData = React.useMemo(() => {
    const hasPrimary = form.primary_diagnosis?.trim();
    const hasDifferentials = Array.isArray(form.differential_diagnoses) && form.differential_diagnoses.length >= 1;
    const hasAnatomical = Array.isArray(form.anatomical_regions) && form.anatomical_regions.length >= 1;
    
    console.log('🔍 DEBUG - Validação hasStructuredData:', {
      primary_diagnosis: form.primary_diagnosis,
      differential_diagnoses: form.differential_diagnoses,
      anatomical_regions: form.anatomical_regions,
      hasPrimary,
      hasDifferentials,
      hasAnatomical,
      finalResult: hasPrimary && hasDifferentials && hasAnatomical
    });
    
    return hasPrimary && hasDifferentials && hasAnatomical;
  }, [form.primary_diagnosis, form.differential_diagnoses, form.anatomical_regions]);

  const handleAutofillBasicComplete = async () => {
    try {
      console.log('🤖 Iniciando AI: Dados Básicos...');
      console.log('🔍 Estado do form ANTES da chamada:', JSON.stringify(form, null, 2));
      console.log('🔍 Tipo da função setForm:', typeof setForm);
      
      if (!hasStructuredData) {
        console.log('❌ Dados estruturados incompletos');
        toast({ 
          title: "Dados Estruturados Obrigatórios", 
          description: "Preencha primeiro: Diagnóstico Principal + Diagnósticos Diferenciais + Regiões Anatômicas",
          variant: "destructive" 
        });
        return;
      }
      
      console.log('✅ Dados estruturados válidos, chamando API...');
      
      const suggestions = await autofillBasicComplete(form);
      
      if (!suggestions) {
        console.log('❌ Nenhuma sugestão recebida da API');
        toast({ 
          title: "Erro na AI", 
          description: "Não foi possível gerar sugestões. Tente novamente.",
          variant: "destructive" 
        });
        return;
      }

      console.log('✅ Sugestões básicas recebidas:', suggestions);

      // CORREÇÃO PRINCIPAL: Aplicar sugestões ao formulário de forma mais robusta
      const updatedFields: string[] = [];
      const updates: any = {};

      // Mapeamento dos campos básicos
      const fieldMappings = [
        'category_id', 'difficulty_level', 'points', 'modality', 'subtype',
        'patient_age', 'patient_gender', 'symptoms_duration', 'findings', 'patient_clinical_info'
      ];

      fieldMappings.forEach(field => {
        if (suggestions[field] !== undefined && suggestions[field] !== null) {
          // Conversão específica para campos numéricos
          if (field === 'category_id' && typeof suggestions[field] === 'number') {
            updates[field] = suggestions[field];
          } else if (field === 'difficulty_level' && typeof suggestions[field] === 'number') {
            updates[field] = suggestions[field];
          } else if (field === 'points' && typeof suggestions[field] === 'number') {
            updates[field] = suggestions[field];
          } else {
            updates[field] = suggestions[field];
          }
          updatedFields.push(field);
        }
      });

      // GERAÇÃO AUTOMÁTICA DO TÍTULO
      if (updates.category_id && updates.modality && updates.difficulty_level) {
        const titleData = generateTitle(
          updates.category_id, 
          updates.modality, 
          updates.difficulty_level
        );
        updates.title = titleData.title;
        updates.case_number = titleData.case_number;
        updatedFields.push('title', 'case_number');
        
        console.log('📝 Título gerado automaticamente:', titleData.title);
      }

      if (Object.keys(updates).length > 0) {
        console.log('🔄 ANTES de atualizar - Estado atual do form:', JSON.stringify(form, null, 2));
        console.log('🔄 Updates que serão aplicados:', JSON.stringify(updates, null, 2));
        
        // CORREÇÃO CRÍTICA: Garantir atualização imutável e forçar re-render
        setForm((prevForm: any) => {
          const newForm = { ...prevForm, ...updates };
          console.log('🔄 DEPOIS de atualizar - Novo estado do form:', JSON.stringify(newForm, null, 2));
          return newForm;
        });
        
        // Notificar campos atualizados
        if (onFieldsUpdated && updatedFields.length > 0) {
          console.log('📢 Notificando campos atualizados:', updatedFields);
          onFieldsUpdated(updatedFields);
        }
        
        const titleMessage = updates.title ? ` | Título: "${updates.title}"` : '';
        
        toast({ 
          title: `🤖 AI: Dados Básicos Preenchidos!`,
          description: `${updatedFields.length} campos básicos atualizados incluindo categoria, dificuldade e modalidade${titleMessage}.` 
        });
        
        // Debug adicional: Verificar se os campos foram realmente atualizados na UI
        setTimeout(() => {
          console.log('🔍 Verificação pós-update (500ms depois):', {
            category_id: form.category_id,
            difficulty_level: form.difficulty_level,
            modality: form.modality,
            title: form.title
          });
        }, 500);
        
      } else {
        console.log('⚠️ Nenhum campo para atualizar');
        toast({ 
          title: "Nenhum campo básico para atualizar",
          description: "Os dados básicos já estão completos ou não puderam ser determinados."
        });
      }

    } catch (error) {
      console.error('💥 Erro na AI de dados básicos:', error);
      toast({ 
        title: "Erro na AI de Dados Básicos", 
        description: "Tente novamente ou preencha os dados estruturados primeiro.",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <Button
        type="button"
        onClick={handleAutofillBasicComplete}
        disabled={loading || disabled}
        variant="outline"
        size="sm"
        className={`${hasStructuredData ? 'bg-blue-500 text-white hover:bg-blue-600 border-blue-500' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
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
        <div className="font-medium">Categoria • Dificuldade • Modalidade • Demografia • Título Automático</div>
        {!hasStructuredData && (
          <div className="text-red-600 font-semibold mt-1">
            ⚠️ Preencha primeiro: Diagnóstico Principal + Diagnósticos Diferenciais + Regiões Anatômicas
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
