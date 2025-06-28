
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Zap, SkipForward, X, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useUserHelpAids } from "@/hooks/useUserHelpAids";

type Props = {
  maxElimination: number;
  canSkip: boolean;
  skipPenalty: number;
  eliminationPenalty: number;
  aiHintEnabled: boolean;
  onEliminateOption: (correctAnswerIndex: number) => void;
  onSkip: () => void;
  onAIHint: () => void;
  eliminatedOptions: number[];
  correctAnswerIndex: number;
};

export function HelpSystem({
  maxElimination,
  canSkip,
  skipPenalty,
  eliminationPenalty,
  aiHintEnabled,
  onEliminateOption,
  onSkip,
  onAIHint,
  eliminatedOptions,
  correctAnswerIndex
}: Props) {
  const { toast } = useToast();
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const { helpAids, consumeHelp } = useUserHelpAids();

  const handleElimination = () => {
    if (eliminatedOptions.length >= maxElimination) {
      toast({
        title: "Limite atingido",
        description: `Você pode eliminar no máximo ${maxElimination} alternativa(s) neste caso.`,
        variant: "destructive"
      });
      return;
    }

    if (!helpAids || helpAids.elimination_aids <= 0) {
      toast({
        title: "Sem créditos",
        description: "Você não possui créditos de eliminação. Compre mais ou ganhe em eventos!",
        variant: "destructive"
      });
      return;
    }

    setShowConfirm("elimination");
  };

  const handleSkip = () => {
    if (!canSkip) {
      toast({
        title: "Não permitido",
        description: "Este caso não permite pular.",
        variant: "destructive"
      });
      return;
    }

    if (!helpAids || helpAids.skip_aids <= 0) {
      toast({
        title: "Sem créditos",
        description: "Você não possui créditos para pular. Compre mais ou ganhe em eventos!",
        variant: "destructive"
      });
      return;
    }

    setShowConfirm("skip");
  };

  const handleAIHint = () => {
    if (!aiHintEnabled) {
      toast({
        title: "Não disponível",
        description: "Este caso não possui dicas de IA.",
        variant: "destructive"
      });
      return;
    }

    if (!helpAids || helpAids.ai_tutor_credits <= 0) {
      toast({
        title: "Sem créditos",
        description: "Você não possui créditos de IA. Compre mais ou ganhe em eventos!",
        variant: "destructive"
      });
      return;
    }

    setShowConfirm("aiHint");
  };

  const confirmAction = () => {
    switch (showConfirm) {
      case "elimination":
        // CORREÇÃO CRÍTICA: Passar o índice correto para não eliminar a resposta correta
        onEliminateOption(correctAnswerIndex);
        consumeHelp({ aidType: 'elimination' });
        break;
      case "skip":
        onSkip();
        consumeHelp({ aidType: 'skip' });
        break;
      case "aiHint":
        onAIHint();
        consumeHelp({ aidType: 'ai_tutor' });
        break;
    }
    setShowConfirm(null);
  };

  if (showConfirm) {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="text-center">
            <h3 className="font-semibold text-yellow-800 mb-2">Confirmar Ação</h3>
            <p className="text-yellow-700 mb-4">
              {showConfirm === "elimination" && 
                `Eliminar uma alternativa incorreta custará ${eliminationPenalty} pontos. Deseja continuar?`}
              {showConfirm === "skip" && 
                `Pular este caso custará ${skipPenalty} pontos. Deseja continuar?`}
              {showConfirm === "aiHint" && 
                "Usar dica de IA custará 1 crédito. Deseja continuar?"}
            </p>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={confirmAction}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Confirmar
              </Button>
              <Button 
                onClick={() => setShowConfirm(null)}
                size="sm"
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="text-yellow-600" size={20} />
          <h3 className="font-semibold text-yellow-800">Ajudas Disponíveis</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={handleElimination}
            disabled={eliminatedOptions.length >= maxElimination || !helpAids || helpAids.elimination_aids <= 0}
            variant="outline"
            size="sm"
            className="flex flex-col items-center gap-1 h-16 border-red-200 hover:bg-red-50"
          >
            <X className="text-red-600" size={16} />
            <span className="text-xs">Eliminar</span>
            <Badge variant="secondary" className="text-xs">
              {helpAids?.elimination_aids || 0}
            </Badge>
          </Button>
          
          <Button
            onClick={handleSkip}
            disabled={!canSkip || !helpAids || helpAids.skip_aids <= 0}
            variant="outline"
            size="sm"
            className="flex flex-col items-center gap-1 h-16 border-blue-200 hover:bg-blue-50"
          >
            <SkipForward className="text-blue-600" size={16} />
            <span className="text-xs">Pular</span>
            <Badge variant="secondary" className="text-xs">
              {helpAids?.skip_aids || 0}
            </Badge>
          </Button>
          
          <Button
            onClick={handleAIHint}
            disabled={!aiHintEnabled || !helpAids || helpAids.ai_tutor_credits <= 0}
            variant="outline"
            size="sm"
            className="flex flex-col items-center gap-1 h-16 border-purple-200 hover:bg-purple-50"
          >
            <Sparkles className="text-purple-600" size={16} />
            <span className="text-xs">Dica IA</span>
            <Badge variant="secondary" className="text-xs">
              {helpAids?.ai_tutor_credits || 0}
            </Badge>
          </Button>
        </div>
        
        <div className="text-xs text-yellow-700 mt-2">
          <p>• Eliminação: -{eliminationPenalty} pontos (remove alternativa incorreta)</p>
          <p>• Pular: -{skipPenalty} pontos</p>
          <p>• Dica IA: 1 crédito</p>
        </div>
      </CardContent>
    </Card>
  );
}
