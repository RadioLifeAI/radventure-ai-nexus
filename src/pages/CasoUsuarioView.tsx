
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Home, Sparkles, Lightbulb, BookOpen, Clock, Target, User, Calendar, Timer } from "lucide-react";
import clsx from "clsx";
import { useShuffledAnswers } from "@/hooks/useShuffledAnswers";
import { Loader } from "@/components/Loader";
import { getLetter } from "@/utils/quiz";
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
    <div className="min-h-screen bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6]">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBackNavigation}
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {fromSpecialty ? fromSpecialty : 'Dashboard'}
            </Button>
            
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500 text-white">
                {caso?.specialty || 'Pneumologia'}
              </Badge>
              <Badge className="bg-orange-500 text-white">
                Avançado
              </Badge>
              <Badge className="bg-yellow-500 text-white flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                5 pts
              </Badge>
              <Badge className="bg-green-600 text-white flex items-center gap-1">
                <Target className="h-3 w-3" />
                +5 pts
              </Badge>
            </div>
          </div>

          <div className="text-white text-right">
            <h1 className="text-xl font-bold">{caso?.title}</h1>
            <div className="text-sm opacity-90 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {Math.round((Date.now() - startTime) / 1000)}s
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Image */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Imagem Médica</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-black rounded-lg overflow-hidden flex items-center justify-center">
                  {caseImages.length > 0 ? (
                    <img
                      src={caseImages[0].url}
                      alt="Imagem do caso"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <BookOpen className="h-12 w-12 mx-auto mb-2" />
                      <p>Sem imagem</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Help System */}
            <div className="mt-4">
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
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Clinical History */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <User className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg text-green-800">História Clínica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <div className="text-xs text-green-600 font-medium uppercase tracking-wide">Idade</div>
                    <div className="text-lg font-bold text-green-800">{caso?.patient_age || '45'}</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <div className="text-xs text-green-600 font-medium uppercase tracking-wide">Gênero</div>
                    <div className="text-lg font-bold text-green-800">{caso?.patient_gender || 'Masculino'}</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 text-center flex flex-col items-center">
                    <Clock className="h-4 w-4 text-green-600 mb-1" />
                    <div className="text-xs text-green-600 font-medium uppercase tracking-wide">Duração</div>
                    <div className="text-sm font-bold text-green-800">{caso?.symptoms_duration || '3 dias'}</div>
                  </div>
                </div>

                <div className="bg-white/60 rounded-lg p-4">
                  <p className="text-green-800 leading-relaxed">
                    {caso?.patient_clinical_info || caso?.findings}
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-xs text-yellow-700 font-semibold uppercase tracking-wide mb-2">Achados Principais</div>
                  <p className="text-yellow-800">
                    {caso?.findings}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Question */}
            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <Target className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg text-blue-800">Pergunta Principal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg font-medium text-gray-800">
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
                          isEliminated && "opacity-30 line-through cursor-not-allowed bg-gray-100 border-gray-300",
                          !isEliminated && !isAnswered && "hover:bg-blue-50 border-gray-200 text-gray-800 hover:border-blue-300",
                          !isEliminated && !isAnswered && isSelected && "bg-blue-100 border-blue-400 text-blue-800",
                          isCorrect && "bg-green-100 border-green-400 text-green-800",
                          isWrong && "bg-red-100 border-red-400 text-red-800"
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
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 text-lg"
                    size="lg"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Responder
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
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
