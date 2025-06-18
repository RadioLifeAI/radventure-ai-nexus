
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
  MapPin,
  FileText,
  Stethoscope,
  Database,
  HelpCircle,
  BookOpen
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDataIdMappings } from "@/hooks/useDataIdMappings";

type Props = {
  form: any;
  setForm: (updater: (prev: any) => any) => void;
  onFieldsUpdated?: (fields: string[]) => void;
};

export function CaseSmartAutofillAdvanced({ form, setForm, onFieldsUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const mappings = useDataIdMappings();

  const callAutofillAPI = async (action: string, templateType?: string) => {
    setLoading(true);
    setLastAction(action);
    
    try {
      console.log('🚀 Calling case-autofill API:', action);
      
      const { data, error } = await supabase.functions.invoke('case-autofill', {
        body: { 
          caseData: form, 
          action,
          templateType 
        }
      });

      if (error) throw error;

      console.log('✅ API Response:', data);
      setSuggestions(data.suggestions);
      return data.suggestions;
    } catch (error: any) {
      console.error('❌ Autofill API Error:', error);
      toast({ 
        title: "Erro no auto-preenchimento", 
        description: error.message || "Erro desconhecido",
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
          } else if (typeof value === 'number') {
            convertedData.category_id = value;
            appliedFields.push('category_id');
          }
          break;
          
        case 'difficulty_level':
          if (typeof value === 'string' || typeof value === 'number') {
            const level = typeof value === 'string' ? 
              parseInt(value.match(/\d+/)?.[0] || '0') : value;
            convertedData.difficulty_level = level;
            appliedFields.push('difficulty_level');
          }
          break;
          
        case 'modality':
          if (typeof value === 'string') {
            convertedData.modality = value;
            appliedFields.push('modality');
          }
          break;
          
        case 'subtype':
          if (typeof value === 'string') {
            convertedData.subtype = value;
            appliedFields.push('subtype');
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

  // Geração de título inteligente
  const handleGenerateTitle = async () => {
    const result = await callAutofillAPI('generate_title');
    if (result?.title) {
      setForm((prev: any) => ({ ...prev, title: result.title }));
      onFieldsUpdated?.(['title']);
      toast({ 
        title: "Título gerado com sucesso!",
        description: `Título: ${result.title}`
      });
    }
  };

  // Auto-preenchimento por seção
  const handleAutofillBasicData = async () => {
    const result = await callAutofillAPI('autofill_basic_data');
    if (result) {
      const { convertedData, appliedFields } = convertAndApplySuggestions(result);
      
      if (Object.keys(convertedData).length > 0) {
        setForm((prev: any) => ({ ...prev, ...convertedData }));
        onFieldsUpdated?.(appliedFields);
        toast({ 
          title: `Dados básicos preenchidos!`,
          description: `${appliedFields.length} campos atualizados`
        });
      }
    }
  };

  const handleAutofillDiagnosis = async () => {
    const result = await callAutofillAPI('autofill_diagnosis');
    if (result) {
      const { convertedData, appliedFields } = convertAndApplySuggestions(result);
      
      if (Object.keys(convertedData).length > 0) {
        setForm((prev: any) => ({ ...prev, ...convertedData }));
        onFieldsUpdated?.(appliedFields);
        toast({ 
          title: `Diagnósticos preenchidos!`,
          description: `${appliedFields.length} campos atualizados`
        });
      }
    }
  };

  const handleAutofillStructuredData = async () => {
    const result = await callAutofillAPI('autofill_structured_data');
    if (result) {
      const { convertedData, appliedFields } = convertAndApplySuggestions(result);
      
      if (Object.keys(convertedData).length > 0) {
        setForm((prev: any) => ({ ...prev, ...convertedData }));
        onFieldsUpdated?.(appliedFields);
        toast({ 
          title: `Dados estruturados preenchidos!`,
          description: `${appliedFields.length} campos atualizados`
        });
      }
    }
  };

  const handleAutofillQuiz = async () => {
    const result = await callAutofillAPI('autofill_quiz');
    if (result) {
      const { convertedData, appliedFields } = convertAndApplySuggestions(result);
      
      if (Object.keys(convertedData).length > 0) {
        setForm((prev: any) => ({ ...prev, ...convertedData }));
        onFieldsUpdated?.(appliedFields);
        toast({ 
          title: `Quiz gerado!`,
          description: `Pergunta e alternativas criadas`
        });
      }
    }
  };

  // Ações adicionais
  const handleSmartSuggestions = async () => {
    const result = await callAutofillAPI('smart_suggestions');
    if (result) {
      setSuggestions(result);
      toast({ 
        title: "Sugestões inteligentes geradas!",
        description: "Confira as sugestões abaixo"
      });
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
            Auto-preenchimento Inteligente Avançado
            <Badge className="bg-purple-500 text-white">IA</Badge>
            <Badge className="bg-green-500 text-white">
              <MapPin className="h-3 w-3 mr-1" />
              Dados Unificados
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Geração de Título Inteligente */}
          <div className="bg-white/50 rounded-lg p-4 border border-purple-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Geração de Título Inteligente
            </h4>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleGenerateTitle}
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                size="sm"
              >
                {loading && lastAction === 'generate_title' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Gerar Título com IA
              </Button>
              <span className="text-xs text-gray-600">
                Título profissional baseado no contexto do caso
              </span>
            </div>
          </div>

          {/* Auto-preenchimento por Seção */}
          <div className="bg-white/50 rounded-lg p-4 border border-purple-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Auto-preenchimento por Seção
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={handleAutofillBasicData}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex flex-col h-auto py-3 text-xs"
              >
                {loading && lastAction === 'autofill_basic_data' ? (
                  <Loader2 className="h-4 w-4 animate-spin mb-1" />
                ) : (
                  <Database className="h-4 w-4 mb-1" />
                )}
                <span>Dados Básicos</span>
                <span className="text-gray-500">Categoria, Dificuldade, Modalidade</span>
              </Button>
              
              <Button
                onClick={handleAutofillDiagnosis}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex flex-col h-auto py-3 text-xs"
              >
                {loading && lastAction === 'autofill_diagnosis' ? (
                  <Loader2 className="h-4 w-4 animate-spin mb-1" />
                ) : (
                  <Stethoscope className="h-4 w-4 mb-1" />
                )}
                <span>Diagnóstico</span>
                <span className="text-gray-500">Principal, Diferenciais, CID-10</span>
              </Button>
              
              <Button
                onClick={handleAutofillStructuredData}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex flex-col h-auto py-3 text-xs"
              >
                {loading && lastAction === 'autofill_structured_data' ? (
                  <Loader2 className="h-4 w-4 animate-spin mb-1" />
                ) : (
                  <BookOpen className="h-4 w-4 mb-1" />
                )}
                <span>Dados Estruturados</span>
                <span className="text-gray-500">Regiões, Achados, Sintomas</span>
              </Button>
              
              <Button
                onClick={handleAutofillQuiz}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex flex-col h-auto py-3 text-xs"
              >
                {loading && lastAction === 'autofill_quiz' ? (
                  <Loader2 className="h-4 w-4 animate-spin mb-1" />
                ) : (
                  <HelpCircle className="h-4 w-4 mb-1" />
                )}
                <span>Quiz</span>
                <span className="text-gray-500">Pergunta, Alternativas, Feedback</span>
              </Button>
            </div>
          </div>

          {/* Ações de Análise */}
          <div className="bg-white/50 rounded-lg p-4 border border-purple-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Análise e Sugestões
            </h4>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleSmartSuggestions}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading && lastAction === 'smart_suggestions' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lightbulb className="h-4 w-4" />
                )}
                Sugestões Inteligentes
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
                Verificar Consistência
              </Button>
            </div>
          </div>

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
                      Sugestões Automáticas
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

              {suggestions.consistency_score !== undefined && (
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
                  {suggestions.issues && suggestions.issues.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {suggestions.issues.map((issue: any, index: number) => (
                        <div key={index} className="text-xs text-blue-700">
                          <strong>{issue.field}:</strong> {issue.issue}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
