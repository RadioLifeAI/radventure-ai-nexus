
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SpecializedImageViewer } from "@/components/cases/SpecializedImageViewer";
import { useSpecializedCaseImages } from "@/hooks/useSpecializedCaseImages";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock,
  BookOpen,
  Award,
  User,
  Calendar,
  Target,
  FolderTree
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
}

export default function CasoUsuarioView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [medicalCase, setMedicalCase] = useState<MedicalCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Hook especializado único para imagens
  const { images, loading: imagesLoading } = useSpecializedCaseImages(id);

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

  const handleAnswerSubmit = async () => {
    if (selectedAnswer === null || !medicalCase) return;

    const isCorrect = selectedAnswer === medicalCase.correct_answer_index;
    
    try {
      // Processar resposta do caso
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
            <Button onClick={() => navigate('/casos')}>
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
            onClick={() => navigate('/casos')}
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
            
            {/* Patient Info */}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Images Section - Sistema Especializado */}
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
            {/* Clinical Info */}
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

            {/* Findings */}
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
                  disabled={showResults}
                  className="h-4 w-4 text-blue-600"
                />
                <label 
                  htmlFor={`option-${index}`} 
                  className={`flex-1 p-3 rounded-lg border cursor-pointer transition-colors ${
                    showResults
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

        {/* Explanation - Show after answer */}
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
