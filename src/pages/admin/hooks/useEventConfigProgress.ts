
import { useMemo } from "react";

export function useEventConfigProgress({
  name, scheduledStart, scheduledEnd, numberOfCases, durationMinutes, caseFilters
}: any) {
  // Calcula um "percentual de completude" baseado na configuração do evento
  return useMemo(() => {
    let filled = 0;
    if (name) filled += 20;
    if (scheduledStart && scheduledEnd) filled += 20;
    if (numberOfCases) filled += 20;
    if (durationMinutes) filled += 15;
    if (caseFilters && Object.keys(caseFilters).length > 0) filled += 20;
    if (caseFilters && (caseFilters.category?.length || caseFilters.modality?.length)) filled += 5;
    return Math.min(100, filled);
  }, [name, scheduledStart, scheduledEnd, numberOfCases, durationMinutes, caseFilters]);
}
