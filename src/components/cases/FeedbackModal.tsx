
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Target, Zap, Star, ArrowRight, RotateCcw } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  isCorrect: boolean;
  correctAnswer: string;
  selectedAnswer: string;
  explanation: string;
  performance: {
    points: number;
    timeSpent: number;
    helpUsed: string[];
    penalty: number;
    selectedIndex?: number;
    answerFeedbacks?: string[];
  };
  onNextCase: () => void;
  onReviewCase: () => void;
};

export function FeedbackModal({
  open,
  onClose,
  isCorrect,
  correctAnswer,
  selectedAnswer,
  explanation,
  performance,
  onNextCase,
  onReviewCase
}: Props) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Função para normalizar texto para comparação visual
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, '') // Remove pontuação
      .replace(/\s+/g, ' '); // Normaliza espaços
  };

  // Verificação adicional para casos onde as respostas são textualmente iguais
  const actuallyCorrect = isCorrect || normalizeText(selectedAnswer) === normalizeText(correctAnswer);

  // Obter o feedback da alternativa selecionada
  const selectedFeedback = performance.answerFeedbacks && performance.selectedIndex !== undefined 
    ? performance.answerFeedbacks[performance.selectedIndex] 
    : '';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {actuallyCorrect ? (
              <>
                <Trophy className="text-green-500" size={24} />
                <span className="text-green-600">Parabéns! Resposta Correta!</span>
              </>
            ) : (
              <>
                <Target className="text-red-500" size={24} />
                <span className="text-red-600">Resposta Incorreta</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Performance Summary */}
        <Card className={`border-2 ${actuallyCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Trophy className="text-yellow-500" size={20} />
                </div>
                <div className="text-2xl font-bold">{actuallyCorrect ? performance.points : 0}</div>
                <div className="text-xs text-gray-600">Pontos</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="text-blue-500" size={20} />
                </div>
                <div className="text-2xl font-bold">{formatTime(performance.timeSpent)}</div>
                <div className="text-xs text-gray-600">Tempo</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Zap className="text-purple-500" size={20} />
                </div>
                <div className="text-2xl font-bold">{performance.helpUsed.length}</div>
                <div className="text-xs text-gray-600">Ajudas</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Star className="text-orange-500" size={20} />
                </div>
                <div className="text-2xl font-bold">
                  {actuallyCorrect ? "100%" : "0%"}
                </div>
                <div className="text-xs text-gray-600">Precisão</div>
              </div>
            </div>
            
            {performance.penalty > 0 && (
              <div className="mt-3 p-2 bg-orange-100 border border-orange-200 rounded">
                <div className="text-sm text-orange-700">
                  <strong>Penalizações:</strong> -{performance.penalty} pontos
                </div>
              </div>
            )}
            
            {performance.helpUsed.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-medium mb-1">Ajudas utilizadas:</div>
                <div className="flex gap-1 flex-wrap">
                  {performance.helpUsed.map((help, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {help}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Answer Review */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Revisão da Resposta</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2">
                <span className="font-medium">Sua resposta:</span>
                <span className={actuallyCorrect ? 'text-green-600' : 'text-red-600'}>
                  {selectedAnswer}
                </span>
              </div>
              
              {!actuallyCorrect && (
                <div className="flex items-start gap-2">
                  <span className="font-medium">Resposta correta:</span>
                  <span className="text-green-600">{correctAnswer}</span>
                </div>
              )}
            </div>
            
            {/* Feedback da alternativa selecionada */}
            {selectedFeedback && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                <h4 className="font-medium text-blue-800 mb-2">Feedback da sua resposta:</h4>
                <p className="text-blue-700 text-sm leading-relaxed">{selectedFeedback}</p>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <h4 className="font-medium text-blue-800 mb-2">Explicação:</h4>
              <p className="text-blue-700 text-sm leading-relaxed">{explanation}</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={onNextCase}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            <ArrowRight size={16} className="mr-2" />
            Próximo Caso
          </Button>
          
          <Button
            onClick={onReviewCase}
            variant="outline"
            className="flex-1"
          >
            <RotateCcw size={16} className="mr-2" />
            Revisar Caso
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
