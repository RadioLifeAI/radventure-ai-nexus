
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Wand2,
  Sparkles,
  Target,
  Clock
} from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  form: any;
  onApplyAutofill: (data: any) => void;
  suggestions?: any;
};

export function CaseAutofillModal({ open, onClose, form, onApplyAutofill, suggestions }: Props) {
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());

  const handleToggleSuggestion = (field: string) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(field)) {
      newSelected.delete(field);
    } else {
      newSelected.add(field);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleApplySelected = () => {
    const dataToApply: any = {};
    selectedSuggestions.forEach(field => {
      if (suggestions?.auto_suggestions?.[field]) {
        dataToApply[field] = suggestions.auto_suggestions[field];
      }
    });
    
    onApplyAutofill(dataToApply);
    onClose();
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const completionPercentage = suggestions?.quality_score || 0;
  const hasAutoSuggestions = suggestions?.auto_suggestions && Object.keys(suggestions.auto_suggestions).length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Análise Inteligente do Caso
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Score de Qualidade */}
          {suggestions?.quality_score && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Qualidade do Caso
                </h3>
                <Badge className={getQualityColor(suggestions.quality_score)}>
                  {suggestions.quality_score}%
                </Badge>
              </div>
              <Progress value={suggestions.quality_score} className="h-2" />
              <p className="text-xs text-gray-600">
                {suggestions.quality_score >= 90 ? "Excelente qualidade! Caso pronto para publicação." :
                 suggestions.quality_score >= 70 ? "Boa qualidade. Algumas melhorias recomendadas." :
                 "Caso precisa de melhorias significativas."}
              </p>
            </div>
          )}

          {/* Campos Críticos Faltando */}
          {suggestions?.missing_critical && suggestions.missing_critical.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                Campos Críticos Faltando
              </h3>
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <div className="flex flex-wrap gap-2">
                  {suggestions.missing_critical.map((field: string, index: number) => (
                    <Badge key={index} variant="destructive" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sugestões Automáticas */}
          {hasAutoSuggestions && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-green-700">
                <Sparkles className="h-4 w-4" />
                Sugestões de Preenchimento
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(suggestions.auto_suggestions).map(([field, value]) => (
                  <div 
                    key={field}
                    className={`p-3 border rounded cursor-pointer transition-colors ${
                      selectedSuggestions.has(field) 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleToggleSuggestion(field)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900 mb-1">
                          {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div className="text-sm text-gray-600">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </div>
                      </div>
                      <div className="ml-2">
                        <CheckCircle 
                          className={`h-5 w-5 ${
                            selectedSuggestions.has(field) 
                              ? 'text-green-600' 
                              : 'text-gray-300'
                          }`} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alertas de Consistência */}
          {suggestions?.consistency_alerts && suggestions.consistency_alerts.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-yellow-700">
                <AlertTriangle className="h-4 w-4" />
                Alertas de Consistência
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <ul className="space-y-1">
                  {suggestions.consistency_alerts.map((alert: string, index: number) => (
                    <li key={index} className="text-sm text-yellow-800 flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      {alert}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tempo Estimado */}
          {suggestions?.estimated_completion_time && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              Tempo estimado para completar: {suggestions.estimated_completion_time} minutos
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-500">
              {selectedSuggestions.size} sugestões selecionadas
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
              {hasAutoSuggestions && (
                <Button 
                  onClick={handleApplySelected}
                  disabled={selectedSuggestions.size === 0}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Aplicar Selecionadas
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
