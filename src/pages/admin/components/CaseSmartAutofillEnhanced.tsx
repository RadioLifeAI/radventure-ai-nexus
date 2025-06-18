
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wand2, 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb,
  Loader2,
  Sparkles,
  Target,
  MapPin
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDataIdMappings } from "@/hooks/useDataIdMappings";

type Props = {
  form: any;
  setForm: (updater: (prev: any) => any) => void;
  onFieldsUpdated?: (fields: string[]) => void;
};

export function CaseSmartAutofillEnhanced({ form, setForm, onFieldsUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const mappings = useDataIdMappings();

  const callAutofillAPI = async (action: string, templateType?: string) => {
    setLoading(true);
    setLastAction(action);
    
    try {
      const { data, error } = await supabase.functions.invoke('case-autofill', {
        body: { 
          caseData: form, 
          action,
          templateType 
        }
      });

      if (error) throw error;

      setSuggestions(data.suggestions);
      return data.suggestions;
    } catch (error: any) {
      console.error('Erro no auto-preenchimento:', error);
      toast({ 
        title: "Erro no auto-preenchimento", 
        description: error.message,
        variant: "destructive" 
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const convertAndApplySuggestions = (rawSuggestions: any) => {
    if (!rawSuggestions || mappings.isLoading) return {};

    const convertedData: any = {};
    const appliedFields: string[] = [];

    // Mapear campos básicos
    Object.entries(rawSuggestions).forEach(([field, value]) => {
      switch (field) {
        case 'category_id':
          if (typeof value === 'string') {
            const id = mappings.specialtyNameToId(value);
            if (id) {
              convertedData.category_id = id;
              appliedFields.push('category_id');
            }
          }
          break;
          
        case 'difficulty_level':
          if (typeof value === 'string' || typeof value === 'number') {
            const level = typeof value === 'string' ? 
              parseInt(value.match(/\d+/)?.[0] || '0') : value;
            const id = mappings.difficultyLevelToId(level);
            if (id) {
              convertedData.difficulty_level = level;
              appliedFields.push('difficulty_level');
            }
          }
          break;
          
        case 'modality':
          if (typeof value === 'string') {
            const id = mappings.modalityNameToId(value);
            if (id) {
              convertedData.modality = value;
              appliedFields.push('modality');
            }
          }
          break;
          
        case 'subtype':
          if (typeof value === 'string' && convertedData.modality) {
            const id = mappings.subtypeNameToId(value, convertedData.modality);
            if (id) {
              convertedData.subtype = value;
              appliedFields.push('subtype');
            }
          }
          break;
          
        default:
          // Aplicar outros campos diretamente
          convertedData[field] = value;
          appliedFields.push(field);
      }
    });

    return { convertedData, appliedFields };
  };

  const handleSmartAutofill = async () => {
    const result = await callAutofillAPI('smart_autofill');
    if (result?.autofill_data) {
      const { convertedData, appliedFields } = convertAndApplySuggestions(result.autofill_data);
      
      if (Object.keys(convertedData).length > 0) {
        setForm((prev: any) => ({ ...prev, ...convertedData }));
        onFieldsUpdated?.(appliedFields);
        toast({ 
          title: `${appliedFields.length} campos preenchidos automaticamente!`,
          description: `Campos aplicados: ${appliedFields.join(', ')}`
        });
      } else {
        toast({ 
          title: "Nenhum campo pôde ser aplicado",
          description: "Os dados retornados não são compatíveis com o formulário",
          variant: "destructive"
        });
      }
    }
  };

  const handleTemplateAutofill = async (templateType: string) => {
    const result = await callAutofillAPI('template_autofill', templateType);
    if (result) {
      const { convertedData, appliedFields } = convertAndApplySuggestions(result);
      
      if (Object.keys(convertedData).length > 0) {
        setForm((prev: any) => ({ ...prev, ...convertedData }));  
        onFieldsUpdated?.(appliedFields);
        toast({ 
          title: `Template ${templateType} aplicado!`,
          description: `${appliedFields.length} campos preenchidos`
        });
      }
    }
  };

  const handleFieldCompletion = async () => {
    const result = await callAutofillAPI('field_completion');
    if (result?.completed_fields) {
      const { convertedData, appliedFields } = convertAndApplySuggestions(result.completed_fields);
      
      if (Object.keys(convertedData).length > 0) {
        setForm((prev: any) => ({ ...prev, ...convertedData }));
        onFieldsUpdated?.(appliedFields);
        toast({ title: `${appliedFields.length} campos completados!` });
      }
    }
  };

  const handleConsistencyCheck = async () => {
    const result = await callAutofillAPI('consistency_check');
    if (result) {
      setSuggestions(result);
      toast({ 
        title: `Análise de consistência concluída`, 
        description: `Score: ${result.consistency_score || 0}%` 
      });
    }
  };

  const applyAutoSuggestion = (field: string, value: any) => {
    // Aplicar conversões específicas para campos que precisam de ID
    let convertedValue = value;
    
    if (field === 'category_id' && typeof value === 'string') {
      const id = mappings.specialtyNameToId(value);
      if (id) convertedValue = id;
    } else if (field === 'difficulty_level' && typeof value === 'string') {
      const level = parseInt(value.match(/\d+/)?.[0] || '0');
      convertedValue = level;
    }
    
    setForm((prev: any) => ({ ...prev, [field]: convertedValue }));
    onFieldsUpdated?.([field]);
    toast({ title: `Campo "${field}" atualizado!` });
  };

  const getTemplateOptions = () => {
    const modality = form.modality?.toLowerCase() || '';
    
    if (modality.includes('tomografia') || modality.includes('tc')) {
      return [
        { key: 'trauma_tc', label: 'TC Trauma', icon: '🚨' },
        { key: 'abdome_tc', label: 'TC Abdome', icon: '🫀' }
      ];
    }
    
    if (modality.includes('radiografia') || modality.includes('rx')) {
      return [
        { key: 'pneumonia_rx', label: 'RX Pneumonia', icon: '🫁' },
        { key: 'fratura_membro', label: 'RX Fratura', icon: '🦴' }
      ];
    }
    
    if (modality.includes('ressonancia') || modality.includes('rm')) {
      return [
        { key: 'rm_neurologico', label: 'RM Neuro', icon: '🧠' }
      ];
    }
    
    return [
      { key: 'caso_raro', label: 'Caso Raro', icon: '⭐' }
    ];
  };

  if (mappings.isLoading) {
    return (
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando sistema de auto-preenchimento...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Wand2 className="h-5 w-5" />
            Auto-preenchimento Inteligente
            <Badge className="bg-purple-500 text-white">IA</Badge>
            <Badge className="bg-green-500 text-white">
              <MapPin className="h-3 w-3 mr-1" />
              Dados Unificados
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ações Principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              onClick={handleSmartAutofill}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
              size="sm"
            >
              {loading && lastAction === 'smart_autofill' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Brain className="h-4 w-4" />
              )}
              Auto-completar
            </Button>
            
            <Button
              onClick={handleFieldCompletion}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading && lastAction === 'field_completion' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Target className="h-4 w-4" />
              )}
              Completar
            </Button>
            
            <Button
              onClick={handleConsistencyCheck}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading && lastAction === 'consistency_check' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Validar
            </Button>
            
            <Button
              onClick={() => callAutofill API('smart_suggestions')}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading && lastAction === 'smart_suggestions' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="h-4 w-4" />
              )}
              Sugestões
            </Button>
          </div>

          {/* Templates Especializados */}
          {form.modality && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                Templates para {form.modality}
              </h4>
              <div className="flex flex-wrap gap-2">
                {getTemplateOptions().map((template) => (
                  <Button
                    key={template.key}
                    onClick={() => handleTemplateAutofill(template.key)}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {loading && lastAction === 'template_autofill' ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <span>{template.icon}</span>
                    )}
                    {template.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Sugestões Ativas */}
          {suggestions && (
            <div className="space-y-3">
              {suggestions.missing_critical && suggestions.missing_critical.length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      Campos Críticos Faltando
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {suggestions.missing_critical.map((field: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {suggestions.auto_suggestions && Object.keys(suggestions.auto_suggestions).length > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Sugestões Automáticas (Convertidas)
                    </span>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(suggestions.auto_suggestions).map(([field, value]) => (
                      <div key={field} className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">{field}:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{String(value)}</span>
                          <Button
                            onClick={() => applyAutoSuggestion(field, value)}
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                          >
                            Aplicar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {suggestions.consistency_score && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800">
                      Score de Consistência
                    </span>
                    <Badge className={`${
                      suggestions.consistency_score >= 90 ? 'bg-green-500' :
                      suggestions.consistency_score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    } text-white`}>
                      {suggestions.consistency_score}%
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
