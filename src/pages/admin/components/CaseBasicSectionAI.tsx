
import React from "react";
import { Button } from "@/components/ui/button";
import { Brain, Loader2 } from "lucide-react";
import { useCaseAutofillAPIExpanded } from "../hooks/useCaseAutofillAPIExpanded";
import { toast } from "@/components/ui/use-toast";

interface CaseBasicSectionAIProps {
  form: any;
  setForm: (form: any) => void;
  onFieldsUpdated?: (fields: string[]) => void;
  disabled?: boolean;
}

export function CaseBasicSectionAI({ 
  form, 
  setForm, 
  onFieldsUpdated,
  disabled = false 
}: CaseBasicSectionAIProps) {
  const { autofillBasicComplete, loading } = useCaseAutofillAPIExpanded();

  const handleAutofillBasicComplete = async () => {
    try {
      console.log('🤖 Iniciando AI: Dados Básicos...');
      
      // Verificar se temos diagnóstico principal
      if (!form.primary_diagnosis?.trim()) {
        toast({ 
          title: "Diagnóstico Principal Obrigatório", 
          description: "Preencha o diagnóstico principal primeiro para gerar dados básicos.",
          variant: "destructive" 
        });
        return;
      }
      
      const suggestions = await autofillBasicComplete(form);
      
      if (!suggestions) {
        console.log('❌ Nenhuma sugestão recebida');
        return;
      }

      console.log('✅ Sugestões básicas recebidas:', suggestions);

      // Aplicar sugestões ao formulário
      const updatedFields: string[] = [];
      const updates: any = {};

      // Mapeamento dos campos básicos com correção de tipos
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

      if (Object.keys(updates).length > 0) {
        setForm((prev: any) => ({ ...prev, ...updates }));
        onFieldsUpdated?.(updatedFields);
        
        toast({ 
          title: `🤖 AI: Dados Básicos Preenchidos!`,
          description: `${updatedFields.length} campos básicos atualizados incluindo categoria, dificuldade e modalidade.` 
        });
      } else {
        toast({ 
          title: "Nenhum campo básico para atualizar",
          description: "Os dados básicos já estão completos ou não puderam ser determinados."
        });
      }

    } catch (error) {
      console.error('💥 Erro na AI de dados básicos:', error);
      toast({ 
        title: "Erro na AI de Dados Básicos", 
        description: "Tente novamente ou preencha o diagnóstico principal primeiro.",
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
        className="bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
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
        <div className="font-medium">Categoria • Dificuldade • Modalidade • Demografia • Achados</div>
      </div>
    </div>
  );
}
