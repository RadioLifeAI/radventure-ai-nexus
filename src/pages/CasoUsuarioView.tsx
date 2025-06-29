
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpecializedImageViewer } from "@/components/cases/SpecializedImageViewer";
import { HelpSystem } from "@/components/cases/HelpSystem";
import { useSpecializedCaseImages } from "@/hooks/useSpecializedCaseImages";
import { useUserHelpAids } from "@/hooks/useUserHelpAids";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle,
  BookOpen,
  Award,
  User,
  Calendar,
  Target,
  FolderTree,
  Sparkles
} from "lucide-react";

interface MedicalCase {
  id: string;
  title: string;
  specialty: string;
  modality: string;
  subtype?: string;
  findings: string;
  patient_clinical_info: string;
  main_question: string;
  answer_options: string[];
  correct_answer_index: number;
  explanation: string;
  points: number;
  difficulty_level: number;
  patient_age?: string;
  patient_gender?: string;
  created_at: string;
  max_elimination: number;
  can_skip: boolean;
  skip_penalty_points: number;
  elimination_penalty_points: number;
  ai_hint_enabled: boolean;
  manual_hint?: string;
}

export default function CasoUsuarioView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [medicalCase, setMedicalCase] = useState<MedicalCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [aiHintText, setAiHintText] = useState<string>("");
  const [showAiHint, setShowAiHint] = useState(false);
  
  const { images, loading: imagesLoading } = useSpecializedCaseImages(id);
  const { helpAids, refetch: refetchHelpAids } = useUserHelpAids();

  useEffect(() => {
    if (id) {
      fetchCase(id);
    }
  }, [id]);

  const fetchCase = async (caseId: string) => {
    try {
      console.log('🔍 Buscando caso:', caseId);
      
      const { data, error } = await supabase
        .from('medical_cases')
        .select('*')
        .eq('id', caseId)
        .single();

      if (error) throw error;

      console.log('✅ Caso carregado:', data.title);
      setMedicalCase(data);
    } catch (error: any) {
      console.error('❌ Erro ao buscar caso:', error);
      toast({
        title: "Erro ao carregar caso",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminateOption = (correctAnswerIndex: number) => {
    if (!medicalCase) return;
    
    // Encontrar uma opção incorreta para eliminar
    const incorrectOptions = medicalCase.answer_options
      .map((_, index) => index)
      .filter(index => index !== correctAnswerIndex && !eliminatedOptions.includes(index));
    
    if (incorrectOptions.length > 0) {
      const randomIncorrect = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
      setEliminatedOptions(prev => [...prev, randomIncorrect]);
      
      toast({
        title: "✅ Alternativa Eliminada!",
        description: `Alternativa ${String.fromCharCode(65 + randomIncorrect)} foi eliminada.`,
      });
    }
  };

  const handleSkip = () => {
    toast({
      title: "⏭️ Caso Pulado",
      description: `Você perdeu ${medicalCase?.skip_penalty_points || 0} pontos.`,
    });
    navigate('/app/casos');
  };

  const handleAIHint = async () => {
    if (!medicalCase) return;
    
    try {
      setShowAiHint(true);
      
      // Simular dica de IA baseada no caso
      const hintText = medicalCase.manual_hint || 
        `Dica: Analise cuidadosamente os achados radiológicos e considere a idade do paciente (${medicalCase.patient_age}). 
        Os sintomas apresentados são compatíveis com o padrão de imagem observado.`;
      
      setAiHintText(hintText);
      
      toast({
        title: "🧠 Dica de IA Ativada!",
        description: "Confira a dica abaixo para te ajudar na resolução.",
      });
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar dica de IA:', error);
      toast({
        title: "Erro na dica de IA",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAnswerSubmit = async () => {
    if (selectedAnswer === null || !medicalCase) return;

    const isCorrect = selectedAnswer === medicalCase.correct_answer_index;
    
    try {
      const { error } = await supabase.rpc('process_case_completion', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_case_id: medicalCase.id,
        p_points: isCorrect ? medicalCase.points : 0,
        p_is_correct: isCorrect
      });

      if (error) throw error;

      setShowResults(true);
      
      toast({
        title: isCorrect ? "✅ Resposta Correta!" : "❌ Resposta Incorreta",
        description: isCorrect 
          ? `Parabéns! Você ganhou ${medicalCase.points} pontos.`
          : "Não desanime, continue estudando!",
        variant: isCorrect ? "default" : "destructive",
      });

    } catch (error: any) {
      console.error('❌ Erro ao processar resposta:', error);
      toast({
        title: "Erro ao processar resposta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando caso médico...</p>
        </div>
      </div>
    );
  }

  if (!medicalCase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Caso não encontrado</h2>
            <p className="text-gray-600 mb-4">O caso médico solicitado não foi encontrado.</p>
            <Button onClick={() => navigate('/app/casos')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Casos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/app/casos')}
            className="bg-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Casos
          </Button>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <BookOpen className="h-3 w-3 mr-1" />
              {medicalCase.specialty}
            </Badge>
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              <Target className="h-3 w-3 mr-1" />
              {medicalCase.modality}
            </Badge>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              <Award className="h-3 w-3 mr-1" />
              {medicalCase.points} pts
            </Badge>
          </div>
        </div>

        {/* Case Title */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <FolderTree className="h-6 w-6 text-green-600" />
              {medicalCase.title}
              {images.length > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {images.length} imagem(ns) organizadas
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-6 text-sm text-gray-600 mt-2">
              {medicalCase.patient_age && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {medicalCase.patient_age}
                </div>
              )}
              {medicalCase.patient_gender && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {medicalCase.patient_gender}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(medicalCase.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Sistema de Ajudas Integrado */}
        {!showResults && (
          <HelpSystem
            maxElimination={medicalCase.max_elimination}
            canSkip={medicalCase.can_skip}
            skipPenalty={medicalCase.skip_penalty_points}
            eliminationPenalty={medicalCase.elimination_penalty_points}
            aiHintEnabled={medicalCase.ai_hint_enabled}
            onEliminateOption={handleEliminateOption}
            onSkip={handleSkip}
            onAIHint={handleAIHint}
            eliminatedOptions={eliminatedOptions}
            correctAnswerIndex={medicalCase.correct_answer_index}
          />
        )}

        {/* Dica de IA */}
        {showAiHint && aiHintText && (
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
                <Sparkles className="h-5 w-5" />
                Dica da IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-700">{aiHintText}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Images Section */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5 text-green-600" />
                Imagens Especializadas
                {images.length > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Sistema Organizado
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {imagesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Carregando imagens especializadas...</p>
                  </div>
                </div>
              ) : images.length > 0 ? (
                <SpecializedImageViewer
                  images={images}
                  currentIndex={currentImageIndex}
                  onIndexChange={setCurrentImageIndex}
                />
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-500">
                    <FolderTree className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Nenhuma imagem disponível</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Case Information */}
          <div className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Informações Clínicas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {medicalCase.patient_clinical_info}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Achados Radiológicos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {medicalCase.findings}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Question Section */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              {medicalCase.main_question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {medicalCase.answer_options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="radio"
                  id={`option-${index}`}
                  name="answer"
                  value={index}
                  checked={selectedAnswer === index}
                  onChange={() => setSelectedAnswer(index)}
                  disabled={showResults || eliminatedOptions.includes(index)}
                  className="h-4 w-4 text-blue-600"
                />
                <label 
                  htmlFor={`option-${index}`} 
                  className={`flex-1 p-3 rounded-lg border cursor-pointer transition-colors ${
                    eliminatedOptions.includes(index)
                      ? 'bg-red-100 border-red-300 text-red-500 line-through opacity-50'
                      : showResults
                      ? index === medicalCase.correct_answer_index
                        ? 'bg-green-100 border-green-300 text-green-800'
                        : selectedAnswer === index && index !== medicalCase.correct_answer_index
                        ? 'bg-red-100 border-red-300 text-red-800'
                        : 'bg-gray-50 border-gray-200'
                      : selectedAnswer === index
                      ? 'bg-blue-100 border-blue-300'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium">{String.fromCharCode(65 + index)}) </span>
                  {option}
                  {showResults && index === medicalCase.correct_answer_index && (
                    <CheckCircle className="h-5 w-5 text-green-600 float-right" />
                  )}
                  {showResults && selectedAnswer === index && index !== medicalCase.correct_answer_index && (
                    <XCircle className="h-5 w-5 text-red-600 float-right" />
                  )}
                  {eliminatedOptions.includes(index) && (
                    <XCircle className="h-5 w-5 text-red-500 float-right" />
                  )}
                </label>
              </div>
            ))}

            {!showResults && (
              <Button 
                onClick={handleAnswerSubmit}
                disabled={selectedAnswer === null}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Confirmar Resposta
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Explanation */}
        {showResults && (
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-green-800">Explicação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {medicalCase.explanation}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
