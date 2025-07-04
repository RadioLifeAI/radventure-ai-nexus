import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  Coins,
  Users,
  Calendar,
  Brain,
  Sparkles
} from "lucide-react";
import { useDailyChallenge } from "@/hooks/useDailyChallenge";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function DailyChallengeModal({ open, onClose }: Props) {
  const {
    challenge,
    isLoading,
    hasAnswered,
    result,
    submitAnswer,
    getCommunityStats
  } = useDailyChallenge();

  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // DEBUG: Log das props do modal
  console.log('🎯 DailyChallengeModal render:', { 
    open, 
    challenge: challenge?.id, 
    isLoading, 
    hasAnswered 
  });

  const handleAnswerSelect = (answer: boolean) => {
    if (hasAnswered) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null || hasAnswered) return;
    
    await submitAnswer(selectedAnswer);
    
    if (result?.was_correct) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const communityStats = getCommunityStats();

  if (!challenge) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            <div className="animate-[confetti_3s_ease-out]">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${1 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <DialogHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Desafio do Dia
            </DialogTitle>
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(challenge.challenge_date).toLocaleDateString('pt-BR')}
            </div>
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4 text-primary" />
              +5 RadCoins
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pergunta */}
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold leading-relaxed">
                  {challenge.question}
                </h3>
                
                {!hasAnswered && (
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={selectedAnswer === true ? "default" : "outline"}
                      size="lg"
                      onClick={() => handleAnswerSelect(true)}
                      disabled={isLoading}
                      className={cn(
                        "h-16 text-lg font-semibold transition-all duration-300",
                        selectedAnswer === true && "ring-2 ring-primary shadow-lg"
                      )}
                    >
                      ✓ Verdadeiro
                    </Button>
                    
                    <Button
                      variant={selectedAnswer === false ? "default" : "outline"}
                      size="lg"
                      onClick={() => handleAnswerSelect(false)}
                      disabled={isLoading}
                      className={cn(
                        "h-16 text-lg font-semibold transition-all duration-300",
                        selectedAnswer === false && "ring-2 ring-primary shadow-lg"
                      )}
                    >
                      ✗ Falso
                    </Button>
                  </div>
                )}

                {selectedAnswer !== null && !hasAnswered && (
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    size="lg"
                    className="w-full"
                  >
                    {isLoading ? 'Enviando...' : 'Confirmar Resposta'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resultado */}
          {hasAnswered && result && (
            <div className="space-y-4">
              {/* Feedback da Resposta */}
              <Card className={cn(
                "border-2 transition-all duration-500",
                result.was_correct 
                  ? "border-green-200 bg-green-50/50" 
                  : "border-orange-200 bg-orange-50/50"
              )}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    {result.was_correct ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <XCircle className="h-8 w-8 text-orange-600" />
                    )}
                    <div className="text-center">
                      <h3 className={cn(
                        "text-xl font-bold",
                        result.was_correct ? "text-green-700" : "text-orange-700"
                      )}>
                        {result.was_correct ? "Parabéns! Resposta Correta!" : "Oops! Resposta Incorreta"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        A resposta correta era: {result.correct_answer ? "Verdadeiro" : "Falso"}
                      </p>
                    </div>
                  </div>

                  {/* Recompensa */}
                  <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg">
                    <Coins className="h-5 w-5 text-primary" />
                    <span className="font-semibold">+{result.radcoins_awarded} RadCoins recebidos!</span>
                  </div>
                </CardContent>
              </Card>

              {/* Explicação */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Explicação Científica
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {result.explanation}
                  </p>
                </CardContent>
              </Card>

              {/* Estatísticas da Comunidade */}
              {communityStats && (
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Estatísticas da Comunidade
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Acertos da comunidade</span>
                        <Badge variant="secondary">
                          {communityStats.correctPercentage}%
                        </Badge>
                      </div>
                      
                      <Progress 
                        value={communityStats.correctPercentage} 
                        className="h-2"
                      />
                      
                      <div className="text-center text-sm text-muted-foreground">
                        {communityStats.totalResponses} pessoas já responderam
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex justify-center pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            {hasAnswered ? 'Fechar' : 'Pular por Hoje'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}