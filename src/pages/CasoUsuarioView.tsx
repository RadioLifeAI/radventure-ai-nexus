import React, { useEffect, useState } from "react";
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
  Info,
  Eye
} from "lucide-react";
import clsx from "clsx";
import { cn } from "@/lib/utils";
import { useShuffledAnswers } from "@/hooks/useShuffledAnswers";
import { Loader } from "@/components/Loader";
import { getLetter } from "@/utils/quiz";
import { useResponsive } from "@/hooks/useResponsive";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { FeedbackModal } from "@/components/cases/FeedbackModal";
import { useCaseProgress } from "@/hooks/useCaseProgress";
import { useUserHelpAids } from "@/hooks/useUserHelpAids";
import { useToast } from "@/components/ui/use-toast";
import { ReviewModeBadge } from "@/components/cases/ReviewModeBadge";
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

import { ReportCaseButton } from "@/components/cases/ReportCaseButton";
import { ReportCaseModal } from "@/components/cases/ReportCaseModal";

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
  const [tutorHintText, setTutorHintText] = useState("");
  const [showHelpConfirm, setShowHelpConfirm] = useState<string | null>(null);
  const [caseImages, setCaseImages] = useState<Array<{ url: string; legend?: string }>>([]);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const {
    helpUsed,
    eliminatedOptions,
    eliminationCount,
    canEliminate,
    isAnswered,
    eliminateOption,
    skipCase,
    useAIHint,
    submitAnswer,
    isReview,
    reviewStatus,
    previousAnswer,
    previousCorrect
  } = useCaseProgress(id || '');

  const { toast } = useToast();
  const { helpAids, consumeHelp, getTutorHint, isGettingHint } = useUserHelpAids();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // CORREÇÃO: Busca híbrida de imagens usando a nova função SQL
  const fetchCaseImages = async (caseId: string) => {
    try {
      console.log('🖼️ Buscando imagens do caso:', caseId);
      
      // Usar a nova função SQL que busca em ambos os sistemas
      const { data, error } = await supabase.rpc('get_case_images_unified', {
        p_case_id: caseId
      });

      if (error) {
        console.error('❌ Erro ao buscar imagens unificadas:', error);
        return [];
      }

      console.log('✅ Imagens encontradas:', Array.isArray(data) ? data.length : 0);
      
      // CORREÇÃO: Validação e casting seguro de tipos
      if (Array.isArray(data)) {
        return data.filter((item: any): item is { url: string; legend?: string } => {
          return item && typeof item === 'object' && typeof item.url === 'string';
        });
      }
      
      return [];
    } catch (error) {
      console.error('❌ Erro na busca híbrida de imagens:', error);
      return [];
    }
  };

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
      
      // CORREÇÃO: Buscar imagens usando sistema híbrido com tipo correto
      const images = await fetchCaseImages(id);
      setCaseImages(images);
      
      setLoading(false);
    }
    if (id) fetchCaso();
  }, [id]);

  const shuffled = useShuffledAnswers(caso);
  const correctIdx = shuffled?.correctIndex ?? caso?.correct_answer_index;

  const handleAnswerSubmit = async () => {
    if (selected === null || isAnswered) return;
    
    // CORREÇÃO CRÍTICA: Validação baseada em texto, não índices
    const selectedText = shuffled?.options?.[selected] || caso?.answer_options?.[selected] || '';
    const originalCorrectText = caso?.answer_options?.[caso?.correct_answer_index] || '';
    
    console.log('🎯 Dados para validação:', {
      selectedIndex: selected,
      selectedText,
      originalCorrectText,
      isShuffled: !!shuffled,
      correctIdx
    });
    
    const result = await submitAnswer(selected, {
      ...caso,
      // Passar textos para validação correta e arrays originais para feedback
      user_selected_text: selectedText,
      original_correct_text: originalCorrectText,
      answer_options: caso.answer_options, // Array original para buscar feedback
      answer_feedbacks: caso.answer_feedbacks // Array original de feedbacks
    });
    
    setPerformance(result);
    setShowFeedback(true);
  };

  const handleNextCase = () => {
    navigate('/app/casos');
  };

  const handleReviewCase = () => {
    setShowFeedback(false);
  };

  const handleBackNavigation = () => {
    navigate(-1);
  };

  // CORREÇÃO: Eliminar alternativa com limite de 2 usos
  const handleEliminateOption = () => {
    if (isReview) {
      // Em modo revisão, permitir eliminação gratuita para fins educativos
      setShowHelpConfirm('eliminate_free');
      return;
    }

    if (!helpAids || helpAids.elimination_aids <= 0) {
      toast({
        title: "Sem créditos",
        description: "Você não possui ajudas de eliminação disponíveis.",
        variant: "destructive"
      });
      return;
    }

    if (!canEliminate) {
      toast({
        title: "Limite atingido",
        description: "Você já eliminou 2 alternativas neste caso.",
        variant: "destructive"
      });
      return;
    }

    setShowHelpConfirm('eliminate');
  };

  const handleSkipCase = () => {
    if (isReview) {
      toast({
        title: "Modo Revisão",
        description: "Pular não está disponível em modo revisão.",
        variant: "destructive"
      });
      return;
    }

    if (!helpAids || helpAids.skip_aids <= 0) {
      toast({
        title: "Sem créditos",
        description: "Você não possui ajudas para pular disponíveis.",
        variant: "destructive"
      });
      return;
    }

    setShowHelpConfirm('skip');
  };

  // CORREÇÃO: Tutor AI automático - sem modal de pergunta
  const handleRequestTutorHint = async () => {
    if (isReview) {
      toast({
        title: "Modo Revisão",
        description: "Tutor AI pago não está disponível em revisão.",
        variant: "destructive"
      });
      return;
    }

    if (!helpAids || helpAids.ai_tutor_credits <= 0) {
      toast({
        title: "Sem créditos",
        description: "Você não possui créditos de tutor AI disponíveis.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🤖 Solicitando dica automática do Tutor AI...');
      
      // Consumir crédito primeiro
      consumeHelp({ aidType: 'ai_tutor' });
      
      const response = await getTutorHint({
        caseData: caso
      });

      console.log('✅ Resposta recebida:', response);

      if (response?.hint) {
        setTutorHintText(response.hint);
        
        toast({
          title: "Dica recebida!",
          description: `Veja a dica abaixo. Créditos restantes: ${response.creditsRemaining || 'N/A'}`,
        });
      } else {
        throw new Error('Resposta inválida do tutor AI');
      }
    } catch (error) {
      console.error('❌ Erro ao solicitar dica:', error);
      toast({
        title: "Erro no Tutor AI",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    }
  };

  const confirmHelpAction = () => {
    if (showHelpConfirm === 'eliminate') {
      // CORREÇÃO: Passar o índice correto para eliminar apenas alternativas incorretas
      eliminateOption(correctIdx);
      consumeHelp({ aidType: 'elimination' });
    } else if (showHelpConfirm === 'eliminate_free') {
      // Eliminação gratuita em modo revisão
      eliminateOption(correctIdx, true);
    } else if (showHelpConfirm === 'skip') {
      consumeHelp({ aidType: 'skip' });
      skipCase();
      handleNextCase();
    }

    setShowHelpConfirm(null);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % caseImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + caseImages.length) % caseImages.length);
  };

  const resetImageView = () => {
    setImageZoom(1);
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

  const handleOpenReport = () => {
    setReportModalOpen(true);
  };

  const handleCloseReport = () => {
    setReportModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Gamificado RESPONSIVO */}
      <div className={cn(
        "relative text-white",
        isMobile ? "p-3" : isTablet ? "p-4" : "p-6",
        isAnswered 
          ? performance?.isCorrect 
            ? "bg-gradient-to-r from-green-600 via-green-700 to-emerald-600"
            : "bg-gradient-to-r from-red-600 via-red-700 to-pink-600"
          : isReview
            ? "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"
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
              onClick={handleBackNavigation}
            >
              <ChevronLeft className={isMobile ? "h-5 w-5" : "h-6 w-6"} />
            </Button>
            <div className={cn(
              "bg-white/20 rounded-full backdrop-blur-sm",
              isMobile ? "p-2" : "p-3"
            )}>
              {isReview ? 
                <Eye className={isMobile ? "h-6 w-6" : "h-8 w-8"} /> : 
                <Stethoscope className={isMobile ? "h-6 w-6" : "h-8 w-8"} />
              }
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
                  {isMobile ? (caso.specialty?.slice(0, 8) || "Med") : (caso.specialty || "Medicina")}
                </Badge>
                <Badge className={cn(
                  "text-white font-bold",
                  isMobile ? "px-2 py-1 text-xs" : "px-3 py-1",
                  getDifficultyColor(caso.difficulty_level || 1)
                )}>
                  {isMobile ? `N${caso.difficulty_level || 1}` : `Nível ${caso.difficulty_level || 1}`}
                </Badge>
                <Badge className={cn(
                  "bg-yellow-500 hover:bg-yellow-600 text-white font-bold flex items-center gap-1",
                  isMobile ? "px-2 py-1 text-xs" : "px-3 py-1"
                )}>
                  <Award className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
                  {caso.points || 100} pts
                </Badge>
                {/* Badges de Status */}
                {isReview && (
                  <ReviewModeBadge
                    isReview={isReview}
                    reviewCount={reviewStatus?.review_count || 0}
                    previousPoints={reviewStatus?.previous_points}
                    size={isMobile ? "sm" : "sm"}
                  />
                )}
                {isAnswered && performance && (
                  <Badge className={cn(
                    "text-white font-bold flex items-center gap-1",
                    isMobile ? "px-2 py-1 text-xs" : "px-3 py-1",
                    performance.isCorrect ? "bg-green-600" : "bg-red-600"
                  )}>
                    {performance.isCorrect ? 
                      <CheckCircle className={isMobile ? "h-3 w-3" : "h-4 w-4"} /> : 
                      <XCircle className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
                    }
                    {isMobile ? 
                      (performance.isCorrect ? `+${performance.points}` : "✗") :
                      (performance.isCorrect ? 
                        (isReview ? "Correto (Revisão)" : `+${performance.points} pts`) : 
                        "Incorreto")
                    }
                  </Badge>
                )}
              </div>
              <h1 className={cn(
                "font-bold text-white mb-1",
                isMobile ? "text-lg leading-tight" : isTablet ? "text-xl" : "text-2xl"
              )}>
                {isMobile ? 
                  (caso.title?.slice(0, 40) + (caso.title?.length > 40 ? '...' : '') || "Caso Clínico") :
                  (caso.title || "Caso Clínico")
                }
              </h1>
              <p className={cn(
                "text-blue-100 flex items-center gap-2",
                isMobile ? "text-sm" : "text-base"
              )}>
                <Activity className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
                {isMobile ? 
                  (isReview ? "Revisão" : isAnswered ? "Respondido" : "Ativo") :
                  (isReview ? "Modo Revisão - Para Estudo" : 
                   isAnswered ? "Caso Respondido" : "Caso Interativo")
                }
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
            onClick={() => navigate('/app/casos')}
          >
            <X className={isMobile ? "h-5 w-5" : "h-6 w-6"} />
          </Button>
        </div>
      </div>

      {/* Layout Principal RESPONSIVO */}
      <div className={cn(
        "max-w-7xl mx-auto",
        isMobile ? "flex flex-col" : isTablet ? "flex flex-col lg:flex-row" : "flex"
      )}>
        {/* Seção de Imagem RESPONSIVA */}
        <div className={cn(
          "bg-white flex flex-col",
          isMobile ? "w-full border-b border-gray-200 p-3" : 
          isTablet ? "w-full lg:w-80 lg:border-r border-b lg:border-b-0 border-gray-200 p-4" :
          "w-80 border-r border-gray-200 p-4"
        )}>
          <div className={cn("flex items-center justify-between", isMobile ? "mb-2" : "mb-4")}>
            <h3 className={cn(
              "font-semibold text-gray-800 flex items-center gap-2",
              isMobile ? "text-sm" : "text-base"
            )}>
              <Target className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
              {isMobile ? "Imagem" : "Imagem Médica"}
            </h3>
            {caseImages.length > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "sm"}
                  onClick={prevImage}
                  disabled={caseImages.length <= 1}
                  className="min-h-[44px] min-w-[44px]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className={cn(
                  "text-gray-600 px-2 font-medium",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  {currentImageIndex + 1}/{caseImages.length}
                </span>
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "sm"}
                  onClick={nextImage}
                  disabled={caseImages.length <= 1}
                  className="min-h-[44px] min-w-[44px]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className={cn(
            "relative bg-gray-100 rounded-lg overflow-hidden",
            isMobile ? "min-h-[250px] flex-1" : "flex-1 min-h-[300px]"
          )}>
            {caseImages.length > 0 ? (
              <div className="relative h-full">
                <img
                  src={caseImages[currentImageIndex]?.url || ''}
                  alt={`Imagem médica ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain transition-transform duration-300"
                  style={{ transform: `scale(${imageZoom})` }}
                />
                <div className={cn(
                  "absolute flex gap-1",
                  isMobile ? "bottom-2 right-2" : "bottom-2 right-2 gap-2"
                )}>
                  <Button
                    variant="secondary"
                    size={isMobile ? "sm" : "sm"}
                    onClick={() => setImageZoom(prev => Math.min(prev + 0.2, 3))}
                    className="min-h-[44px] min-w-[44px] bg-white/90 hover:bg-white"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size={isMobile ? "sm" : "sm"}
                    onClick={() => setImageZoom(prev => Math.max(prev - 0.2, 0.5))}
                    className="min-h-[44px] min-w-[44px] bg-white/90 hover:bg-white"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size={isMobile ? "sm" : "sm"}
                    onClick={resetImageView}
                    className="min-h-[44px] min-w-[44px] bg-white/90 hover:bg-white"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Target className={isMobile ? "h-12 w-12" : "h-16 w-16"} />
                <p className={cn("text-center", isMobile ? "text-sm" : "text-base")}>
                  Nenhuma imagem disponível
                </p>
                <p className={cn("text-center mt-2", isMobile ? "text-xs" : "text-sm")}>
                  Imagens médicas aparecerão aqui
                </p>
              </div>
            )}
          </div>

          {/* Legenda da Imagem */}
          {caseImages.length > 0 && caseImages[currentImageIndex]?.legend && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">
                {caseImages[currentImageIndex].legend}
              </p>
            </div>
          )}
        </div>

        {/* Seção Principal RESPONSIVA */}
        <div className={cn(
          "flex-1 overflow-y-auto",
          isMobile ? "p-3 max-h-none" : isTablet ? "p-4" : "p-6 max-h-screen"
        )}>
          {/* História Clínica RESPONSIVA */}
          <div className={cn(
            "bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 mb-6",
            isMobile ? "p-3" : isTablet ? "p-4" : "p-5"
          )}>
            <div className={cn(
              "flex items-center gap-3",
              isMobile ? "mb-3" : "mb-4"
            )}>
              <div className={cn(
                "bg-green-500 rounded-lg",
                isMobile ? "p-1.5" : "p-2"
              )}>
                <User className={cn(isMobile ? "h-4 w-4" : "h-5 w-5", "text-white")} />
              </div>
              <h3 className={cn(
                "font-bold text-green-800",
                isMobile ? "text-base" : isTablet ? "text-lg" : "text-lg"
              )}>
                História Clínica
              </h3>
            </div>
            
            {/* Cards de Dados RESPONSIVOS */}
            <div className={cn(
              "gap-3 mb-4",
              isMobile ? "grid grid-cols-1 space-y-2" : 
              isTablet ? "grid grid-cols-2" : "grid grid-cols-3"
            )}>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className={cn(
                  "text-green-600 font-semibold mb-1",
                  isMobile ? "text-xs" : "text-xs"
                )}>
                  IDADE
                </div>
                <div className={cn(
                  "font-bold text-green-800",
                  isMobile ? "text-base" : "text-lg"
                )}>
                  {caso.patient_age || "--"}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className={cn(
                  "text-green-600 font-semibold mb-1",
                  isMobile ? "text-xs" : "text-xs"
                )}>
                  GÊNERO
                </div>
                <div className={cn(
                  "font-bold text-green-800",
                  isMobile ? "text-base" : "text-lg"
                )}>
                  {caso.patient_gender || "--"}
                </div>
              </div>
              <div className={cn(
                "bg-white rounded-lg p-3 border border-green-200 flex gap-2",
                isMobile ? "col-span-1" : isTablet ? "col-span-2" : "col-span-1",
                isMobile ? "items-start" : "items-center"
              )}>
                <Clock className={cn(
                  "text-green-600 flex-shrink-0",
                  isMobile ? "h-3 w-3 mt-0.5" : "h-4 w-4"
                )} />
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "text-green-600 font-semibold",
                    isMobile ? "text-xs mb-0.5" : "text-xs mb-1"
                  )}>
                    DURAÇÃO DOS SINTOMAS
                  </div>
                  <div className={cn(
                    "font-bold text-green-800",
                    isMobile ? "text-sm leading-tight" : "text-sm"
                  )}>
                    {caso.symptoms_duration || "--"}
                  </div>
                </div>
              </div>
            </div>

            {/* Informações Clínicas */}
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className={cn(
                "text-green-900 leading-relaxed",
                isMobile ? "text-sm" : "text-sm"
              )}>
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

            {/* Botão Responder RESPONSIVO */}
            {!isAnswered && (
              <Button
                disabled={selected === null}
                onClick={handleAnswerSubmit}
                className={cn(
                  "w-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold shadow mt-6 min-h-[50px]",
                  isMobile ? "text-base py-3" : "text-lg py-3"
                )}
                size="lg"
              >
                Responder
              </Button>
            )}
          </div>

          {/* Dica do Tutor AI - CORRIGIDO exibição automática */}
          {tutorHintText && (
            <div className="fixed bottom-4 right-4 max-w-md bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200 shadow-lg animate-fade-in z-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-bold text-purple-800">Dica do Tutor AI</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTutorHintText("")}
                  className="ml-auto text-purple-600 hover:bg-purple-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex items-start gap-2">
                  <Brain className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                  <p className="text-purple-900 text-sm leading-relaxed">
                    {tutorHintText}
                  </p>
                </div>
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

        {/* Seção de Ajudas RESPONSIVA */}
        <div className={cn(
          "bg-gradient-to-b from-yellow-50 to-orange-50",
          isMobile ? "w-full border-t border-gray-200 p-3" : 
          isTablet ? "w-full lg:w-64 lg:border-l border-t lg:border-t-0 border-gray-200 p-4" :
          "w-64 border-l border-gray-200 p-4"
        )}>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Lightbulb className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-bold text-yellow-800">
              {isReview ? "Estudo" : "Ajudas"}
            </h3>
          </div>

          {/* Aviso de modo revisão */}
          {isReview && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-800 text-sm">Modo Revisão</span>
              </div>
              <p className="text-xs text-blue-700">
                Ajudas educativas disponíveis. Sem consumo de créditos ou pontuação.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {/* Eliminar Opção - Adaptado para revisão */}
            <div className="bg-white rounded-lg p-3 border border-yellow-200 hover:shadow-md transition-shadow">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 border-yellow-300 hover:bg-yellow-50 min-h-[48px]"
                disabled={isAnswered || (!isReview && (!helpAids || helpAids.elimination_aids <= 0)) || !canEliminate}
                onClick={handleEliminateOption}
              >
                <Zap className="h-4 w-4 text-yellow-600" />
                <span className="flex-1 text-left">Eliminar Opção</span>
                {!isReview && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    {helpAids?.elimination_aids || 0}
                  </Badge>
                )}
                {isReview && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Grátis
                  </Badge>
                )}
              </Button>
              <p className="text-xs text-yellow-600 mt-2">
                {isReview ? 
                  "Remove uma alternativa incorreta (educativo)" :
                  `Remove uma alternativa incorreta\nUsos: ${eliminationCount}/2 (-20% pontos)`
                }
              </p>
            </div>

            {/* Pular Questão - Desabilitado em revisão */}
            <div className="bg-white rounded-lg p-3 border border-orange-200 hover:shadow-md transition-shadow">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 border-orange-300 hover:bg-orange-50 min-h-[48px]"
                disabled={isAnswered || isReview || !helpAids || helpAids.skip_aids <= 0}
                onClick={handleSkipCase}
              >
                <SkipForward className="h-4 w-4 text-orange-600" />
                <span className="flex-1 text-left">Pular Questão</span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  {isReview ? "N/A" : helpAids?.skip_aids || 0}
                </Badge>
              </Button>
              <p className="text-xs text-orange-600 mt-2">
                {isReview ? 
                  "Não disponível em revisão" :
                  "Avança sem perder pontos (-50% penalidade)"
                }
              </p>
            </div>

            {/* Tutor AI - Desabilitado em revisão */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-800">Tutor AI</span>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {isReview ? "N/A" : helpAids?.ai_tutor_credits || 0}
                </Badge>
              </div>
              <p className="text-xs text-purple-700 mb-3">
                {isReview ? 
                  "Não disponível em revisão" :
                  "IA especializada disponível (-10% pontos)"
                }
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-purple-300 hover:bg-purple-50 min-h-[48px]"
                disabled={isAnswered || isReview || !helpAids || helpAids.ai_tutor_credits <= 0 || isGettingHint}
                onClick={handleRequestTutorHint}
              >
                {isGettingHint ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    {isReview ? "Indisponível" : "Obter Dica"}
                  </>
                )}
              </Button>
            </div>

            {/* INSERÇÃO CIRÚRGICA: Report Case */}
            <div className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
              <ReportCaseButton
                onClick={handleOpenReport}
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 border-gray-300 hover:bg-gray-50"
              />
              <p className="text-xs text-gray-600 mt-2">
                Reportar problema ou sugerir melhoria neste caso
              </p>
            </div>

            {/* Status - Atualizado para revisão */}
            <div className="bg-gray-100 rounded-lg p-3 border border-gray-200 mt-6">
              <div className="text-xs text-gray-600 text-center">
                <div className="font-semibold mb-1">
                  {isAnswered ? "✅ RESPONDIDO" : isReview ? "👁️ REVISÃO" : "🎯 ATIVO"}
                </div>
                {isAnswered && performance ? (
                  <div>
                    {isReview ? 
                      "Modo estudo - sem pontuação" : 
                      `Pontos ganhos: ${performance.points}`
                    }
                  </div>
                ) : (
                  <div>
                    {isReview ? 
                      "Revisar para estudar" : 
                      "Resolva para ganhar pontos"
                    }
                  </div>
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
          correctAnswer={performance.correctAnswerText || caso?.answer_options?.[caso?.correct_answer_index] || ''}
          selectedAnswer={performance.selectedAnswerText || (shuffled?.options?.[selected!]) || caso?.answer_options?.[selected!] || ''}
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
              {showHelpConfirm === 'eliminate_free' ? 'Eliminar alternativa (Gratuito)' : 'Confirmar uso de ajuda'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {showHelpConfirm === 'eliminate' && 
                `Você deseja eliminar uma alternativa incorreta? Isso consumirá 1 crédito de eliminação. Créditos restantes: ${(helpAids?.elimination_aids || 0) - 1}`}
              {showHelpConfirm === 'eliminate_free' && 
                `Você deseja eliminar uma alternativa incorreta? Esta ação é gratuita em modo revisão para fins educativos.`}
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

      {/* INSERÇÃO CIRÚRGICA: Report Modal */}
      <ReportCaseModal
        open={reportModalOpen}
        onClose={handleCloseReport}
        caseId={caso?.id || ''}
        caseName={caso?.title}
      />
    </div>
  );
}
