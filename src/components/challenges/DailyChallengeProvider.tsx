import React, { createContext, useContext, ReactNode } from 'react';
import { useDailyChallenge } from '@/hooks/useDailyChallenge';
import { DailyChallengeModal } from './DailyChallengeModal';

interface DailyChallengeContextType {
  checkDailyChallenge: (userId: string) => Promise<void>;
}

const DailyChallengeContext = createContext<DailyChallengeContextType | null>(null);

export function useDailyChallengeContext() {
  const context = useContext(DailyChallengeContext);
  if (!context) {
    throw new Error('useDailyChallengeContext must be used within DailyChallengeProvider');
  }
  return context;
}

interface Props {
  children: ReactNode;
}

export function DailyChallengeProvider({ children }: Props) {
  const dailyChallenge = useDailyChallenge();

  // Escutar evento customizado do useAuth
  React.useEffect(() => {
    const handleCheckDailyChallenge = (event: CustomEvent) => {
      const userId = event.detail?.userId;
      if (userId) {
        console.log('🎯 Evento de verificação de desafio diário recebido:', userId);
        dailyChallenge.checkDailyChallenge(userId);
      }
    };

    window.addEventListener('checkDailyChallenge', handleCheckDailyChallenge as EventListener);
    
    return () => {
      window.removeEventListener('checkDailyChallenge', handleCheckDailyChallenge as EventListener);
    };
  }, [dailyChallenge]);

  // DEBUG: Log do estado do modal
  console.log('🔄 DailyChallengeProvider render:', {
    showModal: dailyChallenge.showModal,
    challenge: dailyChallenge.challenge?.id,
    isLoading: dailyChallenge.isLoading
  });

  return (
    <DailyChallengeContext.Provider value={dailyChallenge}>
      {children}
      <DailyChallengeModal
        open={dailyChallenge.showModal}
        onClose={dailyChallenge.closeModal}
        challenge={dailyChallenge.challenge}
        isLoading={dailyChallenge.isLoading}
        hasAnswered={dailyChallenge.hasAnswered}
        result={dailyChallenge.result}
        onSubmitAnswer={dailyChallenge.submitAnswer}
        getCommunityStats={dailyChallenge.getCommunityStats}
      />
    </DailyChallengeContext.Provider>
  );
}