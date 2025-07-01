
import { useState, useEffect } from 'react';

interface LevelUpData {
  show: boolean;
  newLevel: number;
  newTitle: string;
  radcoinReward: number;
}

export function useLevelUpModal(profileId?: string) {
  const [levelUpModal, setLevelUpModal] = useState<LevelUpData>({
    show: false,
    newLevel: 0,
    newTitle: '',
    radcoinReward: 0
  });

  useEffect(() => {
    if (!profileId) return;

    const checkForLevelUpNotification = () => {
      const levelUpData = localStorage.getItem(`levelup_${profileId}`);
      if (levelUpData) {
        const data = JSON.parse(levelUpData);
        setLevelUpModal({
          show: true,
          newLevel: data.new_level,
          newTitle: data.title_unlocked,
          radcoinReward: data.radcoin_reward
        });
        localStorage.removeItem(`levelup_${profileId}`);
      }
    };

    checkForLevelUpNotification();
    
    const interval = setInterval(checkForLevelUpNotification, 3000);
    return () => clearInterval(interval);
  }, [profileId]);

  const closeLevelUpModal = () => {
    setLevelUpModal(prev => ({ ...prev, show: false }));
  };

  return {
    levelUpModal,
    closeLevelUpModal
  };
}
