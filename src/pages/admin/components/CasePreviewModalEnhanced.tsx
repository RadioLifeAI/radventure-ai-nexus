import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, 
  User, 
  Clock, 
  Target, 
  Lightbulb, 
  Zap, 
  SkipForward,
  X,
  Stethoscope,
  Activity,
  CheckCircle,
  XCircle,
  Maximize,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useUserHelpAids } from "@/hooks/useUserHelpAids";
import { useToast } from "@/components/ui/use-toast";
import { CaseProgressBar } from "@/components/cases/CaseProgressBar";
import { ConfidenceSelector } from "@/components/cases/ConfidenceSelector";
import { EnhancedImageViewer } from "@/components/cases/EnhancedImageViewer";
import { ReviewModeBadge } from "@/components/cases/ReviewModeBadge";
import { useCaseReviewStatus } from "@/hooks/useCaseReviewStatus";
import { useCaseImageIntegration } from "@/hooks/useCaseImageIntegration";

interface CasePreviewModalEnhancedProps {
  open: boolean;
  onClose: () => void;
  caseId?: string | null;
  formData?: any;
  categories?: any[];
  difficulties?: any[];
  isAdminView?: boolean;
  tempImages?: any[];
}

export function CasePreviewModalEnhanced({
  open,
  onClose,
  caseId,
  formData,
  categories: externalCategories,
  difficulties: externalDifficulties,
  isAdminView = false,
  tempImages = [],
}: CasePreviewModalEnhancedProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [showTutorHint, setShowTutorHint] = useState(false);
  const [tutorQuestion, setTutorQuestion] = useState("");
  const [tutorHintText, setTutorHintText] = useState("");
  const [startTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);
  const [confidence, setConfidence] = useState(50);
  const [currentStep, setCurrentStep] = useState<'analysis' | 'answer' | 'feedback'>('analysis');

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { helpAids, consumeHelp, getTutorHint, isGettingHint } = useUserHelpAids();
  
  // Hook para status de revisão
  const { reviewStatus, isReview, previousAnswer, previousCorrect } = useCaseReviewStatus(caseId);

  // Hook para imagens integradas - CORREÇÃO: usar dados corretos
  const imageIntegration = useCaseImageIntegration({
    caseId: formData ? undefined : caseId, // Usar caseId apenas se não for formData
    categoryId: formData?.category_id ? Number(formData.category_id) : undefined,
    modality: formData?.modality || undefined
  });

  // Timer effect
  useEffect(() => {
    if (open && !hasAnswered) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [open, hasAnswered, startTime]);

  const { data: caseData, isLoading } = useQuery({
    queryKey: ["case-preview", caseId],
    queryFn: async () => {
      if (!caseId) return null;
      
      const { data, error } = await supabase
        .from("medical_cases")
        .select("*")
        .eq("id", caseId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!caseId && open && !formData,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["medical-specialties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_specialties")
        .select("*");
      
      if (error) throw error;
      return data;
    },
    enabled: !externalCategories,
  });

  const { data: difficulties = [] } = useQuery({
    queryKey: ["difficulties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("difficulties")
        .select("*");
      
      if (error) throw error;
      return data;
    },
    enabled: !externalDifficulties,
  });

  const { data: userCaseHistory } = useQuery({
    queryKey: ["user-case-history", caseId],
    queryFn: async () => {
      if (!caseId || isAdminView) return null;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_case_history")
        .select("*")
        .eq("user_id", user.id)
        .eq("case_id", caseId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!caseId && open && !isAdminView,
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async ({ answerIndex, helpUsed, userConfidence }: { answerIndex: number, helpUsed: any, userConfidence: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const actualCaseData = formData || caseData;
      const correct = answerIndex === actualCaseData.correct_answer_index;
      let points = correct ? (actualCaseData.points || 100) : 0;

      // Zero pontos em modo revisão
      if (isReview) {
        points = 0;
      } else {
        if (helpUsed.eliminationUsed > 0) {
          points -= (actualCaseData.elimination_penalty_points || 10) * helpUsed.eliminationUsed;
        }
        if (helpUsed.skipUsed) {
          points -= actualCaseData.skip_penalty_points || 20;
        }
        points = Math.max(0, points);
      }

      // Usar a nova função RPC que trata revisões
      const { error } = await supabase.rpc('process_case_completion', {
        p_user_id: user.id,
        p_case_id: actualCaseData.id,
        p_points: points,
        p_is_correct: correct
      });

      if (error) throw error;

      return { correct, points };
    },
    onSuccess: (data) => {
      setIsCorrect(data.correct);
      setPointsEarned(data.points);
      setHasAnswered(true);
      setShowExplanation(true);
      setCurrentStep('feedback');
      queryClient.invalidateQueries({ queryKey: ["user-case-history"] });
      
      if (isReview) {
        toast({
          title: "Modo Revisão",
          description: "Resposta registrada para estudo, sem pontuação adicional.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const actualCaseData = formData || caseData;
  const actualCategories = externalCategories || categories;
  const actualDifficulties = externalDifficulties || difficulties;

  // CORREÇÃO COMPLETA: Lógica unificada de imagens
  const form = actualCaseData || {};
  
  // Prioridade para imagens integradas (formData), depois imagens do banco
  const images = (() => {
    // 1. Se é formData e temos imagens temporárias passadas como prop, usar essas
    if (formData && tempImages.length > 0) {
      return tempImages.map(img => ({
        url: img.original_url,
        legend: img.legend || ""
      }));
    }

    // 2. Se é formData e temos imagens integradas, usar essas
    if (formData && imageIntegration.images.length > 0) {
      return imageIntegration.images.map(img => ({
        url: img.original_url,
        legend: img.legend || ""
      }));
    }
    
    // 3. Se tem image_url no form, usar essas
    if (form.image_url) {
      if (Array.isArray(form.image_url)) {
        return form.image_url.map((url: string, index: number) => ({
          url,
          legend: `Imagem ${index + 1}`
        }));
      } else {
        return [{
          url: form.image_url,
          legend: "Imagem principal"
        }];
      }
    }
    
    // 4. Caso contrário, array vazio
    return [];
  })();

  // Reset state when modal opens/closes or case changes
  useEffect(() => {
    if (open && actualCaseData) {
      setSelectedAnswer(null);
      setShowExplanation(false);
      setEliminatedOptions([]);
      setHasAnswered(!!userCaseHistory || isReview);
      setIsCorrect(userCaseHistory?.is_correct || null);
      setPointsEarned(userCaseHistory?.points || 0);
      setShowTutorHint(false);
      setTutorQuestion("");
      setTutorHintText("");
      setCurrentImageIndex(0);
      setConfidence(50);
      setCurrentStep(userCaseHistory || isReview ? 'feedback' : 'analysis');
    }
  }, [open, actualCaseData, userCaseHistory, isReview]);

  if (!actualCaseData && !isLoading) {
    return null;
  }

  function getCategoryName(categories: any[], id: number) {
    return categories.find((c) => c.id === id)?.name || "Especialidade";
  }
  
  function getDifficultyDesc(difficulties: any[], level: number) {
    const diff = difficulties.find((d) => d.level === level);
    return diff?.description || `Nível ${level}`;
  }

  function getDifficultyColor(level: number) {
    switch (level) {
      case 1: return "bg-green-500";
      case 2: return "bg-yellow-500";
      case 3: return "bg-orange-500";
      case 4: return "bg-red-500";
      default: return "bg-gray-500";
    }
  }

  const category = getCategoryName(actualCategories, form.category_id);
  const difficulty = getDifficultyDesc(actualDifficulties, form.difficulty_level);
  const difficultyLevel = form.difficulty_level || 1;
  
  const handleAnswerSelect = (index: number) => {
    if (hasAnswered || isAdminView) return;
    
    setSelectedAnswer(index);
    setCurrentStep('answer');
    
    const helpUsed = {
      eliminationUsed: eliminatedOptions.length,
      skipUsed: false,
      aiTutorUsed: !!tutorHintText
    };

    submitAnswerMutation.mutate({ answerIndex: index, helpUsed, userConfidence: confidence });
  };

  const handleEliminateOption = () => {
    if (isReview) {
      // Em modo revisão, permitir eliminação gratuita
      const availableOptions = [0, 1, 2, 3].filter(i => 
        i !== form.correct_answer_index && !eliminatedOptions.includes(i)
      );

      if (availableOptions.length === 0) return;

      const randomIndex = availableOptions[Math.floor(Math.random() * availableOptions.length)];
      setEliminatedOptions(prev => [...prev, randomIndex]);
      
      toast({
        title: "Alternativa eliminada (Revisão)",
        description: "Eliminação gratuita para fins educativos.",
      });
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

    const availableOptions = [0, 1, 2, 3].filter(i => 
      i !== form.correct_answer_index && !eliminatedOptions.includes(i)
    );

    if (availableOptions.length === 0) return;

    const randomIndex = availableOptions[Math.floor(Math.random() * availableOptions.length)];
    setEliminatedOptions(prev => [...prev, randomIndex]);
    
    consumeHelp({ aidType: 'elimination' });
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

    const helpUsed = {
      eliminationUsed: eliminatedOptions.length,
      skipUsed: true,
      aiTutorUsed: !!tutorHintText
    };

    consumeHelp({ aidType: 'skip' });
    submitAnswerMutation.mutate({ answerIndex: -1, helpUsed, userConfidence: confidence });
    onClose();
  };

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
        description: "Você não possui ajudas de eliminação disponíveis.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🤖 Solicitando dica automática do Tutor AI...');
      
      // Consumir crédito primeiro
      consumeHelp({ aidType: 'ai_tutor' });
      
      const response = await getTutorHint({
        caseData: actualCaseData
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

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl h-[90vh] p-0">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Carregando caso médico...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header Gamificado - Atualizado para revisão */}
        <div className={cn(
          "relative text-white p-6 rounded-t-lg",
          hasAnswered 
            ? isCorrect 
              ? "bg-gradient-to-r from-green-600 via-green-700 to-emerald-600"
              : "bg-gradient-to-r from-red-600 via-red-700 to-pink-600"
            : isReview
              ? "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"
              : "bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                {isReview ? <Eye className="h-8 w-8 text-blue-100" /> : <Stethoscope className="h-8 w-8 text-blue-100" />}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-3">
                    {category}
                  </Badge>
                  <Badge className={cn("text-white font-bold px-3 py-1", getDifficultyColor(difficultyLevel))}>
                    {difficulty}
                  </Badge>
                  <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-3 py-1 flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {form.points || 100} pts
                  </Badge>
                  {/* Badge de Revisão */}
                  {isReview && (
                    <ReviewModeBadge
                      isReview={isReview}
                      reviewCount={reviewStatus?.review_count || 0}
                      previousPoints={reviewStatus?.previous_points}
                      size="sm"
                    />
                  )}
                  {hasAnswered && (
                    <Badge className={cn(
                      "text-white font-bold px-3 py-1 flex items-center gap-1",
                      isCorrect ? "bg-green-600" : "bg-red-600"
                    )}>
                      {isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      {isCorrect ? 
                        (isReview ? "Correto (Revisão)" : `+${pointsEarned} pts`) : 
                        "Incorreto"}
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  {form.title || "Caso Clínico"}
                </h1>
                <p className="text-blue-100 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  {isAdminView ? "Preview Administrativo" : 
                   isReview ? "Modo Revisão - Para Estudo" :
                   hasAnswered ? "Caso Respondido" : "Caso Interativo"}
                </p>
              </div>
            </div>
            <DialogClose asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20 rounded-full"
              >
                <X className="h-6 w-6" />
              </Button>
            </DialogClose>
          </div>
        </div>

        {/* Progress Bar */}
        {!isAdminView && (
          <div className="px-6 py-4 border-b">
            <CaseProgressBar
              currentStep={currentStep}
              timeSpent={timeSpent}
              hasAnswered={hasAnswered}
              isCorrect={isCorrect}
            />
          </div>
        )}

        {/* Layout Principal - 3 Colunas */}
        <div className="flex h-full overflow-hidden">
          {/* Coluna 1: Imagem Médica - CORREÇÃO: Usar imagens unificadas */}
          <div className="w-80 bg-white border-r border-gray-200 p-4 flex flex-col">
            <EnhancedImageViewer
              images={images}
              currentIndex={currentImageIndex}
              onIndexChange={setCurrentImageIndex}
              className="flex-1"
            />
            {images.length === 0 && (
              <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Nenhuma imagem disponível</p>
                </div>
              </div>
            )}
          </div>

          {/* Coluna 2: Caso Clínico Principal */}
          <div className="flex-1 p-6 overflow-y-auto">
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
                  <div className="text-lg font-bold text-green-800">{form.patient_age || "--"}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="text-xs text-green-600 font-semibold mb-1">GÊNERO</div>
                  <div className="text-lg font-bold text-green-800">{form.patient_gender || "--"}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-200 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-xs text-green-600 font-semibold">DURAÇÃO</div>
                    <div className="text-sm font-bold text-green-800">{form.symptoms_duration || "--"}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="text-sm text-green-900 leading-relaxed">
                  {form.patient_clinical_info || "Informações clínicas não disponíveis"}
                </div>
              </div>

              {form.findings && (
                <div className="mt-4 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <div className="text-xs text-yellow-700 font-semibold mb-1">ACHADOS PRINCIPAIS</div>
                  <div className="text-sm text-yellow-800">{form.findings}</div>
                </div>
              )}
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
                  {form.main_question || "Pergunta não definida"}
                </p>
              </div>

              {/* Sistema de Confiança */}
              {!isAdminView && !hasAnswered && (
                <div className="mb-6">
                  <ConfidenceSelector
                    confidence={confidence}
                    onConfidenceChange={setConfidence}
                    disabled={hasAnswered}
                  />
                </div>
              )}

              {/* Alternativas */}
              <div className="space-y-3">
                <div className="text-sm font-semibold text-blue-800 mb-3">
                  {hasAnswered ? "Sua resposta:" : "Selecione sua resposta:"}
                </div>
                {(form.answer_options || []).map((option: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={hasAnswered || isAdminView || eliminatedOptions.includes(index)}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 text-left transition-all duration-300 flex items-center gap-3",
                      eliminatedOptions.includes(index)
                        ? "border-gray-300 bg-gray-100 text-gray-400 opacity-50"
                        : hasAnswered || selectedAnswer !== null 
                          ? selectedAnswer === index
                            ? index === form.correct_answer_index
                              ? "border-green-500 bg-green-50 text-green-800"
                              : "border-red-500 bg-red-50 text-red-800"
                            : index === form.correct_answer_index
                              ? "border-green-500 bg-green-100 text-green-800"
                              : "border-gray-200 bg-gray-50 text-gray-600 opacity-70"
                          : "border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50 hover:shadow-md transform hover:-translate-y-1"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                      eliminatedOptions.includes(index)
                        ? "bg-gray-300 text-gray-500"
                        : hasAnswered || selectedAnswer !== null
                          ? selectedAnswer === index
                            ? index === form.correct_answer_index
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                            : index === form.correct_answer_index
                              ? "bg-green-500 text-white"
                              : "bg-gray-300 text-gray-600"
                          : "bg-blue-100 text-blue-700"
                    )}>
                      {eliminatedOptions.includes(index) ? "✗" : String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1">{option || "Opção vazia"}</span>
                    {hasAnswered && index === form.correct_answer_index && (
                      <div className="text-green-600">✓</div>
                    )}
                    {hasAnswered && selectedAnswer === index && index !== form.correct_answer_index && (
                      <div className="text-red-600">✗</div>
                    )}
                  </button>
                ))}
              </div>
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
            {(showExplanation || hasAnswered) && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-purple-800">Explicação Detalhada</h3>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <p className="text-purple-900 leading-relaxed whitespace-pre-line">
                    {form.explanation || "Explicação não disponível"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Coluna 3: Sistema de Ajudas - Atualizado para revisão */}
          {!isAdminView && (
            <div className="w-64 bg-gradient-to-b from-yellow-50 to-orange-50 border-l border-gray-200 p-4">
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
                    Eliminação gratuita disponível para fins educativos.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {/* Eliminar Opção - Adaptado para revisão */}
                <div className="bg-white rounded-lg p-3 border border-yellow-200 hover:shadow-md transition-shadow">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 border-yellow-300 hover:bg-yellow-50"
                    disabled={hasAnswered || (!isReview && (!helpAids || helpAids.elimination_aids <= 0))}
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
                      "Remove uma alternativa incorreta"
                    }
                  </p>
                </div>

                {/* Pular Questão - Desabilitado em revisão */}
                <div className="bg-white rounded-lg p-3 border border-orange-200 hover:shadow-md transition-shadow">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 border-orange-300 hover:bg-orange-50"
                    disabled={hasAnswered || isReview || !helpAids || helpAids.skip_aids <= 0}
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
                      "Avança sem perder pontos"
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
                      "IA especializada em medicina disponível"
                    }
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-purple-300 hover:bg-purple-50"
                    disabled={hasAnswered || isReview || !helpAids || helpAids.ai_tutor_credits <= 0 || isGettingHint}
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

                {/* Status - Atualizado para revisão */}
                <div className="bg-gray-100 rounded-lg p-3 border border-gray-200 mt-6">
                  <div className="text-xs text-gray-600 text-center">
                    <div className="font-semibold mb-1">
                      {hasAnswered ? "✅ RESPONDIDO" : isReview ? "👁️ REVISÃO" : "🎯 ATIVO"}
                    </div>
                    {hasAnswered ? (
                      <div>
                        {isReview ? 
                          "Modo estudo - sem pontuação" :
                          `Pontos ganhos: ${pointsEarned}`
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
