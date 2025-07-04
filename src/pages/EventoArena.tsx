import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HeaderNav } from "@/components/HeaderNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EnhancedImageViewer } from "@/components/cases/EnhancedImageViewer";
import { ConfidenceSelector } from "@/components/cases/ConfidenceSelector";
import { useEventCases } from "@/hooks/useEventCases";
import { useEventProgress } from "@/hooks/useEventProgress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Clock, Trophy, Target, Zap, CheckCircle, XCircle, 
  ArrowRight, ArrowLeft, Timer, Medal, TrendingUp,
  Play, Flag, Home
} from "lucide-react";

export default function EventoArena() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  if (!eventId) {
    navigate("/app/eventos");
    return null;
  }

  const { cases, loading: casesLoading } = useEventCases(eventId);
  const { 
    progress, 
    loading: progressLoading, 
    submitting,
    startParticipation, 
    updateProgress,
    finishEvent,
    hasStarted,
    isCompleted
  } = useEventProgress(eventId);

  const [event, setEvent] = useState<any>(null);
  const [currentCaseIndex, setCurrent] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [confidence, setConfidence] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Lidar com mudança de imagem
  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentImageIndex(prev => 
        prev > 0 ? prev - 1 : currentCase.image_url.length - 1
      );
    } else {
      setCurrentImageIndex(prev => 
        prev < currentCase.image_url.length - 1 ? prev + 1 : 0
      );
    }
  };
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Timer effect
  useEffect(() => {
    if (!hasStarted || isCompleted) return;
    
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [hasStarted, isCompleted, startTime]);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();
      
      setEvent(data);
    };

    fetchEvent();
  }, [eventId]);

  // Set current case based on progress
  useEffect(() => {
    if (progress && progress.current_case_index !== undefined) {
      setCurrent(progress.current_case_index);
    }
  }, [progress]);

  const currentCase = cases[currentCaseIndex];
  const isLastCase = currentCaseIndex >= cases.length - 1;
  const progressPercentage = cases.length > 0 ? (currentCaseIndex / cases.length) * 100 : 0;

  const handleStartEvent = async () => {
    const result = await startParticipation();
    if (result) {
      setStartTime(Date.now());
    }
  };

  const handleAnswerSubmit = async () => {
    if (selectedAnswer === null || !currentCase) return;

    const isCorrect = selectedAnswer === currentCase.correct_answer_index;
    const basePoints = currentCase.points || 10;
    const confidenceMultiplier = confidence / 10;
    const pointsEarned = isCorrect ? Math.round(basePoints * confidenceMultiplier) : 0;
    const caseTimeSpent = Math.floor((Date.now() - startTime) / 1000) - timeSpent;

    const result = await updateProgress(isCorrect, pointsEarned, caseTimeSpent);
    
    if (result) {
      setLastResult({
        isCorrect,
        pointsEarned,
        newScore: result.new_score,
        newRank: result.new_rank,
        accuracy: result.accuracy,
        explanation: currentCase.explanation,
        correctAnswer: currentCase.answer_options[currentCase.correct_answer_index]
      });
      setShowResult(true);
    }
  };

  const handleNextCase = () => {
    if (isLastCase) {
      finishEvent();
      navigate(`/app/ranking-eventos`);
    } else {
      setCurrent(prev => prev + 1);
      setSelectedAnswer(null);
      setConfidence(1);
      setShowResult(false);
      setStartTime(Date.now());
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (casesLoading || progressLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6]">
        <HeaderNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-center">
            <Timer className="h-12 w-12 mx-auto animate-spin mb-4" />
            <h2 className="text-2xl font-bold mb-2">Carregando Arena...</h2>
            <p className="text-cyan-100">Preparando seu evento</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasStarted && !isCompleted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6]">
        <HeaderNav />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-white/95 backdrop-blur">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <Play className="h-16 w-16 mx-auto text-blue-600 mb-4" />
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {event?.name || "Evento"}
                </h1>
                <p className="text-gray-600 mb-4">
                  {event?.description || "Prepare-se para o desafio!"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Target className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="font-semibold text-gray-800">{cases.length}</div>
                  <div className="text-sm text-gray-600">Casos</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <Trophy className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="font-semibold text-gray-800">{event?.prize_radcoins || 0}</div>
                  <div className="text-sm text-gray-600">RadCoins</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <Clock className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <div className="font-semibold text-gray-800">
                    {event?.duration_minutes ? `${event.duration_minutes}min` : "Livre"}
                  </div>
                  <div className="text-sm text-gray-600">Duração</div>
                </div>
              </div>

              <Button 
                onClick={handleStartEvent}
                disabled={submitting}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
              >
                {submitting ? "Iniciando..." : "Começar Evento"}
                <Play className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6]">
        <HeaderNav />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-white/95 backdrop-blur">
            <CardContent className="p-8 text-center">
              <Flag className="h-16 w-16 mx-auto text-green-600 mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Evento Concluído!</h1>
              <p className="text-gray-600 mb-6">Parabéns por completar todos os casos!</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="font-bold text-2xl text-blue-600">{progress?.current_score}</div>
                  <div className="text-sm text-gray-600">Pontos Finais</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="font-bold text-2xl text-green-600">
                    {progress ? Math.round((progress.cases_correct / progress.cases_completed) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Precisão</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate("/app/ranking-eventos")}>
                  <Trophy className="mr-2 h-4 w-4" />
                  Ver Rankings
                </Button>
                <Button variant="outline" onClick={() => navigate("/app/eventos")}>
                  <Home className="mr-2 h-4 w-4" />
                  Voltar aos Eventos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentCase) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6]">
        <HeaderNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-2xl font-bold mb-2">Nenhum caso encontrado</h2>
            <Button onClick={() => navigate("/app/eventos")} variant="outline">
              Voltar aos Eventos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6]">
      <HeaderNav />
      
      {/* Header com progresso */}
      <div className="bg-white/10 backdrop-blur border-b border-white/20 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Badge className="bg-blue-100 text-blue-700">
                Caso {currentCaseIndex + 1} de {cases.length}
              </Badge>
              <Badge className="bg-green-100 text-green-700">
                <Trophy className="h-3 w-3 mr-1" />
                {progress?.current_score || 0} pts
              </Badge>
              {progress && (
                <Badge className="bg-purple-100 text-purple-700">
                  <Medal className="h-3 w-3 mr-1" />
                  #{progress.current_score > 0 ? "?" : "-"}° lugar
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-white">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeSpent)}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>
                  {progress ? Math.round((progress.cases_correct / Math.max(progress.cases_completed, 1)) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
          
          <Progress value={progressPercentage} className="h-2 bg-white/20" />
        </div>
      </div>

      <main className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
          {showResult ? (
            // Tela de resultado
            <Card className="bg-white/95 backdrop-blur">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  {lastResult?.isCorrect ? (
                    <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
                  ) : (
                    <XCircle className="h-16 w-16 mx-auto text-red-600 mb-4" />
                  )}
                  
                  <h2 className={`text-3xl font-bold mb-2 ${
                    lastResult?.isCorrect ? "text-green-600" : "text-red-600"
                  }`}>
                    {lastResult?.isCorrect ? "Correto!" : "Incorreto"}
                  </h2>
                  
                  <p className="text-gray-600 mb-4">
                    {lastResult?.isCorrect ? `+${lastResult.pointsEarned} pontos` : "0 pontos"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="font-bold text-lg text-blue-600">{lastResult?.newScore}</div>
                    <div className="text-sm text-gray-600">Pontuação Total</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="font-bold text-lg text-green-600">#{lastResult?.newRank || "?"}</div>
                    <div className="text-sm text-gray-600">Posição Atual</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="font-bold text-lg text-purple-600">{lastResult?.accuracy}%</div>
                    <div className="text-sm text-gray-600">Precisão</div>
                  </div>
                </div>

                {!lastResult?.isCorrect && (
                  <div className="bg-yellow-50 p-4 rounded-lg mb-6 text-left">
                    <h3 className="font-semibold text-yellow-800 mb-2">Resposta Correta:</h3>
                    <p className="text-yellow-700">{lastResult?.correctAnswer}</p>
                  </div>
                )}

                {lastResult?.explanation && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
                    <h3 className="font-semibold text-blue-800 mb-2">Explicação:</h3>
                    <p className="text-blue-700">{lastResult.explanation}</p>
                  </div>
                )}

                <Button onClick={handleNextCase} size="lg">
                  {isLastCase ? (
                    <>
                      <Flag className="mr-2 h-5 w-5" />
                      Finalizar Evento
                    </>
                  ) : (
                    <>
                      Próximo Caso
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            // Interface redesenhada do caso
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Coluna da esquerda - Imagens e Achados */}
              <div className="xl:col-span-1 space-y-6">
                {/* Visualizador de Imagens */}
                <div className="group">
                  {currentCase.image_url && currentCase.image_url.length > 0 ? (
                    <div className="relative">
                      <EnhancedImageViewer 
                        images={currentCase.image_url}
                        currentIndex={currentImageIndex}
                        onIndexChange={setCurrentImageIndex}
                      />
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-primary/80 to-primary-glow/80 backdrop-blur-sm px-3 py-1 rounded-full">
                          <span className="text-xs font-medium text-white">
                            {currentImageIndex + 1} de {currentCase.image_url.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Card className="bg-gradient-to-br from-background to-muted/50 border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition-all duration-300">
                      <CardContent className="p-12 text-center">
                        <Target className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                        <p className="text-muted-foreground">Nenhuma imagem disponível</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Achados - Nova posição abaixo da imagem */}
                {currentCase.findings && (
                  <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-secondary to-secondary-glow rounded-full"></div>
                        <h3 className="font-bold text-secondary-foreground text-lg">Achados</h3>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-secondary-foreground/80 leading-relaxed">{currentCase.findings}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Coluna da direita - Informações do Caso */}
              <div className="xl:col-span-2 space-y-6">
                <Card className="bg-gradient-to-br from-card to-card/90 backdrop-blur-xl border border-border/50 shadow-2xl">
                  <CardContent className="p-8">
                    {/* Header com badges e título */}
                    <div className="space-y-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground px-3 py-1 text-sm font-medium">
                          {currentCase.specialty}
                        </Badge>
                        <Badge variant="outline" className="border-accent text-accent-foreground px-3 py-1 text-sm">
                          {currentCase.modality}
                        </Badge>
                        <Badge variant="secondary" className="bg-gradient-to-r from-secondary/20 to-secondary-glow/20 text-secondary-foreground px-3 py-1 text-sm">
                          {currentCase.difficulty_level}/5 ⭐
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent leading-tight">
                          {currentCase.title}
                        </h1>
                      </div>
                    </div>

                    {/* Informações Clínicas */}
                    {currentCase.patient_clinical_info && (
                      <div className="mt-6 bg-gradient-to-br from-primary/5 to-primary-glow/5 border border-primary/20 rounded-xl p-6 shadow-inner">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 bg-gradient-to-r from-primary to-primary-glow rounded-full animate-pulse"></div>
                          <h3 className="font-bold text-primary text-lg">Informações Clínicas</h3>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-primary/80 leading-relaxed">{currentCase.patient_clinical_info}</p>
                        </div>
                      </div>
                    )}

                    {/* Pergunta Principal */}
                    <div className="mt-8 space-y-6">
                      <div className="bg-gradient-to-r from-accent/10 to-accent-glow/10 border-l-4 border-accent p-6 rounded-r-xl">
                        <h2 className="text-xl font-bold text-accent-foreground mb-2">
                          {currentCase.main_question}
                        </h2>
                      </div>

                      {/* Opções de Resposta */}
                      <div className="space-y-4">
                        {currentCase.answer_options.map((option, index) => {
                          const isSelected = selectedAnswer === index;
                          return (
                            <button
                              key={index}
                              onClick={() => setSelectedAnswer(index)}
                              className={`group w-full p-5 text-left rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                                isSelected
                                  ? "border-primary shadow-lg shadow-primary/25 bg-gradient-to-br from-primary/10 to-primary-glow/10"
                                  : "border-border hover:border-muted-foreground/40 bg-gradient-to-br from-card to-muted/20 hover:shadow-md"
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                  isSelected
                                    ? "border-primary bg-primary shadow-lg shadow-primary/50"
                                    : "border-muted-foreground/40 group-hover:border-primary/60"
                                }`}>
                                  {isSelected && (
                                    <div className="w-3 h-3 bg-primary-foreground rounded-full animate-scale-in" />
                                  )}
                                </div>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-bold text-lg ${isSelected ? 'text-primary' : 'text-foreground/80'}`}>
                                      {String.fromCharCode(65 + index)}.
                                    </span>
                                  </div>
                                  <p className={`text-base leading-relaxed ${isSelected ? 'text-primary-foreground/90' : 'text-foreground/80'}`}>
                                    {option}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Seletor de Confiança */}
                    <div className="mt-8 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-6 border border-muted-foreground/10">
                      <ConfidenceSelector
                        confidence={confidence * 10}
                        onConfidenceChange={(value) => setConfidence(value / 10)}
                      />
                    </div>

                    {/* Botão de Confirmação */}
                    <div className="mt-8">
                      <Button
                        onClick={handleAnswerSubmit}
                        disabled={selectedAnswer === null || submitting}
                        className="w-full h-14 bg-gradient-to-r from-primary via-primary-glow to-primary hover:from-primary/90 hover:via-primary-glow/90 hover:to-primary/90 text-primary-foreground font-bold text-lg shadow-xl hover:shadow-2xl hover:shadow-primary/25 transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100"
                        size="lg"
                      >
                        <div className="flex items-center gap-3">
                          {submitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                              Salvando...
                            </>
                          ) : (
                            <>
                              Confirmar Resposta
                              <Zap className="h-6 w-6" />
                            </>
                          )}
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}