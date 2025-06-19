
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  TrendingUp,
  Calendar,
  Users,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Sparkles,
  BarChart3,
  Settings,
  Lightbulb
} from "lucide-react";

interface OptimizationSuggestion {
  id: string;
  type: "schedule" | "audience" | "difficulty" | "prizes" | "duration" | "cases";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  currentValue: string;
  suggestedValue: string;
  confidence: number;
  reasoning: string;
  dataPoints: string[];
}

interface OptimizationReport {
  overallScore: number;
  suggestions: OptimizationSuggestion[];
  predictedMetrics: {
    expectedParticipants: number;
    expectedEngagement: number;
    expectedCompletionRate: number;
    estimatedRevenue: number;
  };
  marketAnalysis: {
    competingEvents: number;
    optimalTimeSlot: string;
    targetAudienceAvailability: number;
  };
}

const MOCK_OPTIMIZATION_REPORT: OptimizationReport = {
  overallScore: 78,
  suggestions: [
    {
      id: "schedule-optimization",
      type: "schedule",
      priority: "high",
      title: "Otimizar Horário do Evento",
      description: "Baseado em dados históricos, existe um horário melhor para máximo engajamento",
      impact: "+25% participação esperada",
      currentValue: "14:00 - Quinta-feira",
      suggestedValue: "19:30 - Terça-feira",
      confidence: 89,
      reasoning: "Análise de 500+ eventos similares mostra pico de atividade às 19:30 nas terças",
      dataPoints: ["Histórico de participação", "Padrões de comportamento", "Disponibilidade do público-alvo"]
    },
    {
      id: "difficulty-adjustment",
      type: "difficulty",
      priority: "medium",
      title: "Ajustar Nível de Dificuldade",
      description: "O nível atual pode ser muito elevado para o público-alvo",
      impact: "+15% taxa de conclusão",
      currentValue: "Nível 4 (Difícil)",
      suggestedValue: "Nível 3 (Moderado)",
      confidence: 76,
      reasoning: "Residentes R2 têm melhor performance em nível 3, mantendo engajamento",
      dataPoints: ["Performance histórica por nível", "Perfil dos participantes", "Métricas de abandono"]
    },
    {
      id: "prize-optimization",
      type: "prizes",
      priority: "medium",
      title: "Otimizar Distribuição de Prêmios",
      description: "Redistribuição pode aumentar motivação e participação",
      impact: "+12% engajamento",
      currentValue: "1º: 500 RC, 2º: 200 RC",
      suggestedValue: "1º: 400 RC, 2º: 250 RC, 3º: 150 RC",
      confidence: 82,
      reasoning: "Maior distribuição de prêmios aumenta motivação geral dos participantes",
      dataPoints: ["Análise de gamificação", "Comportamento competitivo", "ROI de prêmios"]
    },
    {
      id: "duration-optimization",
      type: "duration",
      priority: "low",
      title: "Ajustar Duração do Evento",
      description: "Duração pode ser otimizada para melhor retenção",
      impact: "+8% retenção",
      currentValue: "45 minutos",
      suggestedValue: "35 minutos",
      confidence: 71,
      reasoning: "Eventos de 35min mantêm atenção sem causar fadiga",
      dataPoints: ["Métricas de atenção", "Padrões de abandono", "Feedback dos usuários"]
    }
  ],
  predictedMetrics: {
    expectedParticipants: 87,
    expectedEngagement: 78,
    expectedCompletionRate: 65,
    estimatedRevenue: 2340
  },
  marketAnalysis: {
    competingEvents: 3,
    optimalTimeSlot: "19:30 - 20:15",
    targetAudienceAvailability: 84
  }
};

interface Props {
  eventData: any;
  onApplyOptimization: (suggestion: OptimizationSuggestion) => void;
  onRunAnalysis: () => void;
}

export function EventAIOptimizer({ eventData, onApplyOptimization, onRunAnalysis }: Props) {
  const [report, setReport] = useState<OptimizationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    // Simular carregamento do relatório
    if (eventData) {
      setLoading(true);
      setTimeout(() => {
        setReport(MOCK_OPTIMIZATION_REPORT);
        setLoading(false);
      }, 2000);
    }
  }, [eventData]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "low": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertTriangle className="h-4 w-4" />;
      case "medium": return <Clock className="h-4 w-4" />;
      case "low": return <CheckCircle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "schedule": return <Calendar className="h-4 w-4" />;
      case "audience": return <Users className="h-4 w-4" />;
      case "difficulty": return <Target className="h-4 w-4" />;
      case "prizes": return <Sparkles className="h-4 w-4" />;
      case "duration": return <Clock className="h-4 w-4" />;
      case "cases": return <Brain className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const filteredSuggestions = report?.suggestions.filter(suggestion => 
    selectedFilter === "all" || suggestion.priority === selectedFilter
  ) || [];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <h3 className="text-lg font-semibold mb-2">Analisando seu evento...</h3>
          <p className="text-gray-600 mb-4">
            Nossa IA está processando dados históricos e padrões de comportamento
          </p>
          <Progress value={45} className="w-full max-w-md mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-purple-600" />
          <h3 className="text-lg font-semibold mb-2">Otimização Inteligente de Eventos</h3>
          <p className="text-gray-600 mb-4">
            Execute uma análise completa para receber sugestões personalizadas de otimização
          </p>
          <Button onClick={onRunAnalysis} className="bg-purple-600 hover:bg-purple-700">
            <Zap className="h-4 w-4 mr-2" />
            Executar Análise de IA
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score Geral e Métricas Previstas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Score de Otimização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {report.overallScore}/100
              </div>
              <Progress value={report.overallScore} className="w-full mb-4" />
              <p className="text-sm text-gray-600">
                {report.overallScore >= 80 ? "Excelente configuração!" :
                 report.overallScore >= 60 ? "Boa configuração, com espaço para melhorias" :
                 "Muitas oportunidades de otimização"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Métricas Previstas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Participantes esperados:</span>
              <span className="font-semibold">{report.predictedMetrics.expectedParticipants}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Engajamento previsto:</span>
              <span className="font-semibold">{report.predictedMetrics.expectedEngagement}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Taxa de conclusão:</span>
              <span className="font-semibold">{report.predictedMetrics.expectedCompletionRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Receita estimada:</span>
              <span className="font-semibold">{report.predictedMetrics.estimatedRevenue} RC</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise de Mercado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Análise de Mercado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {report.marketAnalysis.competingEvents}
              </div>
              <div className="text-sm text-blue-700">Eventos Concorrentes</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm font-semibold text-green-600 mb-1">
                {report.marketAnalysis.optimalTimeSlot}
              </div>
              <div className="text-sm text-green-700">Horário Ótimo</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {report.marketAnalysis.targetAudienceAvailability}%
              </div>
              <div className="text-sm text-purple-700">Disponibilidade do Público</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sugestões de Otimização */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Sugestões de Otimização ({filteredSuggestions.length})
          </CardTitle>
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="high">Alta Prioridade</SelectItem>
              <SelectItem value="medium">Média Prioridade</SelectItem>
              <SelectItem value="low">Baixa Prioridade</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredSuggestions.map((suggestion) => (
            <Alert key={suggestion.id} className="border-l-4 border-l-purple-500">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(suggestion.type)}
                    <h4 className="font-semibold">{suggestion.title}</h4>
                    <Badge className={getPriorityColor(suggestion.priority)}>
                      {getPriorityIcon(suggestion.priority)}
                      <span className="ml-1 capitalize">{suggestion.priority}</span>
                    </Badge>
                    <Badge variant="outline">
                      {suggestion.confidence}% confiança
                    </Badge>
                  </div>
                  
                  <AlertDescription className="mb-3">
                    {suggestion.description}
                  </AlertDescription>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Atual: </span>
                      <span>{suggestion.currentValue}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Sugerido: </span>
                      <span className="text-green-700 font-medium">{suggestion.suggestedValue}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="font-medium text-green-600 text-sm mb-1">
                      📈 {suggestion.impact}
                    </div>
                    <div className="text-sm text-gray-600">
                      {suggestion.reasoning}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Baseado em: </span>
                    {suggestion.dataPoints.join(" • ")}
                  </div>
                </div>

                <Button 
                  onClick={() => onApplyOptimization(suggestion)}
                  size="sm"
                  className="ml-4"
                >
                  Aplicar
                </Button>
              </div>
            </Alert>
          ))}

          {filteredSuggestions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-2" />
              <p>Nenhuma sugestão encontrada para este filtro.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex gap-4">
        <Button onClick={onRunAnalysis} variant="outline">
          <Zap className="h-4 w-4 mr-2" />
          Nova Análise
        </Button>
        <Button 
          onClick={() => {
            // Aplicar todas as sugestões de alta prioridade
            report.suggestions
              .filter(s => s.priority === "high")
              .forEach(onApplyOptimization);
          }}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Aplicar Sugestões Principais
        </Button>
      </div>
    </div>
  );
}
