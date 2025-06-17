
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Home, Sparkles, Lightbulb, BookOpen, Clock, Target } from "lucide-react";
import clsx from "clsx";
import { useShuffledAnswers } from "@/hooks/useShuffledAnswers";
import { Loader } from "@/components/Loader";
import { getLetter } from "@/utils/quiz";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { HelpSystem } from "@/components/cases/HelpSystem";
import { FeedbackModal } from "@/components/cases/FeedbackModal";
import { useCaseProgress } from "@/hooks/useCaseProgress";
import { BackToDashboard } from "@/components/navigation/BackToDashboard";

type CasoUsuarioViewProps = {
  idProp?: string;
  isAdminView?: boolean;
};

export default function CasoUsuarioView(props: CasoUsuarioViewProps) {
  const urlParams = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = props.idProp || urlParams.id;
  const fromSpecialty = searchParams.get('fromSpecialty');
  
  const [caso, setCaso] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [performance, setPerformance] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [startTime] = useState(Date.now());

  const {
    helpUsed,
    eliminatedOptions,
    isAnswered,
    helpCredits,
    eliminateOption,
    skipCase,
    useAIHint,
    submitAnswer
  } = useCaseProgress(id || '', user?.id);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, []);

  useEffect(() => {
    async function fetchCaso() {
      setLoading(true);
      setError(null);
      setCaso(null);

      const { data, error } = await supabase
        .from("medical_cases")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        setError("Erro ao carregar caso.");
        setLoading(false);
        return;
      }
      if (!data) {
        setError("Caso não encontrado.");
        setLoading(false);
        return;
      }
      setCaso(data);
      setLoading(false);
    }
    if (id) fetchCaso();
  }, [id]);

  const shuffled = useShuffledAnswers(caso);
  const correctIdx = shuffled?.correctIndex ?? caso?.correct_answer_index;

  const handleAnswerSubmit = async () => {
    if (selected === null || isAnswered) return;
    
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const result = await submitAnswer(selected, caso);
    setPerformance(result);
    setShowFeedback(true);
  };

  const handleNextCase = async () => {
    if (fromSpecialty) {
      // Buscar próximo caso da mesma especialidade
      const { data: nextCase } = await supabase
        .from('medical_cases')
        .select('id')
        .eq('specialty', fromSpecialty)
        .neq('id', id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      
      if (nextCase) {
        navigate(`/caso/${nextCase.id}?fromSpecialty=${encodeURIComponent(fromSpecialty)}`);
      } else {
        navigate('/central-casos');
      }
    } else {
      navigate('/central-casos');
    }
  };

  const handleBackNavigation = () => {
    if (fromSpecialty) {
      navigate(`/central-casos?specialty=${encodeURIComponent(fromSpecialty)}`);
    } else {
      navigate('/dashboard');
    }
  };

  let caseImages: Array<{ url: string; legend?: string }> = [];
  try {
    caseImages = Array.isArray(caso?.image_url)
      ? caso.image_url
      : typeof caso?.image_url === "string" && caso.image_url?.startsWith("[")
        ? JSON.parse(caso.image_url)
        : !!caso?.image_url ? [{ url: caso.image_url }] : [];
  } catch {
    caseImages = !!caso?.image_url ? [{ url: caso.image_url }] : [];
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] flex items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="text-white mt-4 text-lg">Carregando caso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleBackNavigation}>
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      {/* Header com navegação */}
      <div className="sticky top-0 bg-black/20 backdrop-blur-sm border-b border-white/10 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBackNavigation}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {fromSpecialty ? fromSpecialty : 'Dashboard'}
              </Button>
              
              {fromSpecialty && (
                <Badge variant="outline" className="border-cyan-400 text-cyan-400">
                  {fromSpecialty}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-cyan-200">
              <Clock className="h-4 w-4" />
              <span>{Math.round((Date.now() - startTime) / 1000)}s</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna esquerda - Imagem e ajudas */}
          <div className="lg:col-span-1 space-y-4">
            {/* Imagem do caso */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="aspect-square bg-black rounded-lg overflow-hidden flex items-center justify-center">
                  {caseImages.length > 0 ? (
                    <Carousel className="w-full">
                      <CarouselContent>
                        {caseImages.map((img, idx) => (
                          <CarouselItem key={idx}>
                            <img
                              src={img.url}
                              alt={`Imagem do caso ${idx + 1}`}
                              className="w-full h-full object-contain"
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                  ) : (
                    <div className="text-center text-gray-400">
                      <BookOpen className="h-12 w-12 mx-auto mb-2" />
                      <p>Sem imagem</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sistema de ajudas */}
            <HelpSystem
              maxElimination={caso?.max_elimination || 0}
              canSkip={caso?.can_skip || false}
              skipPenalty={caso?.skip_penalty_points || 0}
              eliminationPenalty={caso?.elimination_penalty_points || 0}
              aiHintEnabled={caso?.ai_hint_enabled || false}
              onEliminateOption={eliminateOption}
              onSkip={skipCase}
              onAIHint={useAIHint}
              eliminatedOptions={eliminatedOptions}
              helpCredits={helpCredits}
            />
          </div>

          {/* Coluna direita - Conteúdo do caso */}
          <div className="lg:col-span-2 space-y-6">
            {/* Título e informações */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Lightbulb className="h-8 w-8 text-yellow-400" />
                  {caso?.title}
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-blue-500/20 text-blue-200">
                    {caso?.specialty || 'Geral'}
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-200">
                    {caso?.modality || 'Diversos'}
                  </Badge>
                  {caso?.difficulty_level && (
                    <Badge className="bg-orange-500/20 text-orange-200">
                      Nível {caso.difficulty_level}
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* História clínica */}
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 backdrop-blur-sm border-green-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-100">
                  <BookOpen className="h-5 w-5 text-green-400" />
                  História Clínica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-green-100 leading-relaxed">
                    {caso?.patient_clinical_info || caso?.findings}
                  </p>
                  
                  {caso?.patient_gender && (
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="border-green-300 text-green-200">
                        {caso.patient_gender}, {caso.patient_age} anos
                      </Badge>
                      {caso?.symptoms_duration && (
                        <Badge variant="outline" className="border-green-300 text-green-200">
                          Sintomas há {caso.symptoms_duration}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pergunta e alternativas */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-100">
                  <Target className="h-5 w-5 text-cyan-400" />
                  Pergunta Principal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-lg font-medium text-white mb-4">
                    {caso?.main_question}
                  </p>
                  
                  <div className="space-y-3">
                    {(shuffled?.options || caso?.answer_options || []).map((opt: string, idx: number) => {
                      const isEliminated = eliminatedOptions.includes(idx);
                      const isSelected = selected === idx;
                      const isCorrect = isAnswered && idx === correctIdx;
                      const isWrong = isAnswered && isSelected && idx !== correctIdx;
                      
                      return (
                        <button
                          key={idx}
                          className={clsx(
                            "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 font-medium",
                            isEliminated && "opacity-30 line-through cursor-not-allowed bg-gray-600/20 border-gray-500",
                            !isEliminated && !isAnswered && "hover:bg-white/10 border-white/20 text-white",
                            !isEliminated && !isAnswered && isSelected && "bg-cyan-500/20 border-cyan-400 text-cyan-100",
                            isCorrect && "bg-green-500/20 border-green-400 text-green-100",
                            isWrong && "bg-red-500/20 border-red-400 text-red-100"
                          )}
                          disabled={isAnswered || isEliminated}
                          onClick={() => !isEliminated && setSelected(idx)}
                        >
                          <span className="font-bold mr-3">{getLetter(idx)})</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  
                  {!isAnswered && (
                    <Button
                      disabled={selected === null}
                      onClick={handleAnswerSubmit}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 text-lg"
                      size="lg"
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      Responder
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de feedback */}
      {showFeedback && performance && (
        <FeedbackModal
          open={showFeedback}
          onClose={() => setShowFeedback(false)}
          isCorrect={performance.isCorrect}
          correctAnswer={shuffled?.options?.[correctIdx] || caso?.answer_options?.[correctIdx] || ''}
          selectedAnswer={shuffled?.options?.[selected!] || caso?.answer_options?.[selected!] || ''}
          explanation={caso?.explanation || 'Explicação não disponível.'}
          performance={performance}
          onNextCase={handleNextCase}
          onReviewCase={() => setShowFeedback(false)}
        />
      )}
    </div>
  );
}
