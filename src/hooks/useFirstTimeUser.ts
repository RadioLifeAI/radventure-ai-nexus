
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useFirstTimeUser() {
  const { user, profile } = useAuth();
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (user && profile) {
      // Verificar se é primeira vez baseado em quando a conta foi criada
      const accountAge = Date.now() - new Date(user.created_at).getTime();
      const isNewUser = accountAge < 5 * 60 * 1000; // 5 minutos
      
      // Verificar se já viu o tutorial (pode ser armazenado no localStorage)
      const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${user.id}`);
      
      const shouldShowWelcome = isNewUser && !hasSeenTutorial;
      
      setIsFirstTime(shouldShowWelcome);
      setShowWelcome(shouldShowWelcome);
    }
  }, [user, profile]);

  const markTutorialAsSeen = () => {
    if (user) {
      localStorage.setItem(`tutorial_seen_${user.id}`, 'true');
      setShowWelcome(false);
      setIsFirstTime(false);
    }
  };

  return {
    isFirstTime,
    showWelcome,
    markTutorialAsSeen
  };
}
