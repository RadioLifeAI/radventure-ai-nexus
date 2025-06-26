
import { useRealMedicalCases } from "./useRealMedicalCases";
import { useUserProfile } from "./useUserProfile";

export interface CasesStats {
  totalCases: number;
  bySpecialty: Record<string, number>;
  byDifficulty: Record<number, number>;
  byModality: Record<string, number>;
  cases?: any[]; // Add cases array for compatibility
}

export interface UserProgress {
  totalPoints: number;
  casesCompleted: number;
  currentStreak: number;
  averageScore: number;
  totalAnswered: number; // Add missing property
  accuracy: number; // Add missing property
  bySpecialty: Record<string, { correct: number; total: number }>; // Add missing property
}

export function useCasesData() {
  const { cases, isLoading: casesLoading, casesStats } = useRealMedicalCases();
  const { profile, isLoading: profileLoading } = useUserProfile();

  const userProgress: UserProgress = {
    totalPoints: profile?.total_points || 0,
    casesCompleted: 0, // This would come from user_case_history
    currentStreak: profile?.current_streak || 0,
    averageScore: 0, // This would be calculated from user_case_history
    totalAnswered: 0, // Add default value
    accuracy: 0, // Add default value
    bySpecialty: {} // Add default value
  };

  // Enhanced casesStats with cases array
  const enhancedCasesStats = casesStats ? {
    ...casesStats,
    cases: cases || [] // Add cases array
  } : null;

  return {
    cases,
    casesStats: enhancedCasesStats,
    userProgress,
    isLoading: casesLoading || profileLoading
  };
}
