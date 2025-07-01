
import { useMemo } from 'react';
import { UserProfile } from './useUserProfile';

export function useProfileCompletion(profile: UserProfile | null) {
  const isProfileComplete = useMemo(() => {
    if (!profile) return false;
    
    const completionFields = [
      { completed: !!(profile.full_name && profile.full_name.trim().length > 0) },
      { completed: !!(profile.city && profile.state) },
      { completed: !!(profile.medical_specialty && profile.medical_specialty.trim().length > 0) },
      { completed: !!(profile.academic_stage && profile.college) },
      { completed: !!profile.birthdate },
      { completed: !!(profile.bio && profile.bio.trim().length > 20) }
    ];
    
    const completedCount = completionFields.filter(field => field.completed).length;
    return completedCount === completionFields.length;
  }, [profile]);

  return { isProfileComplete };
}
