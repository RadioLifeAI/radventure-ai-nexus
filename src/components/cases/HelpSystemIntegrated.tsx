
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, SkipForward, HelpCircle, ShoppingCart, Coins } from "lucide-react";
import { useUserHelpAids } from "@/hooks/useUserHelpAids";
import { RadCoinStoreModal } from "@/components/store/RadCoinStoreModal";
import { useToast } from "@/components/ui/use-toast";

interface HelpSystemIntegratedProps {
  caseData: any;
  onEliminate: (optionIndex: number) => void;
  onSkip: () => void;
  onGetHint: (hint: string) => void;
  eliminatedOptions: number[];
  maxEliminations: number;
  canSkip: boolean;
}

export function HelpSystemIntegrated({
  caseData,
  onEliminate,
  onSkip,
  onGetHint,
  eliminatedOptions,
  maxEliminations,
  canSkip
}: HelpSystemIntegratedProps) {
  const { helpAids, consumeHelp, getTutorHint, isConsumingHelp, isGettingHint, tutorHintData } = useUserHelpAids();
  const [showStore, setShowStore] = useState(false);
  const { toast } = useToast();

  const handleElimination = async () => {
    if (eliminatedOptions.length >= maxEliminations) {
      toast({
        title: "Limite atingido",
        description: `Você já eliminou o máximo de ${maxEliminations} alternativas.`,
        variant: "destructive"
      });
      return;
    }

    if (!helpAids || helpAids.elimination_aids <= 0) {
      toast({
        title: "Sem ajudas disponíveis",
        description: "Você não possui ajudas de eliminação. Compre mais na loja!",
        variant: "destructive"
      });
      setShowStore(true);
      return;
    }

    // Consumir ajuda
    consumeHelp({ aidType: 'elimination' });

    // Encontrar alternativa incorreta para eliminar
    const availableOptions = caseData.answer_options
      ?.map((_, index) => index)
      .filter(index => index !== caseData.correct_answer_index && !eliminatedOptions.includes(index)) || [];

    if (availableOptions.length > 0) {
      const randomIndex = availableOptions[Math.floor(Math.random() * availableOptions.length)];
      onEliminate(randomIndex);
    }
  };

  const handleSkip = async () => {
    if (!canSkip) {
      toast({
        title: "Pular não disponível",
        description: "Este caso não permite pular.",
        variant: "destructive"
      });
      return;
    }

    if (!helpAids || helpAids.skip_aids <= 0) {
      toast({
        title: "Sem ajudas disponíveis",
        description: "Você não possui ajudas para pular. Compre mais na loja!",
        variant: "destructive"
      });
      setShowStore(true);
      return;
    }

    // Consumir ajuda
    consumeHelp({ aidType: 'skip' });
    onSkip();
  };

  const handleAIHint = async () => {
    if (!helpAids || helpAids.ai_tutor_credits <= 0) {
      toast({
        title: "Sem créditos disponíveis",
        description: "Você não possui créditos de Tutor AI. Compre mais na loja!",
        variant: "destructive"
      });
      setShowStore(true);
      return;
    }

    // Consumir crédito e obter dica
    getTutorHint({ caseData });
  };

  // Mostrar dica quando recebida
  React.useEffect(() => {
    if (tutorHintData?.hint) {
      onGetHint(tutorHintData.hint);
    }
  }, [tutorHintData, onGetHint]);

  if (!helpAids) {
    return <div>Carregando sistema de ajudas...</div>;
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sistema de Ajudas</span>
            <Button
              onClick={() => setShowStore(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Loja
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Eliminação */}
            <div className="text-center">
              <div className="mb-2">
                <Badge variant="secondary" className="mb-2">
                  <Zap className="h-3 w-3 mr-1" />
                  {helpAids.elimination_aids} disponíveis
                </Badge>
              </div>
              <Button
                onClick={handleElimination}
                disabled={isConsumingHelp || eliminatedOptions.length >= maxEliminations || helpAids.elimination_aids <= 0}
                className="w-full"
                variant={helpAids.elimination_aids <= 0 ? "destructive" : "default"}
              >
                <Zap className="h-4 w-4 mr-2" />
                Eliminar Alternativa
              </Button>
              <p className="text-xs text-gray-500 mt-1">
                Remove uma alternativa incorreta
              </p>
            </div>

            {/* Pular */}
            <div className="text-center">
              <div className="mb-2">
                <Badge variant="secondary" className="mb-2">
                  <SkipForward className="h-3 w-3 mr-1" />
                  {helpAids.skip_aids} disponíveis
                </Badge>
              </div>
              <Button
                onClick={handleSkip}
                disabled={isConsumingHelp || !canSkip || helpAids.skip_aids <= 0}
                className="w-full"
                variant={helpAids.skip_aids <= 0 ? "destructive" : "default"}
              >
                <SkipForward className="h-4 w-4 mr-2" />
                Pular Questão
              </Button>
              <p className="text-xs text-gray-500 mt-1">
                Avança para o próximo caso
              </p>
            </div>

            {/* Tutor AI */}
            <div className="text-center">
              <div className="mb-2">
                <Badge variant="secondary" className="mb-2">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  {helpAids.ai_tutor_credits} créditos
                </Badge>
              </div>
              <Button
                onClick={handleAIHint}
                disabled={isGettingHint || helpAids.ai_tutor_credits <= 0}
                className="w-full"
                variant={helpAids.ai_tutor_credits <= 0 ? "destructive" : "default"}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                {isGettingHint ? 'Gerando...' : 'Dica AI'}
              </Button>
              <p className="text-xs text-gray-500 mt-1">
                Receba uma dica personalizada
              </p>
            </div>
          </div>

          {helpAids.elimination_aids <= 0 && helpAids.skip_aids <= 0 && helpAids.ai_tutor_credits <= 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <p className="text-sm text-yellow-800 mb-2">
                Você não possui mais ajudas disponíveis!
              </p>
              <Button
                onClick={() => setShowStore(true)}
                size="sm"
                className="flex items-center gap-2 mx-auto"
              >
                <Coins className="h-4 w-4" />
                Comprar Ajudas
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <RadCoinStoreModal 
        isOpen={showStore} 
        onClose={() => setShowStore(false)} 
      />
    </>
  );
}
