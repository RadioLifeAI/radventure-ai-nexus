
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Lightbulb,
  TrendingUp,
  Clock,
  Target
} from "lucide-react";
import { useFormDependencyValidator } from "@/hooks/useFormDependencyValidator";

type Props = {
  form: any;
  setForm: (updater: (prev: any) => any) => void;
  onFieldsUpdated?: (fields: string[]) => void;
};

export function CaseFormContextualSuggestions({ form, setForm, onFieldsUpdated }: Props) {
  const { validations, isFormValid } = useFormDependencyValidator(form);

  const applySuggestion = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
    onFieldsUpdated?.([field]);
  };

  const getIconForSeverity = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <Info className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Lightbulb className="h-4 w-4 text-blue-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getAlertVariant = (severity: string) => {
    switch (severity) {
      case 'error': return 'destructive';
      case 'warning': return 'default';
      default: return 'default';
    }
  };

  // Sugestões contextuais baseadas no preenchimento atual
  const getContextualSuggestions = () => {
    const suggestions = [];

    // Sugestão baseada na modalidade
    if (form.modality && !form.subtype) {
      suggestions.push({
        type: 'completion',
        message: 'Selecione um subtipo para a modalidade escolhida',
        action: () => {}, // Não aplicável automaticamente
        icon: <Target className="h-4 w-4 text-blue-500" />
      });
    }

    // Sugestão baseada no diagnóstico
    if (form.primary_diagnosis && !form.cid10_code) {
      suggestions.push({
        type: 'completion',
        message: 'Adicione o código CID-10 para o diagnóstico',
        action: () => {}, // Seria bom ter uma API para buscar CID-10
        icon: <Clock className="h-4 w-4 text-orange-500" />
      });
    }

    // Sugestão de dificuldade baseada na complexidade
    if (form.case_complexity_factors?.length > 2 && form.difficulty_level < 3) {
      suggestions.push({
        type: 'optimization',
        message: 'Caso com alta complexidade pode ter dificuldade maior',
        action: () => applySuggestion('difficulty_level', 3),
        icon: <TrendingUp className="h-4 w-4 text-purple-500" />
      });
    }

    return suggestions;
  };

  const contextualSuggestions = getContextualSuggestions();

  if (validations.length === 0 && contextualSuggestions.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex items-center gap-2 p-4">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm text-green-800 font-medium">
            Formulário consistente - Todos os campos estão válidos!
          </span>
          <Badge className="bg-green-500 text-white ml-auto">
            ✓ Validado
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800 text-sm">
            <Lightbulb className="h-4 w-4" />
            Sugestões Contextuais e Validações
            <Badge variant={isFormValid ? 'default' : 'destructive'} className="text-xs">
              {isFormValid ? 'Válido' : 'Atenção'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Validações de Dependências */}
          {validations.map((validation, index) => (
            <Alert key={index} variant={getAlertVariant(validation.severity)}>
              <div className="flex items-start gap-2">
                {getIconForSeverity(validation.severity)}
                <div className="flex-1">
                  <AlertDescription className="text-sm">
                    <strong>Campo {validation.field}:</strong> {validation.message}
                    {validation.suggestion && (
                      <div className="mt-1 text-xs text-gray-600">
                        💡 {validation.suggestion}
                      </div>
                    )}
                  </AlertDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  {validation.severity}
                </Badge>
              </div>
            </Alert>
          ))}

          {/* Sugestões Contextuais */}
          {contextualSuggestions.map((suggestion, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-center gap-2">
                {suggestion.icon}
                <span className="text-sm text-blue-800">{suggestion.message}</span>
              </div>
              {suggestion.action && (
                <Button
                  onClick={suggestion.action}
                  size="sm"
                  variant="outline"
                  className="h-7 px-3 text-xs"
                >
                  Aplicar
                </Button>
              )}
            </div>
          ))}

          {/* Status Geral */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Status do formulário:</span>
              <Badge className={isFormValid ? 'bg-green-500' : 'bg-yellow-500'}>
                {isFormValid ? 'Pronto para salvar' : 'Requer atenção'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
