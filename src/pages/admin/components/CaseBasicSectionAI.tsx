
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

  const handleAutofillBasicSection = async () => {
    try {
      console.log('🤖 Iniciando AI: Dados Básicos Expandidos...');
      
      const suggestions = await autofillBasicComplete(form);
      
      if (!suggestions) {
        console.log('❌ Nenhuma sugestão recebida');
        return;
      }

      console.log('✅ Sugestões recebidas:', suggestions);

      // Aplicar sugestões ao formulário
      const updatedFields: string[] = [];
      const updates: any = {};

      // Campos básicos existentes
      if (suggestions.category_id) {
        updates.category_id = suggestions.category_id;
        updatedFields.push('category_id');
      }
      
      if (suggestions.difficulty_level) {
        updates.difficulty_level = suggestions.difficulty_level;
        updatedFields.push('difficulty_level');
      }
      
      if (suggestions.points) {
        updates.points = suggestions.points;
        updatedFields.push('points');
      }
      
      if (suggestions.modality) {
        updates.modality = suggestions.modality;
        updatedFields.push('modality');
      }
      
      if (suggestions.subtype) {
        updates.subtype = suggestions.subtype;
        updatedFields.push('subtype');
      }
      
      if (suggestions.patient_age) {
        updates.patient_age = suggestions.patient_age;
        updatedFields.push('patient_age');
      }
      
      if (suggestions.patient_gender) {
        updates.patient_gender = suggestions.patient_gender;
        updatedFields.push('patient_gender');
      }
      
      if (suggestions.symptoms_duration) {
        updates.symptoms_duration = suggestions.symptoms_duration;
        updatedFields.push('symptoms_duration');
      }

      // NOVOS CAMPOS: Achados radiológicos e resumo clínico
      if (suggestions.findings) {
        updates.findings = suggestions.findings;
        updatedFields.push('findings');
      }
      
      if (suggestions.patient_clinical_info) {
        updates.patient_clinical_info = suggestions.patient_clinical_info;
        updatedFields.push('patient_clinical_info');
      }

      if (Object.keys(updates).length > 0) {
        setForm((prev: any) => ({ ...prev, ...updates }));
        onFieldsUpdated?.(updatedFields);
        
        toast({ 
          title: `🤖 AI: Dados Básicos Expandidos!`,
          description: `${updatedFields.length} campos atualizados incluindo achados e resumo clínico.` 
        });
      } else {
        toast({ 
          title: "Nenhum campo para atualizar",
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
        onClick={handleAutofillBasicSection}
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
        <div>Analisa diagnóstico + contexto para sugerir:</div>
        <div className="font-medium">Categoria • Dificuldade • Modalidade • Demografia • Achados • Resumo</div>
      </div>
    </div>
  );
}
