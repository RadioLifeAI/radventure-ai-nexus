
import React from "react";
import { Button } from "@/components/ui/button";
import { Database, Loader2 } from "lucide-react";
import { useCaseAutofillAPIExpanded } from "../hooks/useCaseAutofillAPIExpanded";
import { toast } from "@/components/ui/use-toast";

interface CaseStructuredDataAIProps {
  form: any;
  setForm: (form: any) => void;
  onFieldsUpdated?: (fields: string[]) => void;
  disabled?: boolean;
}

export function CaseStructuredDataAI({ 
  form, 
  setForm, 
  onFieldsUpdated,
  disabled = false 
}: CaseStructuredDataAIProps) {
  const { autofillStructuredComplete, loading } = useCaseAutofillAPIExpanded();

  const handleAutofillStructuredData = async () => {
    try {
      console.log('🤖 Iniciando AI: Dados Estruturados...');
      
      const suggestions = await autofillStructuredComplete(form);
      
      if (!suggestions) {
        console.log('❌ Nenhuma sugestão recebida');
        return;
      }

      console.log('✅ Sugestões recebidas:', suggestions);

      // Aplicar sugestões ao formulário
      const updatedFields: string[] = [];
      const updates: any = {};

      // Mapeamento completo dos campos estruturados
      const fieldMappings = [
        'primary_diagnosis', 'secondary_diagnoses', 'case_classification', 'cid10_code',
        'anatomical_regions', 'finding_types', 'laterality', 'main_symptoms',
        'vital_signs', 'medical_history', 'learning_objectives', 'pathology_types',
        'clinical_presentation_tags', 'case_complexity_factors', 'search_keywords',
        'structured_metadata', 'case_rarity', 'educational_value', 'clinical_relevance',
        'estimated_solve_time', 'target_audience', 'medical_subspecialty', 'exam_context',
        'differential_diagnoses', 'similar_cases_ids'
      ];

      fieldMappings.forEach(field => {
        if (suggestions[field] !== undefined && suggestions[field] !== null) {
          updates[field] = suggestions[field];
          updatedFields.push(field);
        }
      });

      // VALIDAÇÃO ESPECÍFICA: Garantir 4 diagnósticos diferenciais
      if (suggestions.differential_diagnoses && Array.isArray(suggestions.differential_diagnoses)) {
        if (suggestions.differential_diagnoses.length !== 4) {
          console.warn(`⚠️ Esperados 4 diagnósticos diferenciais, recebidos ${suggestions.differential_diagnoses.length}`);
        }
        updates.differential_diagnoses = suggestions.differential_diagnoses.slice(0, 4); // Garantir máximo 4
        updatedFields.push('differential_diagnoses');
      }

      if (Object.keys(updates).length > 0) {
        setForm((prev: any) => ({ ...prev, ...updates }));
        onFieldsUpdated?.(updatedFields);
        
        const diffCount = updates.differential_diagnoses ? updates.differential_diagnoses.length : 0;
        toast({ 
          title: `🤖 AI: Dados Estruturados Preenchidos!`,
          description: `${updatedFields.length} campos atualizados incluindo ${diffCount} diagnósticos diferenciais.` 
        });
      } else {
        toast({ 
          title: "Nenhum campo estruturado para atualizar",
          description: "Os dados estruturados já estão completos ou não puderam ser determinados."
        });
      }

    } catch (error) {
      console.error('💥 Erro na AI de dados estruturados:', error);
      toast({ 
        title: "Erro na AI de Dados Estruturados", 
        description: "Tente novamente ou preencha o diagnóstico principal primeiro.",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
      <Button
        type="button"
        onClick={handleAutofillStructuredData}
        disabled={loading || disabled}
        variant="outline"
        size="sm"
        className="bg-cyan-500 text-white hover:bg-cyan-600 border-cyan-500"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Database className="h-4 w-4 mr-2" />
        )}
        🤖 AI: Dados Estruturados
      </Button>
      
      <div className="text-xs text-cyan-700">
        <div>Preenche TODOS os 20+ campos estruturados:</div>
        <div className="font-medium">Diagnósticos • 4 Diferenciais • Regiões • Sintomas • Tags</div>
      </div>
    </div>
  );
}
