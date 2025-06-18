
import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Lightbulb, Target, Star } from "lucide-react";

type Props = {
  form: any;
};

export function CaseQualityRadar({ form }: Props) {
  // Análise de qualidade específica para radiologia
  const qualityChecks = [
    {
      name: "Diagnóstico Estruturado",
      check: () => form.primary_diagnosis && form.case_classification,
      weight: 3,
      tip: "Defina diagnóstico principal e classificação do caso"
    },
    {
      name: "Modalidade & Região",
      check: () => form.modality && form.anatomical_regions?.length > 0,
      weight: 3,
      tip: "Especifique modalidade e regiões anatômicas"
    },
    {
      name: "Achados Radiológicos",
      check: () => form.findings && form.finding_types?.length > 0,
      weight: 2,
      tip: "Descreva achados e classifique os tipos encontrados"
    },
    {
      name: "Contexto Clínico",
      check: () => form.patient_clinical_info && form.main_symptoms?.length > 0,
      weight: 2,
      tip: "Inclua informações clínicas e sintomas principais"
    },
    {
      name: "Quiz Completo",
      check: () => {
        const validOptions = form.answer_options?.filter((opt: string) => opt?.trim()).length || 0;
        return form.main_question && validOptions >= 4 && form.explanation;
      },
      weight: 2,
      tip: "Complete pergunta, alternativas e explicação"
    },
    {
      name: "Metadados Educacionais",
      check: () => form.learning_objectives?.length > 0 || form.pathology_types?.length > 0,
      weight: 1,
      tip: "Adicione objetivos de aprendizado ou tipos de patologia"
    }
  ];

  const results = qualityChecks.map(check => ({
    ...check,
    passed: check.check()
  }));

  const totalWeight = qualityChecks.reduce((sum, check) => sum + check.weight, 0);
  const passedWeight = results.filter(r => r.passed).reduce((sum, r) => sum + r.weight, 0);
  const qualityScore = Math.round((passedWeight / totalWeight) * 100);

  // Análise de consistência
  const consistencyIssues = [];
  
  // Verificar consistência modalidade vs região
  if (form.modality === "Radiografia" && form.anatomical_regions?.includes("Crânio")) {
    consistencyIssues.push("Radiografia raramente é usada para crânio (considere TC)");
  }
  
  // Verificar consistência diagnóstico vs achados
  if (form.primary_diagnosis?.toLowerCase().includes("pneumonia") && 
      !form.findings?.toLowerCase().includes("consolidação")) {
    consistencyIssues.push("Pneumonia geralmente apresenta consolidação nos achados");
  }

  // Verificar lateralidade vs região
  if (form.laterality && !form.anatomical_regions?.some((region: string) => 
      ["Pulmões", "Membros", "Rins"].some(bilateral => region.includes(bilateral)))) {
    consistencyIssues.push("Lateralidade definida mas região não sugere estrutura bilateral");
  }

  const getQualityLevel = () => {
    if (qualityScore >= 85 && consistencyIssues.length === 0) return "excellent";
    if (qualityScore >= 70) return "good";
    if (qualityScore >= 50) return "acceptable";
    return "needs_improvement";
  };

  const qualityLevel = getQualityLevel();
  const qualityConfig = {
    excellent: { 
      color: "emerald", 
      icon: Star, 
      label: "Excelente Qualidade",
      description: "Caso pronto para publicação"
    },
    good: { 
      color: "blue", 
      icon: CheckCircle, 
      label: "Boa Qualidade",
      description: "Poucas melhorias necessárias"
    },
    acceptable: { 
      color: "yellow", 
      icon: Target, 
      label: "Qualidade Aceitável",
      description: "Algumas melhorias recomendadas"
    },
    needs_improvement: { 
      color: "red", 
      icon: AlertTriangle, 
      label: "Precisa Melhorar",
      description: "Várias áreas precisam de atenção"
    }
  };

  const config = qualityConfig[qualityLevel];
  const Icon = config.icon;

  return (
    <div className={`bg-gradient-to-r from-${config.color}-50 to-${config.color}-100 rounded-lg p-4 border border-${config.color}-200`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 text-${config.color}-600`} />
          <h3 className={`font-bold text-${config.color}-900`}>
            Radar de Qualidade Radiológica
          </h3>
        </div>
        <Badge className={`bg-${config.color}-500 text-white`}>
          {qualityScore}%
        </Badge>
      </div>

      <div className="mb-3">
        <div className={`text-sm font-medium text-${config.color}-800 mb-1`}>
          {config.label}
        </div>
        <div className={`text-xs text-${config.color}-600`}>
          {config.description}
        </div>
      </div>

      {/* Checklist de qualidade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        {results.map((result, index) => (
          <div 
            key={index}
            className={`flex items-center gap-2 p-2 rounded text-xs ${
              result.passed 
                ? "bg-green-100 text-green-800 border border-green-200" 
                : "bg-gray-100 text-gray-600 border border-gray-200"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${
              result.passed ? "bg-green-500" : "bg-gray-400"
            }`} />
            <span className="font-medium">{result.name}</span>
            <span className="text-xs opacity-60">({result.weight}x)</span>
          </div>
        ))}
      </div>

      {/* Issues de consistência */}
      {consistencyIssues.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
          <div className="flex items-center gap-1 mb-1">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            <span className="text-xs font-medium text-yellow-800">
              Alertas de Consistência:
            </span>
          </div>
          <ul className="text-xs text-yellow-700 space-y-1">
            {consistencyIssues.map((issue, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-yellow-500">•</span>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sugestões para melhorar */}
      {qualityScore < 85 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-xs font-medium text-gray-700 mb-1">
            💡 Sugestões para melhorar:
          </div>
          <ul className="text-xs text-gray-600 space-y-1">
            {results.filter(r => !r.passed).slice(0, 3).map((result, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-gray-400">•</span>
                {result.tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
