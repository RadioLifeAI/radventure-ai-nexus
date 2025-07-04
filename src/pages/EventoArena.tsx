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
            // Interface do caso
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Coluna da esquerda - Imagens */}
              <div className="space-y-4">
                {currentCase.image_url && currentCase.image_url.length > 0 ? (
                  <EnhancedImageViewer 
                    images={currentCase.image_url}
                    currentIndex={currentImageIndex}
                    onIndexChange={setCurrentImageIndex}
                  />
                ) : (
                  <Card className="bg-white/95 backdrop-blur p-8 text-center">
                    <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Nenhuma imagem disponível</p>
                  </Card>
                )}
              </div>

              {/* Coluna da direita - Caso */}
              <div className="space-y-6">
                <Card className="bg-white/95 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge>{currentCase.specialty}</Badge>
                      <Badge variant="outline">{currentCase.modality}</Badge>
                      <Badge variant="secondary">
                        {currentCase.difficulty_level}/5 ⭐
                      </Badge>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                      {currentCase.title}
                    </h1>

                    {currentCase.patient_clinical_info && (
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <h3 className="font-semibold text-blue-800 mb-2">Informações Clínicas:</h3>
                        <p className="text-blue-700">{currentCase.patient_clinical_info}</p>
                      </div>
                    )}

                    {currentCase.findings && (
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h3 className="font-semibold text-gray-800 mb-2">Achados:</h3>
                        <p className="text-gray-700">{currentCase.findings}</p>
                      </div>
                    )}

                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        {currentCase.main_question}
                      </h2>

                      <div className="space-y-3">
                        {currentCase.answer_options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedAnswer(index)}
                            className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                              selectedAnswer === index
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                                selectedAnswer === index
                                  ? "border-blue-500 bg-blue-500"
                                  : "border-gray-300"
                              }`}>
                                {selectedAnswer === index && (
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                )}
                              </div>
                              <span className="font-medium text-gray-800">
                                {String.fromCharCode(65 + index)}.
                              </span>
                              <span className="ml-2 text-gray-700">{option}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <ConfidenceSelector
                        confidence={confidence * 10}
                        onConfidenceChange={(value) => setConfidence(value / 10)}
                      />
                    </div>

                    <Button
                      onClick={handleAnswerSubmit}
                      disabled={selectedAnswer === null || submitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      size="lg"
                    >
                      {submitting ? "Salvando..." : "Confirmar Resposta"}
                      <Zap className="ml-2 h-5 w-5" />
                    </Button>
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