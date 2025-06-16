
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Rocket, Trophy, Users, Award, Zap, ArrowRight, ArrowLeft, X } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tutorialSteps = [
  {
    title: "Bem-vindo ao RadVenture!",
    icon: <Rocket className="text-cyan-400" size={48} />,
    content: "Transforme seu aprendizado em radiologia em uma aventura gamificada! Aqui você vai resolver casos reais, ganhar pontos e conquistar achievements.",
    bgGradient: "from-cyan-500 to-blue-600"
  },
  {
    title: "Sistema de Pontos",
    icon: <Zap className="text-yellow-400" size={48} />,
    content: "Ganhe RadCoins e pontos resolvendo casos! Quanto mais difícil o caso, maior a recompensa. Use suas moedas para desbloquear recursos especiais.",
    bgGradient: "from-yellow-500 to-orange-600"
  },
  {
    title: "Rankings e Competições",
    icon: <Trophy className="text-amber-400" size={48} />,
    content: "Dispute com médicos do mundo todo! Participe de eventos, suba nos rankings e mostre suas habilidades em radiologia.",
    bgGradient: "from-amber-500 to-red-600"
  },
  {
    title: "Conquistas e Progressão",
    icon: <Award className="text-purple-400" size={48} />,
    content: "Desbloqueie achievements únicos, complete seu perfil e acompanhe sua evolução do iniciante ao mestre radiologista!",
    bgGradient: "from-purple-500 to-pink-600"
  },
  {
    title: "Comunidade Global",
    icon: <Users className="text-green-400" size={48} />,
    content: "Conecte-se com estudantes e médicos de todo o mundo. Aprenda, ensine e cresça junto com a comunidade RadVenture!",
    bgGradient: "from-green-500 to-teal-600"
  }
];

export function WelcomeModal({ isOpen, onClose, onComplete }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSkipOption, setShowSkipOption] = useState(false);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  const currentStepData = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/30 text-white">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkip}
            className="absolute -top-2 -right-2 text-gray-400 hover:text-white z-10"
          >
            <X size={20} />
          </Button>
          
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-2xl font-bold text-white">
              Tutorial RadVenture
            </DialogTitle>
            <Progress value={progress} className="w-full mt-4 bg-slate-700" />
            <span className="text-sm text-gray-300 mt-2">
              {currentStep + 1} de {tutorialSteps.length}
            </span>
          </DialogHeader>

          <Card className={`bg-gradient-to-r ${currentStepData.bgGradient} border-none mb-6`}>
            <CardContent className="p-8 text-center">
              <div className="mb-4 flex justify-center">
                {currentStepData.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {currentStepData.title}
              </h3>
              <p className="text-white/90 text-lg leading-relaxed">
                {currentStepData.content}
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="border-cyan-500 text-cyan-300 hover:bg-cyan-900/30"
            >
              <ArrowLeft size={16} className="mr-2" />
              Anterior
            </Button>

            {!showSkipOption && currentStep === 0 && (
              <Button
                variant="ghost"
                onClick={() => setShowSkipOption(true)}
                className="text-gray-400 hover:text-white"
              >
                Pular tutorial
              </Button>
            )}

            {showSkipOption && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-400 hover:text-white"
              >
                Pular e ir direto ao app
              </Button>
            )}

            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold"
            >
              {currentStep === tutorialSteps.length - 1 ? (
                'Começar Aventura!'
              ) : (
                <>
                  Próximo
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
