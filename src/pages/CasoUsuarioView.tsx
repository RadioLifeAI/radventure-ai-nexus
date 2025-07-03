import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Eye, HelpCircle, SkipForward, Lightbulb, Clock, Award, Target, Brain } from "lucide-react";
import { EnhancedImageViewer } from "@/components/cases/EnhancedImageViewer";
import { CaseProgressBar } from "@/components/cases/CaseProgressBar";
import { FeedbackModal } from "@/components/cases/FeedbackModal";
import { HelpSystem } from "@/components/cases/HelpSystem";
import { ReportCaseButton } from "@/components/cases/ReportCaseButton";
import { Loader } from "@/components/Loader";

export default function CasoUsuarioView() {
  const { id: caseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [caseData, setCaseData] = useState<any>(null);
  const [caseImages, setCaseImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [confidence, setConfidence] = useState<number>(50);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState("");
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [helpUsed, setHelpUsed] = useState<any>({});

  useEffect(() => {
    if (caseId) {
      loadCaseData();
    }
  }, [caseId]);

  const loadCaseData = async () => {
    if (!caseId) return;
    
    setLoading(true);
    try {
      console.log('🔍 Carregando caso:', caseId);
      
      // Carregar dados do caso
      const { data: caseData, error: caseError } = await supabase
        .from("medical_cases")
        .select("*")
        .eq("id", caseId)
        .single();

      if (caseError) {
        console.error('❌ Erro ao carregar caso:', caseError);
        throw caseError;
      }

      setCaseData(caseData);
      console.log('✅ Caso carregado:', caseData.title);

      // CORREÇÃO DEFINITIVA: Carregar imagens com fallback robusto
      await loadCaseImagesRobust(caseId);

    } catch (error: any) {
      console.error("❌ Erro ao carregar caso:", error);
      toast({
        title: "Erro ao carregar caso",
        description: error.message,
        variant: "destructive",
      });
      navigate("/app/casos");
    } finally {
      setLoading(false);
    }
  };

  // CORREÇÃO: Carregamento de imagens com fallback robusto
  const loadCaseImagesRobust = async (caseId: string) => {
    try {
      console.log('🖼️ Carregando imagens do caso:', caseId);
      
      // Primeiro: Tentar função unificada
      const { data: unifiedImages, error: unifiedError } = await supabase
        .rpc('get_case_images_unified', { p_case_id: caseId });
      
      if (!unifiedError && unifiedImages && Array.isArray(unifiedImages)) {
        const imageUrls = unifiedImages
          .map((img: any) => {
            if (typeof img === 'object' && img?.url) {
              return String(img.url);
            }
            return String(img);
          })
          .filter((url: string) => url && url.trim() !== '');
        
        if (imageUrls.length > 0) {
          setCaseImages(imageUrls);
          console.log('✅ Imagens carregadas via função unificada:', imageUrls.length);
          return;
        }
      }
      
      console.log('🔄 Fallback: Carregando da tabela case_images');
      
      // Segundo: Fallback para tabela case_images
      const { data: tableImages, error: tableError } = await supabase
        .from('case_images')
        .select('original_url')
        .eq('case_id', caseId)
        .eq('processing_status', 'completed')
        .order('sequence_order');
      
      if (!tableError && tableImages && tableImages.length > 0) {
        const imageUrls = tableImages
          .map(img => String(img.original_url))
          .filter(url => url && url.trim() !== '');
        
        setCaseImages(imageUrls);
        console.log('✅ Imagens carregadas da tabela case_images:', imageUrls.length);
        return;
      }
      
      console.log('🔄 Fallback final: Carregando de image_url');
      
      // Terceiro: Fallback final para campo image_url do caso
      const { data: caseData, error: caseError } = await supabase
        .from('medical_cases')
        .select('image_url')
        .eq('id', caseId)
        .single();
      
      if (!caseError && caseData && caseData.image_url) {
        let imageUrls: string[] = [];
        
        if (Array.isArray(caseData.image_url)) {
          imageUrls = caseData.image_url
            .map((url: any) => {
              if (typeof url === 'object' && url?.url) {
                return String(url.url);
              }
              return String(url);
            })
            .filter((url: string) => url && url.trim() !== '');
        }
        
        setCaseImages(imageUrls);
        console.log('✅ Imagens carregadas do campo image_url:', imageUrls.length);
        return;
      }
      
      console.log('⚠️ Nenhuma imagem encontrada para o caso');
      setCaseImages([]);
      
    } catch (error) {
      console.error('❌ Erro ao carregar imagens:', error);
      setCaseImages([]);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return;
    
    const correct = selectedAnswer === caseData.correct_answer_index;
    setIsCorrect(correct);
    setHasAnswered(true);
    setShowFeedback(true);
    
    // Processar resposta no backend
    try {
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        await supabase.rpc('process_case_completion', {
          p_user_id: user.data.user.id,
          p_case_id: caseId,
          p_points: caseData.points || 1,
          p_is_correct: correct
        });
      }
    } catch (error) {
      console.error('Erro ao processar resposta:', error);
    }
  };

  const renderAnswerOptions = () => {
    if (!caseData.answer_options) return null;
    
    return caseData.answer_options.map((option: string, index: number) => {
      if (eliminatedOptions.includes(index)) return null;
      
      const isSelected = selectedAnswer === index;
      const isCorrect = index === caseData.correct_answer_index;
      const isWrong = hasAnswered && isSelected && !isCorrect;
      
      let buttonClass = "w-full p-4 text-left border rounded-lg transition-all duration-200 hover:shadow-md ";
      
      if (hasAnswered) {
        if (isCorrect) {
          buttonClass += "bg-green-100 border-green-500 text-green-800";
        } else if (isWrong) {
          buttonClass += "bg-red-100 border-red-500 text-red-800";
        } else {
          buttonClass += "bg-gray-100 border-gray-300 text-gray-600";
        }
      } else {
        if (isSelected) {
          buttonClass += "bg-blue-100 border-blue-500 text-blue-800 shadow-md";
        } else {
          buttonClass += "bg-white border-gray-200 text-gray-700 hover:bg-gray-50";
        }
      }
      
      return (
        <button
          key={index}
          onClick={() => !hasAnswered && setSelectedAnswer(index)}
          disabled={hasAnswered}
          className={buttonClass}
        >
          <div className="flex items-start">
            <span className="font-semibold mr-3 text-lg">
              {String.fromCharCode(65 + index)}.
            </span>
            <span className="flex-1">{option}</span>
            {hasAnswered && isCorrect && (
              <span className="ml-2 text-green-600">✓</span>
            )}
            {hasAnswered && isWrong && (
              <span className="ml-2 text-red-600">✗</span>
            )}
          </div>
          
          {hasAnswered && caseData.answer_feedbacks && caseData.answer_feedbacks[index] && (
            <div className="mt-3 pt-3 border-t text-sm text-gray-600">
              <strong>Feedback:</strong> {caseData.answer_feedbacks[index]}
            </div>
          )}
        </button>
      );
    });
  };

  if (loading) {
    return <Loader />;
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-lg text-gray-600 mb-4">Caso não encontrado</p>
            <Button onClick={() => navigate("/app/casos")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Casos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <Button
            variant="ghost"
            onClick={() => navigate("/app/casos")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Casos
          </Button>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <Target className="h-3 w-3 mr-1" />
              {caseData.points || 1} {(caseData.points || 1) === 1 ? 'ponto' : 'pontos'}
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              <Brain className="h-3 w-3 mr-1" />
              Nível {caseData.difficulty_level || 1}
            </Badge>
            <ReportCaseButton caseId={caseId || ''} />
          </div>
        </div>

        {/* Case Progress */}
        <CaseProgressBar 
          currentCase={1}
          totalCases={1}
          hasAnswered={hasAnswered}
          isCorrect={isCorrect}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Images */}
          <Card className="bg-white shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Imagens do Caso ({caseImages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {caseImages.length > 0 ? (
                <EnhancedImageViewer 
                  images={caseImages}
                  title={caseData.title}
                />
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma imagem disponível para este caso</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Case Info */}
          <Card className="bg-white shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle>{caseData.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{caseData.specialty || 'Geral'}</Badge>
                <Badge variant="outline">{caseData.modality || 'Radiologia'}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Patient Info */}
              {(caseData.patient_age || caseData.patient_gender) && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Informações do Paciente</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {caseData.patient_age && (
                      <div>
                        <span className="font-medium">Idade:</span> {caseData.patient_age}
                      </div>
                    )}
                    {caseData.patient_gender && (
                      <div>
                        <span className="font-medium">Gênero:</span> {caseData.patient_gender}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Clinical Info */}
              {caseData.patient_clinical_info && (
                <div>
                  <h4 className="font-semibold mb-2">Informações Clínicas</h4>
                  <p className="text-gray-700 text-sm">{caseData.patient_clinical_info}</p>
                </div>
              )}

              {/* Findings */}
              {caseData.findings && (
                <div>
                  <h4 className="font-semibold mb-2">Achados</h4>
                  <p className="text-gray-700 text-sm">{caseData.findings}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Question and Answers */}
        <Card className="bg-white shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              {caseData.main_question || "Qual é o diagnóstico mais provável?"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Help System */}
            <HelpSystem
              caseId={caseId || ''}
              caseData={caseData}
              eliminatedOptions={eliminatedOptions}
              onEliminateOption={(index) => setEliminatedOptions(prev => [...prev, index])}
              onShowHint={(hint) => {
                setHintText(hint);
                setShowHint(true);
              }}
              onHelpUsed={(helpType) => setHelpUsed(prev => ({ ...prev, [helpType]: true }))}
              disabled={hasAnswered}
            />

            {/* Hint Display */}
            {showHint && hintText && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">Dica</h4>
                    <p className="text-yellow-700 text-sm">{hintText}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Answer Options */}
            <div className="space-y-3">
              {renderAnswerOptions()}
            </div>

            {/* Submit Button */}
            {!hasAnswered && (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Confirmar Resposta
              </Button>
            )}

            {/* Next Case Button */}
            {hasAnswered && (
              <Button
                onClick={() => navigate("/app/casos")}
                size="lg"
                className="w-full"
                variant="outline"
              >
                Continuar Estudos
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Feedback Modal */}
        <FeedbackModal
          open={showFeedback}
          onClose={() => setShowFeedback(false)}
          isCorrect={isCorrect}
          explanation={caseData.explanation}
          correctAnswer={caseData.answer_options?.[caseData.correct_answer_index]}
          selectedAnswer={selectedAnswer !== null ? caseData.answer_options?.[selectedAnswer] : ''}
          points={caseData.points || 1}
          onContinue={() => {
            setShowFeedback(false);
            navigate("/app/casos");
          }}
        />
      </div>
    </div>
  );
}
