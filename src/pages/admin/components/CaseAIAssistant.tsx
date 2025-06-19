
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Zap, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  MessageSquare,
  Sparkles,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface AIAnalysis {
  qualityScore: number;
  suggestions: Array<{
    type: 'improvement' | 'warning' | 'optimization';
    category: string;
    message: string;
    impact: 'high' | 'medium' | 'low';
    autoFix?: () => void;
  }>;
  strengths: string[];
  completeness: number;
}

interface CaseAIAssistantProps {
  caseData: any;
  onApplySuggestion?: (suggestion: any) => void;
  onRequestAnalysis?: () => Promise<AIAnalysis>;
}

export function CaseAIAssistant({ 
  caseData, 
  onApplySuggestion, 
  onRequestAnalysis 
}: CaseAIAssistantProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [chatInput, setChatInput] = useState("");

  const handleAnalyze = useCallback(async () => {
    if (!onRequestAnalysis) return;
    
    setLoading(true);
    try {
      const result = await onRequestAnalysis();
      setAnalysis(result);
    } catch (error) {
      console.error("Erro na análise de IA:", error);
    } finally {
      setLoading(false);
    }
  }, [onRequestAnalysis]);

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'improvement':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'optimization':
        return <Zap className="h-4 w-4 text-green-600" />;
      default:
        return <Lightbulb className="h-4 w-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const mockAnalysis = useCallback(async (): Promise<AIAnalysis> => {
    // Simular análise de IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      qualityScore: 85,
      completeness: 78,
      suggestions: [
        {
          type: 'improvement',
          category: 'Explicação',
          message: 'A explicação poderia incluir mais detalhes sobre o diagnóstico diferencial.',
          impact: 'high',
          autoFix: () => console.log('Aplicando melhoria na explicação')
        },
        {
          type: 'optimization',
          category: 'Dificuldade',
          message: 'Com base no conteúdo, sugerimos aumentar a dificuldade para nível 4.',
          impact: 'medium',
          autoFix: () => console.log('Ajustando dificuldade')
        },
        {
          type: 'warning',
          category: 'Imagens',
          message: 'Algumas imagens poderiam ter melhor qualidade ou anotações.',
          impact: 'medium'
        }
      ],
      strengths: [
        'Pergunta bem formulada',
        'Alternativas plausíveis',
        'Contexto clínico adequado'
      ]
    };
  }, []);

  React.useEffect(() => {
    if (caseData && !analysis) {
      // Auto-análise quando o componente é carregado
      handleAnalyze();
    }
  }, [caseData, analysis, handleAnalyze]);

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Assistente IA
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={chatMode ? () => setChatMode(false) : () => setChatMode(true)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {chatMode ? 'Análise' : 'Chat'}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!chatMode ? (
          <>
            {/* Análise de Qualidade */}
            {analysis && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-purple-600">
                      {analysis.qualityScore}%
                    </div>
                    <div className="text-sm text-gray-600">Qualidade Geral</div>
                    <Progress value={analysis.qualityScore} className="mt-2" />
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysis.completeness}%
                    </div>
                    <div className="text-sm text-gray-600">Completude</div>
                    <Progress value={analysis.completeness} className="mt-2" />
                  </div>
                </div>

                {/* Pontos Fortes */}
                <div className="bg-white rounded-lg border p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Pontos Fortes
                  </h4>
                  <div className="space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Sparkles className="h-3 w-3 text-green-500" />
                        {strength}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sugestões */}
                <div className="bg-white rounded-lg border p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    Sugestões de Melhoria
                  </h4>
                  <div className="space-y-3">
                    {analysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getSuggestionIcon(suggestion.type)}
                            <span className="font-medium text-sm">{suggestion.category}</span>
                          </div>
                          <Badge className={getImpactColor(suggestion.impact)}>
                            {suggestion.impact === 'high' ? 'Alto' : 
                             suggestion.impact === 'medium' ? 'Médio' : 'Baixo'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{suggestion.message}</p>
                        {suggestion.autoFix && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={suggestion.autoFix}
                            className="flex items-center gap-2"
                          >
                            <Zap className="h-3 w-3" />
                            Aplicar automaticamente
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Clock className="h-5 w-5 animate-spin text-purple-600" />
                  <span>Analisando caso com IA...</span>
                </div>
                <Progress value={60} className="max-w-xs mx-auto" />
              </div>
            )}

            {!analysis && !loading && (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-purple-300" />
                <p className="text-gray-600 mb-4">
                  Solicite uma análise detalhada do caso com IA
                </p>
                <Button onClick={mockAnalysis.bind(null)} className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Analisar com IA
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Modo Chat */
          <div className="space-y-4">
            <div className="bg-white rounded-lg border p-4 min-h-[200px]">
              <div className="text-center text-gray-500 mt-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                <p>Chat com IA em desenvolvimento</p>
                <p className="text-sm">Em breve você poderá conversar diretamente com a IA sobre o caso</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Textarea
                placeholder="Pergunte algo sobre o caso..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled
              />
              <Button disabled>
                Enviar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
