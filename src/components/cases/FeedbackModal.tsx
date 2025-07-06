
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Clock, 
  Target, 
  Zap, 
  Star, 
  ArrowRight, 
  RotateCcw,
  TrendingUp,
  BookOpen,
  Brain,
  Award
} from "lucide-react";
import { useResponsive } from "@/hooks/useResponsive";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  isCorrect: boolean; // Fonte única de verdade vinda do useCaseProgress
  correctAnswer: string;
  selectedAnswer: string;
  explanation: string;
  performance: {
    points: number;
    timeSpent: number;
    helpUsed: string[];
    penalty: number;
    selectedIndex?: number;
    selectedFeedback?: string; // Feedback correto da alternativa selecionada
    confidence?: number;
  };
  onNextCase: () => void;
  onReviewCase: () => void;
};

export function FeedbackModal({
  open,
  onClose,
  isCorrect,
  correctAnswer,
  selectedAnswer,
  explanation,
  performance,
  onNextCase,
  onReviewCase
}: Props) {
  const [activeTab, setActiveTab] = useState("summary");
  const { isMobile, isTablet } = useResponsive();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Títulos adaptativos das abas
  const getTabTitles = () => {
    if (isMobile) {
      return {
        summary: "Resumo",
        analysis: "Análise",
        insights: "Insights"
      };
    }
    return {
      summary: "Resumo",
      analysis: "Análise Detalhada", 
      insights: "Insights de Aprendizado"
    };
  };

  const tabTitles = getTabTitles();

  // Usar o isCorrect como fonte única de verdade (já validado no useCaseProgress)
  const actuallyCorrect = isCorrect;

  // CORREÇÃO: Usar o feedback correto que já vem mapeado do useCaseProgress
  const selectedFeedback = performance.selectedFeedback || '';

  // Métricas de performance avançadas
  const getPerformanceLevel = () => {
    let score = 0;
    if (actuallyCorrect) score += 40;
    if (performance.timeSpent < 120) score += 20;
    if (performance.helpUsed.length === 0) score += 20;
    if (performance.confidence && performance.confidence > 70) score += 20;
    
    if (score >= 80) return { level: 'Excelente', color: 'bg-green-500', icon: Trophy };
    if (score >= 60) return { level: 'Bom', color: 'bg-blue-500', icon: Star };
    if (score >= 40) return { level: 'Regular', color: 'bg-yellow-500', icon: Target };
    return { level: 'Precisa Melhorar', color: 'bg-red-500', icon: TrendingUp };
  };

  const performanceLevel = getPerformanceLevel();
  const PerformanceIcon = performanceLevel.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {actuallyCorrect ? (
              <>
                <Trophy className="text-green-500" size={24} />
                <span className="text-green-600">Parabéns! Resposta Correta!</span>
              </>
            ) : (
              <>
                <Target className="text-red-500" size={24} />
                <span className="text-red-600">Resposta Incorreta</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={cn(
            "grid w-full grid-cols-3 h-auto",
            isMobile ? "gap-0 p-0.5" : "gap-1 p-1"
          )}>
            <TabsTrigger 
              value="summary"
              className={cn(
                "transition-all duration-200",
                isMobile ? 
                  "px-2 py-2 text-xs min-h-[44px] leading-tight whitespace-nowrap" : 
                  "px-3 py-2 text-sm min-h-[40px]"
              )}
            >
              {tabTitles.summary}
            </TabsTrigger>
            <TabsTrigger 
              value="analysis"
              className={cn(
                "transition-all duration-200",
                isMobile ? 
                  "px-2 py-2 text-xs min-h-[44px] leading-tight whitespace-nowrap" : 
                  "px-3 py-2 text-sm min-h-[40px]"
              )}
            >
              {tabTitles.analysis}
            </TabsTrigger>
            <TabsTrigger 
              value="insights"
              className={cn(
                "transition-all duration-200",
                isMobile ? 
                  "px-2 py-2 text-xs min-h-[44px] leading-tight whitespace-nowrap" : 
                  "px-3 py-2 text-sm min-h-[40px]"
              )}
            >
              {tabTitles.insights}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            {/* Performance Header */}
            <Card className={`border-2 ${actuallyCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${performanceLevel.color}`}>
                      <PerformanceIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Performance: {performanceLevel.level}</h3>
                      <p className="text-gray-600">Pontuação baseada em precisão, tempo e ajudas</p>
                    </div>
                  </div>
                  {performance.confidence && (
                    <Badge className="bg-purple-100 text-purple-800 px-3 py-1">
                      Confiança: {performance.confidence}%
                    </Badge>
                  )}
                </div>

                {/* Métricas Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <Trophy className="text-yellow-500 mx-auto mb-2" size={24} />
                    <div className="text-2xl font-bold">{actuallyCorrect ? performance.points : 0}</div>
                    <div className="text-xs text-gray-600">Pontos</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <Clock className="text-blue-500 mx-auto mb-2" size={24} />
                    <div className="text-2xl font-bold">{formatTime(performance.timeSpent)}</div>
                    <div className="text-xs text-gray-600">Tempo</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <Zap className="text-purple-500 mx-auto mb-2" size={24} />
                    <div className="text-2xl font-bold">{performance.helpUsed.length}</div>
                    <div className="text-xs text-gray-600">Ajudas</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <Star className="text-orange-500 mx-auto mb-2" size={24} />
                    <div className="text-2xl font-bold">{actuallyCorrect ? "100%" : "0%"}</div>
                    <div className="text-xs text-gray-600">Precisão</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Answer Review */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Revisão da Resposta
                </h3>
                
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border bg-gray-50">
                    <span className="font-medium text-gray-700">Sua resposta:</span>
                    <p className={`mt-1 ${actuallyCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedAnswer}
                    </p>
                  </div>
                  
                  {!actuallyCorrect && (
                    <div className="p-3 rounded-lg border bg-green-50">
                      <span className="font-medium text-gray-700">Resposta correta:</span>
                      <p className="text-green-600 mt-1">{correctAnswer}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            {/* Feedback da Alternativa */}
            {selectedFeedback && (
              <Card className={`${actuallyCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <CardContent className="p-4">
                  <h4 className={`font-medium mb-2 flex items-center gap-2 ${
                    actuallyCorrect ? 'text-green-800' : 'text-red-800'
                  }`}>
                    <Brain className="h-5 w-5" />
                    Feedback da sua resposta:
                  </h4>
                  <p className={`text-sm leading-relaxed ${
                    actuallyCorrect ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {selectedFeedback}
                  </p>
                </CardContent>
              </Card>
            )}
            
            {/* Explicação Detalhada */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Explicação Detalhada:
                </h4>
                <p className="text-blue-700 text-sm leading-relaxed whitespace-pre-line">
                  {explanation}
                </p>
              </CardContent>
            </Card>

            {/* Penalizações */}
            {(performance.penalty > 0 || performance.helpUsed.length > 0) && (
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <h4 className="font-medium text-orange-800 mb-2">Análise de Ajudas e Penalizações</h4>
                  
                  {performance.penalty > 0 && (
                    <div className="mb-3">
                      <span className="text-orange-700 font-medium">Penalizações:</span>
                      <span className="text-orange-600 ml-2">-{performance.penalty} pontos</span>
                    </div>
                  )}
                  
                  {performance.helpUsed.length > 0 && (
                    <div>
                      <div className="text-orange-700 font-medium mb-1">Ajudas utilizadas:</div>
                      <div className="flex gap-1 flex-wrap">
                        {performance.helpUsed.map((help, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {help}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Insights de Aprendizado
                </h3>
                
                <div className="space-y-4">
                  {/* Performance Insights */}
                  <div className="bg-white rounded-lg p-4 border">
                    <h4 className="font-medium mb-2">Análise de Performance</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {actuallyCorrect && <li>✅ Excelente! Você demonstrou conhecimento sólido neste caso.</li>}
                      {performance.timeSpent < 60 && <li>⚡ Muito rápido! Cuidado para não perder detalhes importantes.</li>}
                      {performance.timeSpent > 300 && <li>🤔 Tomou tempo para analisar - isso é positivo para casos complexos.</li>}
                      {performance.helpUsed.length === 0 && <li>🎯 Resolveu sem ajudas - demonstra confiança no conhecimento.</li>}
                      {performance.helpUsed.length > 2 && <li>💡 Muitas ajudas utilizadas - considere revisar este tópico.</li>}
                    </ul>
                  </div>

                  {/* Recomendações */}
                  <div className="bg-white rounded-lg p-4 border">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4 text-blue-600" />
                      Próximos Passos
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {!actuallyCorrect && <li>📚 Revise os conceitos relacionados a este caso</li>}
                      <li>🔄 Pratique casos similares para reforçar o aprendizado</li>
                      <li>🎯 Continue praticando para melhorar sua precisão</li>
                      {performance.confidence && performance.confidence < 50 && (
                        <li>💪 Trabalhe na confiança - estude mais este tópico</li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={onNextCase}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            <ArrowRight size={16} className="mr-2" />
            Próximo Caso
          </Button>
          
          <Button
            onClick={onReviewCase}
            variant="outline"
            className="flex-1"
          >
            <RotateCcw size={16} className="mr-2" />
            Revisar Caso
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
