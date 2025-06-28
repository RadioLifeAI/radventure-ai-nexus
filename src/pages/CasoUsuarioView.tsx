import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BackToDashboard } from "@/components/navigation/BackToDashboard";
import { EnhancedImageViewer } from "@/components/cases/EnhancedImageViewer";
import { MedicalStackViewer } from "@/components/image-viewer/MedicalStackViewer";
import { CaseProgressBar } from "@/components/cases/CaseProgressBar";
import { CaseNavigation } from "@/components/cases/CaseNavigation";
import { ConfidenceSelector } from "@/components/cases/ConfidenceSelector";
import { FeedbackModal } from "@/components/cases/FeedbackModal";
import { ReviewModeBadge } from "@/components/cases/ReviewModeBadge";
import { HelpSystem } from "@/components/cases/HelpSystem";
import { useCaseReviewStatus } from "@/hooks/useCaseReviewStatus";
import { useCaseNavigation } from "@/hooks/useCaseNavigation";
import { useShuffledAnswers } from "@/hooks/useShuffledAnswers";
import { useCaseImages } from "@/hooks/useCaseImages";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Brain, 
  Award, 
  Clock,
  Archive,
  Eye,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

export default function CasoUsuarioView() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [currentCase, setCurrentCase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number>(50);
  const [answered, setAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [useStackViewer, setUseStackViewer] = useState(false);

  // Custom hooks
  const { images, loading: imagesLoading } = useCaseImages(id);
  const { reviewStatus, isReview } = useCaseReviewStatus(id || '');
  const { shuffledAnswers, answerMapping } = useShuffledAnswers(currentCase?.answer_options || []);
  const { navigateToNext, navigateToPrevious } = useCaseNavigation();

  useEffect(() => {
    const loadCase = async () => {
      if (!id) {
        console.error("CasoUsuarioView: ID do caso não fornecido.");
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("medical_cases")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("CasoUsuarioView: Erro ao carregar caso:", error);
          toast({
            title: "Erro ao carregar caso",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        setCurrentCase(data);
      } catch (error: any) {
        console.error("CasoUsuarioView: Erro inesperado:", error);
        toast({
          title: "Erro inesperado",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadCase();
  }, [id]);

  const handleAnswer = async () => {
    if (selectedAnswer === null) {
      toast({
        title: "Selecione uma resposta",
        description: "Por favor, selecione uma alternativa antes de confirmar.",
      });
      return;
    }

    setAnswered(true);
    const correctAnswerIndex = currentCase.correct_answer_index;
    const isUserCorrect = answerMapping[selectedAnswer] === correctAnswerIndex;
    setIsCorrect(isUserCorrect);

    // Atualizar o status de revisão do caso
    try {
      const { error } = await supabase
        .from('user_case_reviews')
        .upsert([
          { 
            case_id: id, 
            user_id: supabase.auth.user()?.id, 
            is_correct: isUserCorrect,
            confidence: confidence,
            selected_answer: shuffledAnswers[selectedAnswer],
            reviewed_at: new Date().toISOString()
          }
        ], { onConflict: ['case_id', 'user_id'] });

      if (error) {
        throw error;
      }

      toast({
        title: isUserCorrect ? "Resposta correta!" : "Resposta incorreta",
        description: "Seu feedback foi registrado.",
      });
    } catch (error: any) {
      console.error("Erro ao atualizar o status de revisão:", error);
      toast({
        title: "Erro ao salvar feedback",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setShowFeedback(true);
    }
  };

  const getDifficultyVariant = (level: number) => {
    const variants = {
      1: "default",
      2: "secondary", 
      3: "outline",
      4: "destructive",
      5: "destructive"
    } as const;
    return variants[level as keyof typeof variants] || "outline";
  };

  const handleViewModeToggle = () => {
    setUseStackViewer(!useStackViewer);
  };

  const stackViewerImages = images.map(img => ({
    id: img.id,
    url: img.large_url || img.original_url,
    legend: img.legend || `Imagem ${img.sequence_order}`,
    sequence_order: img.sequence_order
  }));

  const shouldUseStackViewer = images.length > 3 && (
    currentCase?.modality?.toLowerCase().includes('tc') ||
    currentCase?.modality?.toLowerCase().includes('rm') ||
    currentCase?.modality?.toLowerCase().includes('tomografia') ||
    currentCase?.modality?.toLowerCase().includes('ressonancia')
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando caso médico...</p>
        </div>
      </div>
    );
  }

  if (!currentCase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Caso não encontrado</h2>
            <p className="text-gray-600 mb-4">O caso solicitado não existe ou foi removido.</p>
            <Button onClick={() => navigate('/casos')}>
              Voltar aos Casos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <BackToDashboard />
          <div className="flex items-center gap-3">
            <ReviewModeBadge isReview={isReview} />
            <CaseProgressBar currentCase={1} totalCases={1} />
          </div>
        </div>

        {/* Case Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Images */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {useStackViewer ? (
                    <Archive className="h-5 w-5 text-purple-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-blue-600" />
                  )}
                  Imagens do Caso ({images.length})
                </CardTitle>
                
                {shouldUseStackViewer && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewModeToggle}
                    className="flex items-center gap-2"
                  >
                    {useStackViewer ? (
                      <>
                        <ToggleRight className="h-4 w-4" />
                        Modo Stack
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-4 w-4" />
                        Modo Padrão
                      </>
                    )}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {imagesLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : images.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma imagem disponível para este caso</p>
                  </div>
                ) : useStackViewer && shouldUseStackViewer ? (
                  <MedicalStackViewer 
                    images={stackViewerImages}
                    onImageChange={(index) => {
                      console.log('Imagem ativa no stack:', index);
                    }}
                  />
                ) : (
                  <EnhancedImageViewer 
                    images={images.map(img => img.large_url || img.original_url)} 
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Case Information */}
          <div className="space-y-4">
            {/* Case Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">{currentCase.title}</CardTitle>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{currentCase.specialty}</Badge>
                      <Badge variant="outline">{currentCase.modality}</Badge>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Award className="h-3 w-3 mr-1" />
                        {currentCase.points} pts
                      </Badge>
                    </div>
                  </div>
                  <Badge variant={getDifficultyVariant(currentCase.difficulty_level)}>
                    Nível {currentCase.difficulty_level}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Clinical Information */}
            {currentCase.patient_clinical_info && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações Clínicas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{currentCase.patient_clinical_info}</p>
                </CardContent>
              </Card>
            )}

            {/* Question */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  {currentCase.main_question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {shuffledAnswers.map((answer, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === index ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto p-4"
                    onClick={() => !answered && setSelectedAnswer(index)}
                    disabled={answered}
                  >
                    <span className="font-medium mr-3">
                      {String.fromCharCode(65 + index)})
                    </span>
                    {answer}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Help System */}
            <HelpSystem caseId={id || ''} />

            {/* Confidence & Submit */}
            {!answered && selectedAnswer !== null && (
              <Card>
                <CardContent className="pt-6">
                  <ConfidenceSelector 
                    confidence={confidence}
                    onChange={setConfidence}
                  />
                  <Button 
                    className="w-full mt-4" 
                    onClick={handleAnswer}
                    size="lg"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Confirmar Resposta
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Navigation */}
        <CaseNavigation 
          onPrevious={navigateToPrevious}
          onNext={navigateToNext}
          showPrevious={true}
          showNext={true}
        />

        {/* Feedback Modal */}
        <FeedbackModal
          open={showFeedback}
          onClose={() => setShowFeedback(false)}
          isCorrect={isCorrect}
          explanation={currentCase.explanation}
          correctAnswer={currentCase.answer_options?.[currentCase.correct_answer_index]}
          onNext={navigateToNext}
        />
      </div>
    </div>
  );
}

function getDifficultyVariant(level: number) {
  const variants = {
    1: "default",
    2: "secondary", 
    3: "outline",
    4: "destructive",
    5: "destructive"
  } as const;
  return variants[level as keyof typeof variants] || "outline";
}
