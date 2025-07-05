import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEventCases } from "@/hooks/useEventCases";
import { useEventProgress } from "@/hooks/useEventProgress";
import { useShuffledAnswers } from "@/hooks/useShuffledAnswers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getLetter } from "@/utils/quiz";
import clsx from "clsx";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/useResponsive";
import { 
  Clock, Trophy, Target, Zap, CheckCircle, XCircle, 
  ArrowRight, Timer, Play, Flag, Home, Activity, Award,
  ChevronLeft, X, ZoomIn, ZoomOut, RotateCcw, Eye, User, Brain, Lightbulb
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
  const [imageZoom, setImageZoom] = useState(1);
  const [caseImages, setCaseImages] = useState<Array<{ url: string; legend?: string }>>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Função para buscar imagens do caso atual
  const fetchCaseImages = async (caseId: string) => {
    try {
      const caseData = cases.find(c => c.id === caseId);
      if (caseData?.image_url && Array.isArray(caseData.image_url)) {
        const images = caseData.image_url.map((url: string, index: number) => ({
          url,
          legend: `Imagem ${index + 1}`
        }));
        setCaseImages(images);
      }
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
      setCaseImages([]);
    }
  };

  // Navegação de imagens
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % caseImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + caseImages.length) % caseImages.length);
  };

  const resetImageView = () => {
    setImageZoom(1);
  };

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

  const currentCase = cases[currentCaseIndex];

  // Set current case based on progress and fetch images
  useEffect(() => {
    if (progress && progress.current_case_index !== undefined) {
      setCurrent(progress.current_case_index);
    }
  }, [progress]);

  // Fetch images when current case changes
  useEffect(() => {
    if (currentCase?.id) {
      fetchCaseImages(currentCase.id);
    }
  }, [currentCase?.id, cases]);
  const isLastCase = currentCaseIndex >= cases.length - 1;
  const progressPercentage = cases.length > 0 ? (currentCaseIndex / cases.length) * 100 : 0;
  
  // Use shuffled answers for proper randomization
  const shuffled = useShuffledAnswers(currentCase);
  const shuffledOptions = shuffled?.options || currentCase?.answer_options || [];

  const handleStartEvent = async () => {
    const result = await startParticipation();
    if (result) {
      setStartTime(Date.now());
    }
  };

  const handleAnswerSubmit = async () => {
    if (selectedAnswer === null || !currentCase) return;

    // CORREÇÃO CRÍTICA: Validação baseada em texto, não índices
    const selectedText = shuffledOptions[selectedAnswer] || '';
    const originalCorrectText = currentCase.answer_options?.[currentCase.correct_answer_index] || '';
    const isCorrect = selectedText === originalCorrectText;
    
    // ✅ CORREÇÃO: Usar pontuação direta sem multiplicador de confiança  
    const basePoints = currentCase.points || (currentCase.difficulty_level * 5) || 10;
    const pointsEarned = isCorrect ? basePoints : 0;
    const caseTimeSpent = Math.floor((Date.now() - startTime) / 1000) - timeSpent;

    console.log('🎯 Dados para validação:', {
      selectedIndex: selectedAnswer,
      selectedText,
      originalCorrectText,
      isCorrect,
      isShuffled: !!shuffled
    });

    const result = await updateProgress(isCorrect, pointsEarned, caseTimeSpent);
    
    if (result) {
      setLastResult({
        isCorrect,
        pointsEarned,
        newScore: result.new_score,
        newRank: result.new_rank,
        accuracy: result.accuracy,
        explanation: currentCase.explanation,
        correctAnswer: originalCorrectText
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

  function getDifficultyColor(level: number) {
    switch (level) {
      case 1: return "bg-green-500";
      case 2: return "bg-yellow-500"; 
      case 3: return "bg-orange-500";
      case 4: return "bg-red-500";
      default: return "bg-gray-500";
    }
  }

  if (casesLoading || progressLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6]">
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

  // SISTEMA INDEPENDENTE: Eventos permitem TODOS os casos (novos + revisões)
  if (!casesLoading && cases.length === 0) {
    console.warn(`⚠️ Evento ${eventId} sem casos carregados - aguardando...`);
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-center">
            <Timer className="h-12 w-12 mx-auto animate-spin mb-4" />
            <h2 className="text-2xl font-bold mb-2">Carregando Casos...</h2>
            <p className="text-cyan-100">Preparando casos para o evento</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasStarted && !isCompleted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6]">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header RESPONSIVO para Eventos */}
      <div className={cn(
        "relative text-white",
        isMobile ? "p-3" : isTablet ? "p-4" : "p-6",
        showResult 
          ? lastResult?.isCorrect 
            ? "bg-gradient-to-r from-green-600 via-green-700 to-emerald-600"
            : "bg-gradient-to-r from-red-600 via-red-700 to-pink-600"
          : "bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600"
      )}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className={cn("flex items-center", isMobile ? "gap-2" : "gap-4")}>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "text-white hover:bg-white/20 rounded-full min-h-[44px] min-w-[44px]",
                isMobile ? "h-10 w-10" : "h-12 w-12"
              )}
              onClick={() => navigate('/app/eventos')}
            >
              <ChevronLeft className={isMobile ? "h-5 w-5" : "h-6 w-6"} />
            </Button>
            <div className={cn(
              "bg-white/20 rounded-full backdrop-blur-sm",
              isMobile ? "p-2" : "p-3"
            )}>
              <Trophy className={isMobile ? "h-6 w-6" : "h-8 w-8"} />
            </div>
            <div className="flex-1 min-w-0">
              {/* Badges Responsivas */}
              <div className={cn(
                "flex flex-wrap items-center mb-2",
                isMobile ? "gap-1" : "gap-3"
              )}>
                <Badge className={cn(
                  "bg-blue-500 hover:bg-blue-600 text-white font-bold",
                  isMobile ? "px-2 py-1 text-xs" : "px-3 py-1"
                )}>
                  {isMobile ? `${currentCaseIndex + 1}/${cases.length}` : `Caso ${currentCaseIndex + 1} de ${cases.length}`}
                </Badge>
                <Badge className={cn(
                  "text-white font-bold",
                  isMobile ? "px-2 py-1 text-xs" : "px-3 py-1",
                  getDifficultyColor(currentCase?.difficulty_level || 1)
                )}>
                  {isMobile ? `N${currentCase?.difficulty_level || 1}` : `Nível ${currentCase?.difficulty_level || 1}`}
                </Badge>
                <Badge className={cn(
                  "bg-yellow-500 hover:bg-yellow-600 text-white font-bold flex items-center gap-1",
                  isMobile ? "px-2 py-1 text-xs" : "px-3 py-1"
                )}>
                  <Award className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
                  {currentCase?.points || (currentCase?.difficulty_level * 5) || 10} pts
                </Badge>
                <Badge className={cn(
                  "bg-green-100 text-green-700",
                  isMobile ? "px-2 py-1 text-xs" : "px-3 py-1"
                )}>
                  <Trophy className={isMobile ? "h-2 w-2 mr-1" : "h-3 w-3 mr-1"} />
                  {progress?.current_score || 0} pts
                </Badge>
                {showResult && lastResult && (
                  <Badge className={cn(
                    "text-white font-bold flex items-center gap-1",
                    isMobile ? "px-2 py-1 text-xs" : "px-3 py-1",
                    lastResult.isCorrect ? "bg-green-600" : "bg-red-600"
                  )}>
                    {lastResult.isCorrect ? 
                      <CheckCircle className={isMobile ? "h-3 w-3" : "h-4 w-4"} /> : 
                      <XCircle className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
                    }
                    {isMobile ? 
                      (lastResult.isCorrect ? `+${lastResult.pointsEarned}` : "✗") :
                      (lastResult.isCorrect ? `+${lastResult.pointsEarned} pts` : "Incorreto")
                    }
                  </Badge>
                )}
              </div>
              <h1 className={cn(
                "font-bold text-white mb-1",
                isMobile ? "text-lg leading-tight" : isTablet ? "text-xl" : "text-2xl"
              )}>
                {isMobile ? 
                  (event?.name?.slice(0, 25) + (event?.name?.length > 25 ? '...' : '') || "Arena") :
                  (event?.name || "Arena de Eventos")
                }
              </h1>
              <p className={cn(
                "text-blue-100 flex items-center gap-2",
                isMobile ? "text-sm" : "text-base"
              )}>
                <Clock className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
                {formatTime(timeSpent)} • {progress ? Math.round((progress.cases_correct / Math.max(progress.cases_completed, 1)) * 100) : 0}%
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "text-white hover:bg-white/20 rounded-full min-h-[44px] min-w-[44px]",
              isMobile ? "h-10 w-10" : "h-12 w-12"
            )}
            onClick={() => navigate('/app/eventos')}
          >
            <X className={isMobile ? "h-5 w-5" : "h-6 w-6"} />
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className={cn("max-w-7xl mx-auto", isMobile ? "mt-2" : "mt-4")}>
          <Progress value={progressPercentage} className={cn("bg-white/20", isMobile ? "h-2" : "h-3")} />
        </div>
      </div>

      {/* Layout Principal RESPONSIVO */}
      <div className={cn(
        "max-w-7xl mx-auto",
        isMobile ? "flex flex-col" : isTablet ? "flex flex-col lg:flex-row" : "flex"
      )}>
        {showResult ? (
          // Tela de resultado
          <div className="w-full p-4">
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
          </div>
        ) : (
          <>
            {/* Seção de Imagem RESPONSIVA */}
            <div className={cn(
              "bg-white flex flex-col",
              isMobile ? "w-full border-b border-gray-200 p-3" : 
              isTablet ? "w-full lg:w-80 lg:border-r border-b lg:border-b-0 border-gray-200 p-4" :
              "w-80 border-r border-gray-200 p-4"
            )}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Imagem Médica
                </h3>
                {caseImages.length > 1 && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={prevImage}
                      className="h-8 w-8 text-gray-600 hover:text-blue-600"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600 font-medium px-2">
                      {currentImageIndex + 1}/{caseImages.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={nextImage}
                      className="h-8 w-8 text-gray-600 hover:text-blue-600"
                    >
                      <ChevronLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Visualizador de Imagens */}
              <div className="flex-1 relative bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
                {caseImages.length > 0 ? (
                  <div className="relative h-full">
                    <img
                      src={caseImages[currentImageIndex]?.url}
                      alt={`Imagem médica ${currentImageIndex + 1}`}
                      className="w-full h-full object-contain transition-transform duration-200"
                      style={{ transform: `scale(${imageZoom})` }}
                    />
                    
                    {/* Controles de zoom */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => setImageZoom(prev => Math.max(0.5, prev - 0.25))}
                        className="h-8 w-8 bg-white/90 hover:bg-white"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => setImageZoom(prev => Math.min(3, prev + 0.25))}
                        className="h-8 w-8 bg-white/90 hover:bg-white"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={resetImageView}
                        className="h-8 w-8 bg-white/90 hover:bg-white"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Legenda da imagem */}
                    {caseImages[currentImageIndex]?.legend && (
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {caseImages[currentImageIndex].legend}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <Eye className="h-12 w-12 mx-auto mb-2" />
                      <p>Nenhuma imagem disponível</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Achados */}
              {currentCase?.findings && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Achados
                  </h4>
                  <p className="text-blue-700 text-sm leading-relaxed">{currentCase.findings}</p>
                </div>
              )}
            </div>

            {/* Seção Central RESPONSIVA */}
            <div className={cn(
              "flex-1 bg-white",
              isMobile ? "p-3" : isTablet ? "p-4 lg:border-r border-gray-200" : "border-r border-gray-200 p-6"
            )}>
              <div className="space-y-6">
                {/* Título e Descrição */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {currentCase?.title || "Caso Clínico"}
                  </h2>
                  {currentCase?.description && (
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <p className="text-gray-700 leading-relaxed">{currentCase.description}</p>
                    </div>
                  )}
                </div>

                {/* Informações do Paciente */}
                {((currentCase as any)?.patient_age || (currentCase as any)?.patient_gender || (currentCase as any)?.patient_clinical_info) && (
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
                    <h3 className="font-semibold text-cyan-800 mb-3 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Dados do Paciente
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {(currentCase as any)?.patient_age && (
                        <div>
                          <span className="font-medium text-cyan-700">Idade:</span>
                          <span className="text-cyan-600 ml-2">{(currentCase as any).patient_age}</span>
                        </div>
                      )}
                      {(currentCase as any)?.patient_gender && (
                        <div>
                          <span className="font-medium text-cyan-700">Sexo:</span>
                          <span className="text-cyan-600 ml-2">{(currentCase as any).patient_gender}</span>
                        </div>
                      )}
                    </div>
                    {(currentCase as any)?.patient_clinical_info && (
                      <div className="mt-3">
                        <span className="font-medium text-cyan-700">Informações Clínicas:</span>
                        <p className="text-cyan-600 mt-1">{(currentCase as any).patient_clinical_info}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Pergunta Principal */}
                {currentCase?.main_question && (
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Pergunta
                    </h3>
                    <p className="text-orange-700 font-medium">{currentCase.main_question}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Seção de Alternativas RESPONSIVA */}
            <div className={cn(
              "bg-white",
              isMobile ? "w-full p-3 border-t border-gray-200" : 
              isTablet ? "w-full lg:w-96 p-4" : "w-96 p-6"
            )}>
              <div className="space-y-6">
                {/* Informações do Evento */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-800">Status do Evento</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-700">Progresso:</span>
                      <span className="font-medium text-purple-800">{currentCaseIndex + 1}/{cases.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Pontuação:</span>
                      <span className="font-medium text-purple-800">{progress?.current_score || 0} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Precisão:</span>
                      <span className="font-medium text-purple-800">
                        {progress ? Math.round((progress.cases_correct / Math.max(progress.cases_completed, 1)) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alternativas */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-green-600" />
                    Alternativas
                  </h3>
                  <div className="space-y-3">
                    {shuffledOptions.map((option: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedAnswer(index)}
                        className={clsx(
                          "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02]",
                          selectedAnswer === index
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span className={clsx(
                            "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold",
                            selectedAnswer === index
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-600"
                          )}>
                            {getLetter(index)}
                          </span>
                          <span className={clsx(
                            "flex-1 text-sm leading-relaxed",
                            selectedAnswer === index ? "text-blue-800 font-medium" : "text-gray-700"
                          )}>
                            {option}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>


                {/* Botão de Responder RESPONSIVO */}
                <Button
                  onClick={handleAnswerSubmit}
                  disabled={selectedAnswer === null || submitting}
                  className={cn(
                    "w-full font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 min-h-[50px]",
                    isMobile ? "py-3 text-base" : "py-3 text-lg"
                  )}
                >
                  {submitting ? "Enviando..." : "Responder"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}