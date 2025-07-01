
import { useState, useEffect } from 'react';

export function useOnboardingFlow(profile: any, isLoading: boolean) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (profile && !isLoading) {
      const isNewProfile = !profile.full_name || (!profile.city && !profile.state);
      const hasSeenOnboarding = localStorage.getItem(`onboarding_${profile.id}`);
      
      if (isNewProfile && !hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [profile, isLoading]);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    if (profile) {
      localStorage.setItem(`onboarding_${profile.id}`, 'completed');
    }
  };

  return {
    showOnboarding,
    handleOnboardingClose
  };
}
