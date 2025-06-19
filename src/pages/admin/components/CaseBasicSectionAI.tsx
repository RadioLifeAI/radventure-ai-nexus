
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
  const { autofillBasicComplete, autofillMasterComplete, loading } = useCaseAutofillAPIExpanded();
  const { generateTitle } = useCaseTitleGenerator(categories);

  // CORREÇÃO: Validação simplificada - apenas diagnóstico principal
  const hasPrimaryDiagnosis = React.useMemo(() => {
    const diagnosis = form.primary_diagnosis?.trim();
    const isValid = Boolean(diagnosis && diagnosis.length > 3);
    
    console.log('🔍 CaseBasicSectionAI - Validação simplificada (apenas diagnóstico):', {
      primary_diagnosis: form.primary_diagnosis,
      trimmed: diagnosis,
      length: diagnosis?.length,
      isValid
    });
    
    return isValid;
  }, [form.primary_diagnosis]);

  const handleAutofillBasicComplete = async () => {
    try {
      console.log('🤖 CaseBasicSectionAI - Iniciando preenchimento de dados básicos...');
      console.log('🔍 CaseBasicSectionAI - Estado atual do form:', form);
      
      if (!hasPrimaryDiagnosis) {
        console.log('❌ CaseBasicSectionAI - Diagnóstico principal obrigatório');
        toast({ 
          title: "Diagnóstico Principal Obrigatório", 
          description: "Preencha o diagnóstico principal primeiro para usar a AI de Dados Básicos",
          variant: "destructive" 
        });
        return;
      }
      
      console.log('✅ CaseBasicSectionAI - Diagnóstico válido, tentando API básica...');
      
      // TENTATIVA 1: Usar API básica específica
      let suggestions = await autofillBasicComplete(form);
      
      // MODO DE RECUPERAÇÃO: Se falhar, usar master AI e filtrar dados básicos
      if (!suggestions || Object.keys(suggestions).length === 0) {
        console.log('⚠️ CaseBasicSectionAI - API básica falhou, tentando modo de recuperação com Master AI...');
        
        const masterSuggestions = await autofillMasterComplete(form);
        
        if (masterSuggestions) {
          // Filtrar apenas campos básicos do resultado completo
          const basicFields = [
            'category_id', 'difficulty_level', 'points', 'modality', 'subtype',
            'patient_age', 'patient_gender', 'symptoms_duration', 'findings', 
            'patient_clinical_info'
          ];
          
          suggestions = {};
          basicFields.forEach(field => {
            if (masterSuggestions[field] !== undefined) {
              suggestions[field] = masterSuggestions[field];
            }
          });
          
          console.log('🔄 CaseBasicSectionAI - Usando dados filtrados do Master AI:', suggestions);
        }
      }
      
      if (!suggestions || Object.keys(suggestions).length === 0) {
        console.log('❌ CaseBasicSectionAI - Nenhuma sugestão recebida em ambas as tentativas');
        toast({ 
          title: "Erro na AI de Dados Básicos", 
          description: "Não foi possível gerar sugestões. Tente o botão 'AI preencher tudo' como alternativa.",
          variant: "destructive" 
        });
        return;
      }

      console.log('✅ CaseBasicSectionAI - Sugestões finais recebidas:', suggestions);

      // APLICAÇÃO ROBUSTA DAS SUGESTÕES
      const updatedFields: string[] = [];
      const updates: any = {};

      // Campos básicos com validação de tipo e logs detalhados
      const basicFieldsConfig = [
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

      basicFieldsConfig.forEach(({ field, type }) => {
        if (suggestions[field] !== undefined && suggestions[field] !== null && suggestions[field] !== '') {
          let value = suggestions[field];
          
          // Conversão de tipos quando necessário
          if (type === 'number' && typeof value !== 'number') {
            const numValue = parseInt(value);
            if (!isNaN(numValue)) {
              value = numValue;
            }
          }
          
          updates[field] = value;
          updatedFields.push(field);
          console.log(`✅ CaseBasicSectionAI - Campo ${field} será atualizado de "${form[field]}" para "${value}"`);
        } else {
          console.log(`⚠️ CaseBasicSectionAI - Campo ${field} ignorado: valor inválido "${suggestions[field]}"`);
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
        console.log('🔄 CaseBasicSectionAI - Form antes da atualização:', form);
        
        // CORREÇÃO CRÍTICA: Garantir atualização imutável com callback e logs
        setForm((prevForm: any) => {
          const newForm = { ...prevForm, ...updates };
          console.log('✅ CaseBasicSectionAI - Form atualizado com sucesso!');
          console.log('🔍 CaseBasicSectionAI - Form anterior:', prevForm);
          console.log('🔍 CaseBasicSectionAI - Form novo:', newForm);
          console.log('🔍 CaseBasicSectionAI - Diferenças aplicadas:', updates);
          
          // Verificação de propagação após timeout
          setTimeout(() => {
            console.log('🔄 CaseBasicSectionAI - Verificação pós-atualização (após 100ms)');
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
        console.log('⚠️ CaseBasicSectionAI - Nenhum campo válido para atualizar');
        toast({ 
          title: "Dados insuficientes",
          description: "Não foi possível determinar os dados básicos com as informações fornecidas."
        });
      }

    } catch (error) {
      console.error('💥 CaseBasicSectionAI - Erro geral:', error);
      toast({ 
        title: "Erro na AI de Dados Básicos", 
        description: "Tente novamente ou use o botão 'AI preencher tudo' como alternativa.",
        variant: "destructive" 
      });
    }
  };

  console.log('🎨 CaseBasicSectionAI - Renderizando com hasPrimaryDiagnosis:', hasPrimaryDiagnosis);

  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <Button
        type="button"
        onClick={handleAutofillBasicComplete}
        disabled={loading || disabled || !hasPrimaryDiagnosis}
        variant="outline"
        size="sm"
        className={`${
          hasPrimaryDiagnosis 
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
        {!hasPrimaryDiagnosis && (
          <div className="text-red-600 font-semibold mt-1">
            💡 Preencha o Diagnóstico Principal primeiro para habilitar a AI de Dados Básicos
          </div>
        )}
        {hasPrimaryDiagnosis && (
          <div className="text-green-600 font-semibold mt-1">
            ✅ Diagnóstico preenchido - Pronto para usar! (Modo de recuperação ativo)
          </div>
        )}
      </div>
    </div>
  );
}
