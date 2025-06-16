
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

const WELCOME_REWARD_KEY = 'welcome_reward_claimed';

export function useWelcomeRewards(user: User | null) {
  const [rewardClaimed, setRewardClaimed] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const claimed = localStorage.getItem(`${WELCOME_REWARD_KEY}_${user.id}`);
      setRewardClaimed(!!claimed);
    }
  }, [user?.id]);

  const claimWelcomeReward = () => {
    if (user?.id && !rewardClaimed) {
      localStorage.setItem(`${WELCOME_REWARD_KEY}_${user.id}`, 'true');
      setRewardClaimed(true);
      console.log('Welcome reward claimed for user:', user.id);
    }
  };

  return {
    rewardClaimed,
    claimWelcomeReward
  };
}
