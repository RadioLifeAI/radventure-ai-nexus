
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Coins, Sparkles, Trophy } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  newTitle: string;
  radcoinReward: number;
}

export function LevelUpModal({ 
  isOpen, 
  onClose, 
  newLevel, 
  newTitle, 
  radcoinReward 
}: LevelUpModalProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowAnimation(true);
      // Auto-close após 5 segundos
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 border-none">
        {/* Efeitos de Fundo */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="w-full h-full bg-white/10 rounded-full" style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 4px, transparent 4px)',
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="relative z-10 p-8 text-center text-white">
          {/* Ícone Principal com Animação */}
          <div className={`mx-auto w-20 h-20 mb-6 relative ${showAnimation ? 'animate-bounce' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full w-full h-full flex items-center justify-center">
              <Crown className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Título Principal */}
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            LEVEL UP!
          </h2>
          
          {/* Novo Nível */}
          <div className="mb-4">
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg px-4 py-2">
              <Crown className="h-5 w-5 mr-2" />
              Nível {newLevel}
            </Badge>
          </div>

          {/* Novo Título */}
          <div className="mb-6">
            <p className="text-white/80 text-sm mb-2">Título Desbloqueado:</p>
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold text-base px-4 py-2">
              <Trophy className="h-4 w-4 mr-2" />
              {newTitle}
            </Badge>
          </div>

          {/* Recompensa RadCoin */}
          {radcoinReward > 0 && (
            <div className="mb-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <Coins className="h-5 w-5" />
                <span className="font-bold text-lg">+{radcoinReward} RadCoins</span>
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="text-white/70 text-sm mt-1">Recompensa de Level Up!</p>
            </div>
          )}

          {/* Mensagem de Parabéns */}
          <p className="text-white/90 mb-6 leading-relaxed">
            🎉 Parabéns! Você demonstrou excelência em radiologia e alcançou um novo patamar de conhecimento!
          </p>

          {/* Botão de Fechar */}
          <Button 
            onClick={onClose}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-6 py-2 rounded-full"
          >
            Continuar Estudando
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
