
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Play, 
  Pause, 
  SkipForward, 
  CheckCircle, 
  XCircle,
  Target,
  Clock,
  Trophy,
  BookOpen
} from "lucide-react";
import { useJourneyManagement } from "@/hooks/useJourneyManagement";
import { useCasesData } from "@/hooks/useCasesData";
import { toast } from "@/components/ui/use-toast";

interface JourneyExecutionModalProps {
  journey: any;
  isOpen: boolean;
  onClose: () => void;
}

export function JourneyExecutionModal({ journey, isOpen, onClose }: JourneyExecutionModalProps) {
  const [currentCaseIndex, setCurrentCaseIndex] = useState(journey.current_case_index || 0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showCaseDetails, setShowCaseDetails] = useState(false);
  
  const { updateJourneyProgress } = useJourneyManagement();
  const { cases, loading: casesLoading } = useCasesData();

  // Buscar casos da jornada
  const journeyCases = cases.filter(case_item => 
    journey.case_ids && journey.case_ids.includes(case_item.id)
  );

  const currentCase = journeyCases[currentCaseIndex];
  const progress = ((currentCaseIndex + 1) / journeyCases.length) * 100;

  // Iniciar sessão
  const startSession = () => {
    setSessionStarted(true);
    setShowCaseDetails(true);
    
    if (journey.id !== 'preview') {
      updateJourneyProgress.mutate({
        journeyId: journey.id,
        caseIndex: currentCaseIndex
      });
    }
  };

  // Próximo caso
  const nextCase = () => {
    if (currentCaseIndex < journeyCases.length - 1) {
      const newIndex = currentCaseIndex + 1;
      setCurrentCaseIndex(newIndex);
      
      if (journey.id !== 'preview') {
        updateJourneyProgress.mutate({
          journeyId: journey.id,
          caseIndex: newIndex
        });
      }
    } else {
      // Jornada concluída
      if (journey.id !== 'preview') {
        updateJourneyProgress.mutate({
          journeyId: journey.id,
          caseIndex: currentCaseIndex,
          isCompleted: true
        });
      }
      
      toast({
        title: "🎉 Jornada Concluída!",
        description: "Parabéns! Você completou toda a trilha de aprendizado",
        className: "bg-green-50 border-green-200"
      });
      
      onClose();
    }
  };

  // Caso anterior
  const previousCase = () => {
    if (currentCaseIndex > 0) {
      setCurrentCaseIndex(currentCaseIndex - 1);
    }
  };

  // Simular resposta de caso (para preview)
  const handleCaseAnswer = (isCorrect: boolean) => {
    toast({
      title: isCorrect ? "✅ Resposta Correta!" : "❌ Resposta Incorreta",
      description: isCorrect ? "Continue assim!" : "Revise o conteúdo e tente novamente",
      className: isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
    });
    
    setTimeout(() => {
      nextCase();
    }, 1500);
  };

  if (casesLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <BookOpen className="h-12 w-12 mx-auto text-purple-400 animate-pulse mb-4" />
              <p className="text-gray-600">Carregando jornada...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-purple-600" />
            {journey.title}
            {journey.id === 'preview' && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800">Preview</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header da Jornada */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">
                    Caso {currentCaseIndex + 1} de {journeyCases.length}
                  </h3>
                  <p className="text-purple-700">{journey.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <Clock className="h-4 w-4" />
                    ~{journeyCases.length * 5} minutos
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <Target className="h-4 w-4" />
                    {journey.objectives?.length || 0} objetivos
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-700">Progresso</span>
                  <span className="font-medium text-purple-900">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Objetivos */}
          {journey.objectives && journey.objectives.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Objetivos de Aprendizado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {journey.objectives.map((objective: string, index: number) => (
                    <Badge key={index} variant="outline" className="border-purple-200 text-purple-700">
                      {objective}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conteúdo do Caso */}
          {!sessionStarted ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-16 w-16 mx-auto text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Pronto para começar?
                </h3>
                <p className="text-gray-600 mb-6">
                  Esta jornada contém {journeyCases.length} casos médicos selecionados
                  {journey.id === 'preview' && " (modo preview)"}
                </p>
                <Button
                  onClick={startSession}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Jornada
                </Button>
              </CardContent>
            </Card>
          ) : currentCase ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{currentCase.title}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">{currentCase.specialty}</Badge>
                    <Badge variant="outline">{currentCase.modality}</Badge>
                    {currentCase.difficulty_level && (
                      <Badge variant="outline">Nível {currentCase.difficulty_level}</Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Descrição do Caso:</h4>
                  <p className="text-gray-700">{currentCase.description}</p>
                </div>

                {currentCase.patient_clinical_info && (
                  <div>
                    <h4 className="font-medium mb-2">Informações Clínicas:</h4>
                    <p className="text-gray-700">{currentCase.patient_clinical_info}</p>
                  </div>
                )}

                {currentCase.findings && (
                  <div>
                    <h4 className="font-medium mb-2">Achados:</h4>
                    <p className="text-gray-700">{currentCase.findings}</p>
                  </div>
                )}

                {journey.id === 'preview' && (
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-medium">Simulação de Resposta (Preview):</h4>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleCaseAnswer(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Resposta Correta
                      </Button>
                      <Button
                        onClick={() => handleCaseAnswer(false)}
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Resposta Incorreta
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <XCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Caso não encontrado
                </h3>
                <p className="text-gray-600">
                  Não foi possível carregar o caso atual
                </p>
              </CardContent>
            </Card>
          )}

          {/* Controles de Navegação */}
          {sessionStarted && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Button
                    onClick={previousCase}
                    disabled={currentCaseIndex === 0}
                    variant="outline"
                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    Anterior
                  </Button>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Trophy className="h-4 w-4" />
                    Caso {currentCaseIndex + 1} de {journeyCases.length}
                  </div>

                  <Button
                    onClick={nextCase}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {currentCaseIndex === journeyCases.length - 1 ? 'Finalizar' : 'Próximo'}
                    <SkipForward className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
