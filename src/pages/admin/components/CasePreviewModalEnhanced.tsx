
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  User, 
  Clock, 
  Target, 
  Lightbulb, 
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
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface CasePreviewModalEnhancedProps {
  open: boolean;
  onClose: () => void;
  caseId?: string | null;
  formData?: any;
  categories?: any[];
  difficulties?: any[];
}

export function CasePreviewModalEnhanced({
  open,
  onClose,
  caseId,
  formData,
  categories: externalCategories,
  difficulties: externalDifficulties,
}: CasePreviewModalEnhancedProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [showExplanation, setShowExplanation] = useState(false);

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

  const actualCaseData = formData || caseData;
  const actualCategories = externalCategories || categories;
  const actualDifficulties = externalDifficulties || difficulties;

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

  const form = actualCaseData || {};
  const category = getCategoryName(actualCategories, form.category_id);
  const difficulty = getDifficultyDesc(actualDifficulties, form.difficulty_level);
  const difficultyLevel = form.difficulty_level || 1;
  
  const images = Array.isArray(form.image_url) ? form.image_url : 
    form.image_url ? [form.image_url] : [];

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const resetImageView = () => {
    setImageZoom(1);
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
        {/* Header Gamificado */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <Stethoscope className="h-8 w-8 text-blue-100" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-3 py-1">
                    {category}
                  </Badge>
                  <Badge className={cn("text-white font-bold px-3 py-1", getDifficultyColor(difficultyLevel))}>
                    {difficulty}
                  </Badge>
                  <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-3 py-1 flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    {form.points || 100} pts
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  {form.title || "Caso Clínico"}
                </h1>
                <p className="text-blue-100 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Preview Administrativo - Modo Quiz Simulado
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

        {/* Layout Principal - 3 Colunas */}
        <div className="flex h-full overflow-hidden">
          {/* Coluna 1: Imagem Médica */}
          <div className="w-80 bg-white border-r border-gray-200 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Imagem Médica
              </h3>
              {images.length > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevImage}
                    disabled={images.length <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600 px-2">
                    {currentImageIndex + 1}/{images.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextImage}
                    disabled={images.length <= 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex-1 relative bg-gray-100 rounded-lg overflow-hidden">
              {images.length > 0 ? (
                <div className="relative h-full">
                  <img
                    src={typeof images[currentImageIndex] === 'object' ? 
                      images[currentImageIndex].url : images[currentImageIndex]}
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
            {images.length > 0 && typeof images[currentImageIndex] === 'object' && images[currentImageIndex].legend && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">
                  {images[currentImageIndex].legend}
                </p>
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

              {/* Alternativas */}
              <div className="space-y-3">
                <div className="text-sm font-semibold text-blue-800 mb-3">Selecione sua resposta:</div>
                {(form.answer_options || []).map((option: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 text-left transition-all duration-300 flex items-center gap-3",
                      selectedAnswer === null 
                        ? "border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50 hover:shadow-md transform hover:-translate-y-1"
                        : selectedAnswer === index
                          ? index === form.correct_answer_index
                            ? "border-green-500 bg-green-50 text-green-800"
                            : "border-red-500 bg-red-50 text-red-800"
                          : index === form.correct_answer_index
                            ? "border-green-500 bg-green-100 text-green-800"
                            : "border-gray-200 bg-gray-50 text-gray-600 opacity-70"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                      selectedAnswer === null
                        ? "bg-blue-100 text-blue-700"
                        : selectedAnswer === index
                          ? index === form.correct_answer_index
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                          : index === form.correct_answer_index
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-gray-600"
                    )}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1">{option || "Opção vazia"}</span>
                    {selectedAnswer !== null && index === form.correct_answer_index && (
                      <div className="text-green-600">✓</div>
                    )}
                    {selectedAnswer === index && index !== form.correct_answer_index && (
                      <div className="text-red-600">✗</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Explicação Detalhada */}
            {showExplanation && (
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

          {/* Coluna 3: Sistema de Ajudas Compacto */}
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
                  disabled={selectedAnswer !== null}
                >
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="flex-1 text-left">Eliminar Opção</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">∞</Badge>
                </Button>
                <p className="text-xs text-yellow-600 mt-2">Remove uma alternativa incorreta</p>
              </div>

              {/* Pular Questão */}
              <div className="bg-white rounded-lg p-3 border border-orange-200 hover:shadow-md transition-shadow">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 border-orange-300 hover:bg-orange-50"
                  disabled={selectedAnswer !== null}
                >
                  <SkipForward className="h-4 w-4 text-orange-600" />
                  <span className="flex-1 text-left">Pular Questão</span>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">∞</Badge>
                </Button>
                <p className="text-xs text-orange-600 mt-2">Avança sem perder pontos</p>
              </div>

              {/* Tutor AI */}
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-purple-800">Tutor AI</span>
                  <Badge className="bg-purple-500 text-white text-xs">PRO</Badge>
                </div>
                <p className="text-xs text-purple-700 mb-3">
                  IA especializada em medicina disponível para ajudar
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-purple-300 hover:bg-purple-50"
                  disabled={selectedAnswer !== null}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Consultar Tutor
                </Button>
              </div>

              {/* Status Preview */}
              <div className="bg-gray-100 rounded-lg p-3 border border-gray-200 mt-6">
                <div className="text-xs text-gray-600 text-center">
                  <div className="font-semibold mb-1">🔍 MODO PREVIEW</div>
                  <div>Visualização administrativa</div>
                  <div>Ajudas ilimitadas ativadas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
