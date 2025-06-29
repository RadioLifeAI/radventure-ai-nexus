
import { useCasesData } from "./useCasesData";

export function useSpecialtiesData(specialties: any[]) {
  const { userProgress, isLoading: progressLoading } = useCasesData();

  // Combinar dados de especialidades com progresso do usuário
  const specialtiesWithProgress = specialties.map(specialty => ({
    ...specialty,
    userProgress: userProgress?.bySpecialty?.[specialty.name] ? {
      total: userProgress.bySpecialty[specialty.name].total,
      correct: userProgress.bySpecialty[specialty.name].correct,
      accuracy: Math.round((userProgress.bySpecialty[specialty.name].correct / userProgress.bySpecialty[specialty.name].total) * 100)
    } : undefined
  }));

  return {
    specialtiesWithProgress,
    isLoading: progressLoading
  };
}
