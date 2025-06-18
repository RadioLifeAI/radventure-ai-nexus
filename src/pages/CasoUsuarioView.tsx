import React, { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowDown, 
  Sparkles, 
  Sword, 
  Smile, 
  Frown, 
  Lightbulb, 
  Book,
  Brain, 
  User, 
  Clock, 
  Target, 
  Zap, 
  SkipForward,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Award,
  Stethoscope,
  Activity,
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertTriangle,
  Info
} from "lucide-react";
import clsx from "clsx";
import { cn } from "@/lib/utils";
import { useShuffledAnswers } from "@/hooks/useShuffledAnswers";
import { Loader } from "@/components/Loader";
import { getLetter } from "@/utils/quiz";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { FeedbackModal } from "@/components/cases/FeedbackModal";
import { useCaseProgress } from "@/hooks/useCaseProgress";
import { useUserHelpAids } from "@/hooks/useUserHelpAids";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// FEEDBACKS GAMIFICADOS
const FEEDBACKS = [
  { title: "Muito Bem! 🎉", icon: <Sparkles className="text-lg text-green-500 inline ml-1" /> },
  { title: "Ótimo raciocínio! 👍", icon: <Smile className="text-lg text-green-500 inline ml-1" /> },
  { title: "Quase lá! Não desista! 💪", icon: <Sword className="text-lg text-yellow-600 inline ml-1" /> },
  { title: "Continue praticando! 🔄", icon: <Frown className="text-lg text-red-500 inline ml-1" /> }
];

function randomFeedback(acertou: boolean) {
  if (acertou) {
    const ok = FEEDBACKS.slice(0, 2);
    return ok[Math.floor(Math.random() * ok.length)];
  }
  return FEEDBACKS[2 + Math.floor(Math.random() * 2)];
}

type CasoUsuarioViewProps = {
  idProp?: string;
  isAdminView?: boolean;
};

export default function CasoUsuarioView(props: CasoUsuarioViewProps) {
  const urlParams = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = props.idProp || urlParams.id;
  const [caso, setCaso] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [performance, setPerformance] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [showTutorHint, setShowTutorHint] = useState(false);
  const [tutorQuestion, setTutorQuestion] = useState("");
  const [tutorHintText, setTutorHintText] = useState("");
  const [showHelpConfirm, setShowHelpConfirm] = useState<string | null>(null);

  // Corrigir chamada do hook - só precisa do caseId
  const {
    helpUsed,
    eliminatedOptions,
    isAnswered,
    helpCredits,
    eliminateOption,
    skipCase,
    useAIHint,
    submitAnswer
  } = useCaseProgress(id || '');

  const { toast } = useToast();
  const { helpAids, consumeHelp, getTutorHint, isGettingHint } = useUserHelpAids();

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

  // Memoizar processamento de imagens
  const caseImages = useMemo(() => {
    if (!caso?.image_url) return [];
    
    try {
      return Array.isArray(caso.image_url)
        ? caso.image_url
        : typeof caso.image_url === "string" && caso.image_url?.startsWith("[")
          ? JSON.parse(caso.image_url)
          : [{ url: caso.image_url }];
    } catch {
      return [{ url: caso.image_url }];
    }
  }, [caso?.image_url]);

  // Memoizar função de cor de dificuldade
  const getDifficultyColor = useMemo(() => {
    const colors: Record<number, string> = {
      1: "bg-green-500",
      2: "bg-yellow-500", 
      3: "bg-orange-500",
      4: "bg-red-500"
    };
    return (level: number) => colors[level] || "bg-gray-500";
  }, []);

  const handleAnswerSubmit = React.useCallback(async () => {
    if (selected === null || isAnswered) return;
    
    const result = await submitAnswer(selected, caso);
    setPerformance(result);
    setShowFeedback(true);
  }, [selected, isAnswered, submitAnswer, caso]);

  const handleNextCase = React.useCallback(() => {
    navigate('/app/casos');
  }, [navigate]);

  const handleReviewCase = React.useCallback(() => {
    setShowFeedback(false);
  }, []);

  const handleBackNavigation = React.useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleEliminateOption = React.useCallback(() => {
    if (!helpAids || helpAids.elimination_aids <= 0) {
      toast({
        title: "Sem créditos",
        description: "Você não possui ajudas de eliminação disponíveis.",
        variant: "destructive"
      });
      return;
    }

    setShowHelpConfirm('eliminate');
  }, [helpAids, toast]);

  const handleSkipCase = React.useCallback(() => {
    if (!helpAids || helpAids.skip_aids <= 0) {
      toast({
        title: "Sem créditos",
        description: "Você não possui ajudas para pular disponíveis.",
        variant: "destructive"
      });
      return;
    }

    setShowHelpConfirm('skip');
  }, [helpAids, toast]);

  const handleRequestTutorHint = React.useCallback(() => {
    if (!helpAids || helpAids.ai_tutor_credits <= 0) {
      toast({
        title: "Sem créditos",
        description: "Você não possui créditos de tutor AI disponíveis.",
        variant: "destructive"
      });
      return;
    }

    setShowTutorHint(true);
  }, [helpAids, toast]);

  const confirmHelpAction = React.useCallback(() => {
    if (showHelpConfirm === 'eliminate') {
      const availableOptions = [0, 1, 2, 3].filter(i => 
        i !== caso.correct_answer_index && !eliminatedOptions.includes(i)
      );

      if (availableOptions.length === 0) return;

      const randomIndex = availableOptions[Math.floor(Math.random() * availableOptions.length)];
      eliminateOption(randomIndex);
      consumeHelp({ aidType: 'elimination' });
    } else if (showHelpConfirm === 'skip') {
      consumeHelp({ aidType: 'skip' });
      skipCase();
      handleNextCase();
    }

    setShowHelpConfirm(null);
  }, [showHelpConfirm, caso, eliminatedOptions, eliminateOption, consumeHelp, skipCase, handleNextCase]);

  const handleTutorHintRequest = React.useCallback(() => {
    getTutorHint(
      { caseData: caso, userQuestion: tutorQuestion },
      {
        onSuccess: (data) => {
          setTutorHintText(data.hint);
          setShowTutorHint(false);
          setTutorQuestion("");
          toast({
            title: "Dica recebida!",
            description: `Créditos restantes: ${data.creditsRemaining}`
          });
        }
      }
    );
  }, [getTutorHint, caso, tutorQuestion, toast]);

  const nextImage = React.useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % caseImages.length);
  }, [caseImages.length]);

  const prevImage = React.useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + caseImages.length) % caseImages.length);
  }, [caseImages.length]);

  const resetImageView = React.useCallback(() => {
    setImageZoom(1);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregando caso médico...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-3 text-base">{error}</div>
      </div>
    );
  }

  if (!caso) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Caso não encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Gamificado com Navegação */}
      <div className={cn(
        "relative text-white p-6",
        isAnswered 
          ? performance?.isCorrect 
            ? "bg-gradient-to-r from-green-600 via-green-700 to-emerald-600"
            : "bg-gradient-to-r from-red-600 via-red-700 to-pink-600"
          : "bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600"
      )}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 rounded-full"
              onClick={handleBackNavigation}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <Stethoscope className="h-8 w-8 text-blue-100" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-3 py-1">
                  {caso.specialty || "Medicina"}
                </Badge>
                <Badge className={cn("text-white font-bold px-3 py-1", getDifficultyColor(caso.difficulty_level || 1))}>
                  Nível {caso.difficulty_level || 1}
                </Badge>
                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-3 py-1 flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  {caso.points || 100} pts
                </Badge>
                {isAnswered && performance && (
                  <Badge className={cn(
                    "text-white font-bold px-3 py-1 flex items-center gap-1",
                    performance.isCorrect ? "bg-green-600" : "bg-red-600"
                  )}>
                    {performance.isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {performance.isCorrect ? `+${performance.points} pts` : "Incorreto"}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {caso.title || "Caso Clínico"}
              </h1>
              <p className="text-blue-100 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                {isAnswered ? "Caso Respondido" : "Caso Interativo"}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20 rounded-full"
            onClick={() => navigate('/app/casos')}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Layout Principal - 3 Colunas */}
      <div className="flex max-w-7xl mx-auto">
        {/* Coluna 1: Imagem Médica */}
        <div className="w-80 bg-white border-r border-gray-200 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Imagem Médica
            </h3>
            {caseImages.length > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevImage}
                  disabled={caseImages.length <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 px-2">
                  {currentImageIndex + 1}/{caseImages.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextImage}
                  disabled={caseImages.length <= 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 relative bg-gray-100 rounded-lg overflow-hidden min-h-[300px]">
            {caseImages.length > 0 ? (
              <div className="relative h-full">
                <img
                  src={typeof caseImages[currentImageIndex] === 'object' ? 
                    caseImages[currentImageIndex].url : caseImages[currentImageIndex]}
                  alt={`Imagem médica ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain transition-transform duration-300"
                  style={{ transform: `scale(${imageZoom})` }}
                />
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setImageZoom(prev => Math.min(prev + 0.2, 3))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setImageZoom(prev => Math.max(prev - 0.2, 0.5))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={resetImageView}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Target className="h-16 w-16 mb-4 text-gray-300" />
                <p className="text-center">Nenhuma imagem disponível</p>
                <p className="text-sm text-center mt-2">
                  Imagens médicas aparecerão aqui
                </p>
              </div>
            )}
          </div>

          {/* Legenda da Imagem */}
          {caseImages.length > 0 && typeof caseImages[currentImageIndex] === 'object' && caseImages[currentImageIndex].legend && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">
                {caseImages[currentImageIndex].legend}
              </p>
            </div>
          )}
        </div>

        {/* Coluna 2: Caso Clínico Principal */}
        <div className="flex-1 p-6 overflow-y-auto max-h-screen">
          {/* História Clínica */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 mb-6 border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500 rounded-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-green-800">História Clínica</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="text-xs text-green-600 font-semibold mb-1">IDADE</div>
                <div className="text-lg font-bold text-green-800">{caso.patient_age || "--"}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="text-xs text-green-600 font-semibold mb-1">GÊNERO</div>
                <div className="text-lg font-bold text-green-800">{caso.patient_gender || "--"}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200 flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-xs text-green-600 font-semibold">DURAÇÃO</div>
                  <div className="text-sm font-bold text-green-800">{caso.symptoms_duration || "--"}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="text-sm text-green-900 leading-relaxed">
                {caso.patient_clinical_info || caso.findings || "Informações clínicas não disponíveis"}
              </div>
            </div>
          </div>

          {/* Pergunta Principal */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-blue-800">Pergunta Principal</h3>
            </div>
            
            <div className="bg-white rounded-lg p-4 mb-6 border border-blue-200">
              <p className="text-lg font-medium text-blue-900 leading-relaxed">
                {caso.main_question || "Pergunta não definida"}
              </p>
            </div>

            {/* Alternativas */}
            <div className="space-y-3">
              <div className="text-sm font-semibold text-blue-800 mb-3">
                {isAnswered ? "Sua resposta:" : "Selecione sua resposta:"}
              </div>
              {(shuffled?.options || caso.answer_options || []).map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => !isAnswered && !eliminatedOptions.includes(index) && setSelected(index)}
                  disabled={isAnswered || eliminatedOptions.includes(index)}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 text-left transition-all duration-300 flex items-center gap-3",
                    eliminatedOptions.includes(index)
                      ? "border-gray-300 bg-gray-100 text-gray-400 opacity-50"
                      : isAnswered
                        ? selected === index
                          ? index === correctIdx
                            ? "border-green-500 bg-green-50 text-green-800"
                            : "border-red-500 bg-red-50 text-red-800"
                          : index === correctIdx
                            ? "border-green-500 bg-green-100 text-green-800"
                            : "border-gray-200 bg-gray-50 text-gray-600 opacity-70"
                        : selected === index
                          ? "border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-200"
                          : "border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50 hover:shadow-md transform hover:-translate-y-1"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                    eliminatedOptions.includes(index)
                      ? "bg-gray-300 text-gray-500"
                      : isAnswered
                        ? selected === index
                          ? index === correctIdx
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                          : index === correctIdx
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-gray-600"
                        : selected === index
                          ? "bg-blue-500 text-white"
                          : "bg-blue-100 text-blue-700"
                  )}>
                    {eliminatedOptions.includes(index) ? "✗" : getLetter(index)}
                  </div>
                  <span className="flex-1">{option || "Opção vazia"}</span>
                  {isAnswered && index === correctIdx && (
                    <div className="text-green-600">✓</div>
                  )}
                  {isAnswered && selected === index && index !== correctIdx && (
                    <div className="text-red-600">✗</div>
                  )}
                </button>
              ))}
            </div>

            {/* Botão Responder */}
            {!isAnswered && (
              <Button
                disabled={selected === null}
                onClick={handleAnswerSubmit}
                className="w-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold shadow text-lg py-3 mt-6"
                size="lg"
              >
                Responder
              </Button>
            )}
          </div>

          {/* Dica do Tutor AI */}
          {tutorHintText && (
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 mb-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-purple-800">Dica do Tutor AI</h3>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <p className="text-purple-900 leading-relaxed">
                  {tutorHintText}
                </p>
              </div>
            </div>
          )}

          {/* Explicação Detalhada */}
          {isAnswered && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-purple-800">Explicação Detalhada</h3>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <p className="text-purple-900 leading-relaxed whitespace-pre-line">
                  {caso.explanation || "Explicação não disponível"}
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 mt-4">
                <Button onClick={handleNextCase} className="flex-1">
                  Próximo Caso
                </Button>
                <Button variant="outline" onClick={handleReviewCase} className="flex-1">
                  Revisar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Coluna 3: Sistema de Ajudas */}
        <div className="w-64 bg-gradient-to-b from-yellow-50 to-orange-50 border-l border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Lightbulb className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-bold text-yellow-800">Ajudas</h3>
          </div>

          <div className="space-y-3">
            {/* Eliminar Opção */}
            <div className="bg-white rounded-lg p-3 border border-yellow-200 hover:shadow-md transition-shadow">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 border-yellow-300 hover:bg-yellow-50"
                disabled={isAnswered || !helpAids || helpAids.elimination_aids <= 0}
                onClick={handleEliminateOption}
              >
                <Zap className="h-4 w-4 text-yellow-600" />
                <span className="flex-1 text-left">Eliminar Opção</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                  {helpAids?.elimination_aids || 0}
                </Badge>
              </Button>
              <p className="text-xs text-yellow-600 mt-2">Remove uma alternativa incorreta</p>
            </div>

            {/* Pular Questão */}
            <div className="bg-white rounded-lg p-3 border border-orange-200 hover:shadow-md transition-shadow">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 border-orange-300 hover:bg-orange-50"
                disabled={isAnswered || !helpAids || helpAids.skip_aids <= 0}
                onClick={handleSkipCase}
              >
                <SkipForward className="h-4 w-4 text-orange-600" />
                <span className="flex-1 text-left">Pular Questão</span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  {helpAids?.skip_aids || 0}
                </Badge>
              </Button>
              <p className="text-xs text-orange-600 mt-2">Avança sem perder pontos</p>
            </div>

            {/* Tutor AI */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-800">Tutor AI</span>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {helpAids?.ai_tutor_credits || 0}
                </Badge>
              </div>
              <p className="text-xs text-purple-700 mb-3">
                IA especializada em medicina disponível para ajudar
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-purple-300 hover:bg-purple-50"
                disabled={isAnswered || !helpAids || helpAids.ai_tutor_credits <= 0}
                onClick={handleRequestTutorHint}
              >
                <Brain className="h-4 w-4 mr-2" />
                Pedir Dica
              </Button>
            </div>

            {/* Status */}
            <div className="bg-gray-100 rounded-lg p-3 border border-gray-200 mt-6">
              <div className="text-xs text-gray-600 text-center">
                <div className="font-semibold mb-1">
                  {isAnswered ? "✅ RESPONDIDO" : "🎯 ATIVO"}
                </div>
                {isAnswered && performance ? (
                  <div>Pontos ganhos: {performance.points}</div>
                ) : (
                  <div>Resolva para ganhar pontos</div>
                )}
              </div>
            </div>
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
          onReviewCase={handleReviewCase}
        />
      )}

      {/* Modal de Confirmação para Ajudas */}
      <AlertDialog open={!!showHelpConfirm} onOpenChange={() => setShowHelpConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Confirmar uso de ajuda
            </AlertDialogTitle>
            <AlertDialogDescription>
              {showHelpConfirm === 'eliminate' && 
                `Você deseja eliminar uma alternativa incorreta? Isso consumirá 1 crédito de eliminação. Créditos restantes: ${(helpAids?.elimination_aids || 0) - 1}`}
              {showHelpConfirm === 'skip' && 
                `Você deseja pular este caso? Isso consumirá 1 crédito de pular e você não ganhará pontos. Créditos restantes: ${(helpAids?.skip_aids || 0) - 1}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmHelpAction}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal para Pergunta do Tutor AI */}
      <Dialog open={showTutorHint} onOpenChange={setShowTutorHint}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Tutor AI - Solicitar Dica
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Qual sua dúvida sobre este caso? (opcional)
              </label>
              <Textarea
                value={tutorQuestion}
                onChange={(e) => setTutorQuestion(e.target.value)}
                placeholder="Ex: Que achados devo observar na imagem? Qual a fisiopatologia envolvida?"
                className="min-h-20"
              />
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Sobre o Tutor AI:</p>
                  <p>Créditos restantes: {helpAids?.ai_tutor_credits || 0}</p>
                  <p>O tutor fornecerá uma dica educativa sem revelar a resposta diretamente.</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleTutorHintRequest}
                disabled={isGettingHint}
                className="flex-1"
              >
                {isGettingHint ? "Gerando..." : "Obter Dica"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowTutorHint(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
