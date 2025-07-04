import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Minimize2,
  Maximize2,
  X,
  Trophy,
  Target,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyChallenge {
  id: string;
  question: string;
  explanation: string;
  community_stats: {
    total_responses: number;
    correct_responses: number;
  };
  challenge_date: string;
}

interface ChallengeResult {
  was_correct: boolean;
  correct_answer: boolean;
  explanation: string;
  community_stats: {
    total_responses: number;
    correct_responses: number;
  };
  radcoins_awarded: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  challenge: DailyChallenge | null;
  isLoading: boolean;
  hasAnswered: boolean;
  result: ChallengeResult | null;
  onSubmitAnswer: (answer: boolean) => Promise<void>;
  getCommunityStats: () => { correctPercentage: number; incorrectPercentage: number; totalResponses: number; } | null;
}

export function DailyChallengeToast({ 
  open, 
  onClose, 
  challenge, 
  isLoading, 
  hasAnswered, 
  result, 
  onSubmitAnswer, 
  getCommunityStats 
}: Props) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setIsMinimized(false);
    } else {
      setIsVisible(false);
    }
  }, [open]);

  const handleAnswerSelect = (answer: boolean) => {
    if (hasAnswered) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null || hasAnswered) return;
    
    await onSubmitAnswer(selectedAnswer);
    
    if (result?.was_correct) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  const communityStats = getCommunityStats();

  if (!challenge || !isVisible) return null;

  const MinimizedView = () => (
    <div className="w-16 h-16 bg-gradient-to-br from-primary via-accent to-primary rounded-full flex items-center justify-center shadow-2xl cursor-pointer group hover:scale-110 transition-all duration-300 border-4 border-white/20 backdrop-blur-sm"
         onClick={() => setIsMinimized(false)}>
      <div className="relative">
        <Brain className="h-8 w-8 text-white animate-pulse" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce">
          !
        </div>
      </div>
    </div>
  );

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
        <MinimizedView />
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="animate-[confetti_3s_ease-out]">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-bounce"
                style={{
                  background: `hsl(${Math.random() * 360}, 70%, 60%)`,
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

      <Card className="w-[420px] max-h-[600px] overflow-hidden bg-gradient-to-br from-background via-background/95 to-primary/5 border-primary/20 shadow-2xl backdrop-blur-lg">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary via-accent to-primary p-4 text-white">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Desafio RadVenture</h3>
                <p className="text-xs opacity-90 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(challenge.challenge_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(true)}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClose}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Reward Badge */}
          <div className="mt-2 flex items-center justify-center">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-3 py-1 border-0">
              <Coins className="h-4 w-4 mr-1" />
              +5 RadCoins
            </Badge>
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Question */}
          <div className="bg-gradient-to-br from-background to-primary/5 rounded-lg p-4 border border-primary/10">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-primary mb-2">Pergunta do Dia</h4>
                <p className="text-sm leading-relaxed">{challenge.question}</p>
              </div>
            </div>
            
            {!hasAnswered && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={selectedAnswer === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAnswerSelect(true)}
                    disabled={isLoading}
                    className={cn(
                      "h-12 font-semibold transition-all duration-300 text-xs",
                      selectedAnswer === true && "ring-2 ring-primary shadow-lg bg-gradient-to-r from-green-500 to-green-600 border-0"
                    )}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Verdadeiro
                  </Button>
                  
                  <Button
                    variant={selectedAnswer === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAnswerSelect(false)}
                    disabled={isLoading}
                    className={cn(
                      "h-12 font-semibold transition-all duration-300 text-xs",
                      selectedAnswer === false && "ring-2 ring-primary shadow-lg bg-gradient-to-r from-red-500 to-red-600 border-0"
                    )}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Falso
                  </Button>
                </div>

                {selectedAnswer !== null && (
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 border-0 shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Confirmar Resposta
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Result */}
          {hasAnswered && result && (
            <div className="space-y-3">
              {/* Feedback */}
              <Card className={cn(
                "border-2 transition-all duration-500",
                result.was_correct 
                  ? "border-green-500/30 bg-gradient-to-br from-green-50/80 to-green-100/50" 
                  : "border-orange-500/30 bg-gradient-to-br from-orange-50/80 to-orange-100/50"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {result.was_correct ? (
                      <>
                        <div className="p-2 bg-green-500 rounded-full">
                          <Trophy className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-green-700">Parabéns!</h4>
                          <p className="text-xs text-green-600">Resposta correta</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-orange-500 rounded-full">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-orange-700">Quase lá!</h4>
                          <p className="text-xs text-orange-600">Resposta: {result.correct_answer ? "Verdadeiro" : "Falso"}</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-2 p-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                    <Coins className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">+{result.radcoins_awarded} RadCoins</span>
                  </div>
                </CardContent>
              </Card>

              {/* Explanation */}
              <Card className="border-primary/10">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    Explicação
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {result.explanation}
                  </p>
                </CardContent>
              </Card>

              {/* Community Stats */}
              {communityStats && (
                <Card className="border-primary/10">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Comunidade
                    </h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Acertos</span>
                        <Badge variant="secondary" className="text-xs">
                          {communityStats.correctPercentage}%
                        </Badge>
                      </div>
                      
                      <Progress 
                        value={communityStats.correctPercentage} 
                        className="h-1.5"
                      />
                      
                      <div className="text-center text-xs text-muted-foreground">
                        {communityStats.totalResponses} respostas
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}