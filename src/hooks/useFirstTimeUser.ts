
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useFirstTimeUser() {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const tutorialKey = `tutorial_completed_${user.id}`;
    const hasSeenTutorial = localStorage.getItem(tutorialKey);
    
    // Só mostrar se nunca viu o tutorial
    if (!hasSeenTutorial) {
      setShowWelcome(true);
    }
  }, [user?.id]);

  const markTutorialAsSeen = () => {
    if (user?.id) {
      const tutorialKey = `tutorial_completed_${user.id}`;
      localStorage.setItem(tutorialKey, 'true');
      setShowWelcome(false);
    }
  };

  return {
    showWelcome,
    markTutorialAsSeen
  };
}
