
import { useRealMedicalCases } from "./useRealMedicalCases";
import { useUserProfile } from "./useUserProfile";

export interface CasesStats {
  totalCases: number;
  bySpecialty: Record<string, number>;
  byDifficulty: Record<number, number>;
  byModality: Record<string, number>;
}

export interface UserProgress {
  totalPoints: number;
  casesCompleted: number;
  currentStreak: number;
  averageScore: number;
}

export function useCasesData() {
  const { cases, isLoading: casesLoading, casesStats } = useRealMedicalCases();
  const { profile, isLoading: profileLoading } = useUserProfile();

  const userProgress: UserProgress = {
    totalPoints: profile?.total_points || 0,
    casesCompleted: 0, // This would come from user_case_history
    currentStreak: profile?.current_streak || 0,
    averageScore: 0 // This would be calculated from user_case_history
  };

  return {
    cases,
    casesStats,
    userProgress,
    isLoading: casesLoading || profileLoading
  };
}
