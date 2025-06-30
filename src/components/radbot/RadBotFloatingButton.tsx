
import React from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/hooks/useUserProfile';

interface RadBotFloatingButtonProps {
  onClick: () => void;
  hasNewMessage?: boolean;
}

export function RadBotFloatingButton({ onClick, hasNewMessage = false }: RadBotFloatingButtonProps) {
  const { profile } = useUserProfile();
  const hasCredits = (profile?.radcoin_balance || 0) >= 5;

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Button
        onClick={onClick}
        className={`
          relative h-14 w-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110
          ${hasCredits 
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
            : 'bg-gray-400 hover:bg-gray-500'
          }
        `}
        disabled={!hasCredits}
      >
        <div className="relative">
          <MessageCircle className="h-6 w-6" />
          
          {/* Indicador de créditos */}
          <div className="absolute -top-1 -right-1">
            <Sparkles className="h-3 w-3 text-yellow-300 animate-pulse" />
          </div>
          
          {/* Badge de notificação */}
          {hasNewMessage && (
            <div className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 rounded-full animate-bounce" />
          )}
          
          {/* Efeito de pulso quando tem créditos */}
          {hasCredits && (
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
          )}
        </div>
      </Button>
      
      {/* Tooltip com saldo */}
      <div className="absolute bottom-16 right-0 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
        {hasCredits ? (
          <>RadBot AI • {profile?.radcoin_balance || 0} RadCoins</>
        ) : (
          <>Sem créditos • Precisa de 5 RadCoins</>
        )}
      </div>
    </div>
  );
}
