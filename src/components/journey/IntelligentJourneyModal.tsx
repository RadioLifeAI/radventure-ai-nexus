
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Brain, 
  Target, 
  Clock, 
  Users, 
  Sparkles, 
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  TrendingUp,
  BookOpen,
  Zap,
  Award
} from "lucide-react";

interface IntelligentJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateJourney: (journeyData: any) => void;
}

export function IntelligentJourneyModal({
  isOpen,
  onClose,
  onCreateJourney
}: IntelligentJourneyModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [journeyData, setJourneyData] = useState({
    objective: "",
    specialty: "",
    experience: "",
    timeAvailable: "",
    preferences: "",
    difficulty: "",
    caseCount: 10,
    estimatedDuration: 0
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  const steps = [
    { 
      number: 1, 
      title: "Objetivo", 
      description: "Defina seu objetivo de aprendizado",
      icon: Target 
    },
    { 
      number: 2, 
      title: "Perfil", 
      description: "Conte sobre sua experiência",
      icon: Users 
    },
    { 
      number: 3, 
      title: "Preferências", 
      description: "Configure suas preferências",
      icon: Sparkles 
    },
    { 
      number: 4, 
      title: "IA Recommendations", 
      description: "Sugestões personalizadas",
      icon: Brain 
    },
    { 
      number: 5, 
      title: "Confirmação", 
      description: "Revise e crie sua jornada",
      icon: CheckCircle 
    }
  ];

  const specialties = [
    "Radiologia", "Cardiologia", "Neurologia", "Dermatologia",
    "Pneumologia", "Gastroenterologia", "Medicina Interna", "Ortopedia"
  ];

  const experienceLevels = [
    { value: "beginner", label: "Iniciante", description: "Recém começando" },
    { value: "intermediate", label: "Intermediário", description: "Alguma experiência" },
    { value: "advanced", label: "Avançado", description: "Experiência significativa" },
    { value: "expert", label: "Especialista", description: "Muito experiente" }
  ];

  const timeOptions = [
    { value: "1-2h", label: "1-2 horas/semana", icon: Clock },
    { value: "3-5h", label: "3-5 horas/semana", icon: Clock },
    { value: "6-10h", label: "6-10 horas/semana", icon: Clock },
    { value: "10+h", label: "10+ horas/semana", icon: Clock }
  ];

  const handleNext = () => {
    if (currentStep === 4 && !aiSuggestions) {
      generateAISuggestions();
    } else if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateAISuggestions = async () => {
    setIsGenerating(true);
    
    // Simular chamada para IA (implementar integração real depois)
    setTimeout(() => {
      setAiSuggestions({
        recommendedCases: 15,
        estimatedDuration: "3-4 semanas",
        difficultyProgression: "Gradual (Básico → Avançado)",
        focusAreas: ["Diagnóstico por Imagem", "Casos Clínicos", "Correlação Anatômica"],
        specializedTracks: [
          {
            name: "Track Essencial",
            cases: 8,
            difficulty: "Básico-Intermediário",
            time: "2 semanas"
          },
          {
            name: "Track Avançado",
            cases: 12,
            difficulty: "Intermediário-Avançado", 
            time: "3 semanas"
          },
          {
            name: "Track Master",
            cases: 20,
            difficulty: "Avançado-Expert",
            time: "4 semanas"
          }
        ],
        personalizedTips: [
          "Baseado no seu perfil, recomendamos começar com casos de dificuldade média",
          "Inclua casos de diferentes modalidades para ampliar conhecimento",
          "Reserve tempo extra para casos mais complexos"
        ]
      });
      setIsGenerating(false);
      setCurrentStep(5);
    }, 2000);
  };

  const handleCreateJourney = () => {
    const finalJourneyData = {
      ...journeyData,
      aiSuggestions,
      createdAt: new Date().toISOString()
    };
    onCreateJourney(finalJourneyData);
    onClose();
  };

  const currentStepData = steps[currentStep - 1];
  const Icon = currentStepData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Brain className="h-7 w-7 text-purple-600" />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Criador Inteligente de Jornadas
            </span>
          </DialogTitle>
          <DialogDescription>
            Nossa IA criará uma jornada personalizada baseada nos seus objetivos e perfil
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Etapa {currentStep} de {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / steps.length) * 100)}% completo
            </span>
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
          
          {/* Steps Indicator */}
          <div className="flex justify-between mt-4">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isActive = step.number === currentStep;
              const isCompleted = step.number < currentStep;
              
              return (
                <div key={step.number} className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                        ? 'bg-purple-500 border-purple-500 text-white' 
                        : 'bg-gray-200 border-gray-300 text-gray-500'
                  }`}>
                    <StepIcon className="h-5 w-5" />
                  </div>
                  <span className={`text-xs mt-1 text-center ${
                    isActive ? 'text-purple-600 font-medium' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 min-h-[400px]">
          <div className="flex items-center gap-3 mb-6">
            <Icon className="h-6 w-6 text-purple-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{currentStepData.title}</h3>
              <p className="text-gray-600">{currentStepData.description}</p>
            </div>
          </div>

          {/* Step 1: Objetivo */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qual é seu principal objetivo de aprendizado?
                </label>
                <Textarea
                  placeholder="Ex: Melhorar diagnóstico por imagem em radiologia torácica, preparar para residência..."
                  value={journeyData.objective}
                  onChange={(e) => setJourneyData({...journeyData, objective: e.target.value})}
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Especialidade de interesse principal
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {specialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant={journeyData.specialty === specialty ? "default" : "outline"}
                      className="cursor-pointer justify-center py-3 transition-all hover:scale-105"
                      onClick={() => setJourneyData({...journeyData, specialty})}
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Perfil */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Seu nível de experiência
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {experienceLevels.map((level) => (
                    <Card
                      key={level.value}
                      className={`cursor-pointer transition-all hover:scale-105 ${
                        journeyData.experience === level.value
                          ? 'ring-2 ring-purple-500 bg-purple-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setJourneyData({...journeyData, experience: level.value})}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-medium text-gray-900">{level.label}</h4>
                        <p className="text-sm text-gray-600">{level.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tempo disponível por semana
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {timeOptions.map((time) => {
                    const TimeIcon = time.icon;
                    return (
                      <Badge
                        key={time.value}
                        variant={journeyData.timeAvailable === time.value ? "default" : "outline"}
                        className="cursor-pointer justify-center py-3 gap-2 transition-all hover:scale-105"
                        onClick={() => setJourneyData({...journeyData, timeAvailable: time.value})}
                      >
                        <TimeIcon className="h-4 w-4" />
                        {time.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferências */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferências específicas (opcional)
                </label>
                <Textarea
                  placeholder="Ex: Focar em casos raros, incluir mais modalidades específicas, priorizar casos práticos..."
                  value={journeyData.preferences}
                  onChange={(e) => setJourneyData({...journeyData, preferences: e.target.value})}
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Quantidade de casos desejada
                  </label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min="5"
                      max="50"
                      value={journeyData.caseCount}
                      onChange={(e) => setJourneyData({...journeyData, caseCount: parseInt(e.target.value)})}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600">casos (5-50)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Nível de dificuldade preferido
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "progressive", label: "Progressivo (Fácil → Difícil)" },
                      { value: "mixed", label: "Misto (Variado)" },
                      { value: "advanced", label: "Apenas Avançado" }
                    ].map((diff) => (
                      <Badge
                        key={diff.value}
                        variant={journeyData.difficulty === diff.value ? "default" : "outline"}
                        className="cursor-pointer w-full justify-center py-2"
                        onClick={() => setJourneyData({...journeyData, difficulty: diff.value})}
                      >
                        {diff.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: IA Recommendations */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {isGenerating ? (
                <div className="text-center py-12">
                  <Brain className="h-16 w-16 text-purple-600 mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    IA Analisando seu Perfil
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Criando recomendações personalizadas baseadas nas suas respostas...
                  </p>
                  <Progress value={75} className="w-64 mx-auto" />
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Pronto para Análise IA
                  </h3>
                  <p className="text-gray-600">
                    Clique em "Próximo" para gerar suas recomendações personalizadas
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Confirmação */}
          {currentStep === 5 && aiSuggestions && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Jornada Personalizada Criada!</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{aiSuggestions.recommendedCases}</div>
                    <div className="text-xs text-gray-600">Casos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{aiSuggestions.estimatedDuration}</div>
                    <div className="text-xs text-gray-600">Duração</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{aiSuggestions.focusAreas.length}</div>
                    <div className="text-xs text-gray-600">Áreas Foco</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{aiSuggestions.specializedTracks.length}</div>
                    <div className="text-xs text-gray-600">Trilhas</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiSuggestions.specializedTracks.map((track: any, index: number) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{track.name}</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>📚 {track.cases} casos</div>
                        <div>🎯 {track.difficulty}</div>
                        <div>⏱️ {track.time}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Dicas Personalizadas:</h4>
                <ul className="space-y-1">
                  {aiSuggestions.personalizedTips.map((tip: string, index: number) => (
                    <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            
            {currentStep === 5 ? (
              <Button
                onClick={handleCreateJourney}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Criar Jornada
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && (!journeyData.objective || !journeyData.specialty)) ||
                  (currentStep === 2 && (!journeyData.experience || !journeyData.timeAvailable)) ||
                  (currentStep === 4 && isGenerating)
                }
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex items-center gap-2"
              >
                {currentStep === 4 && !aiSuggestions ? (
                  <>
                    <Brain className="h-4 w-4" />
                    Gerar com IA
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
