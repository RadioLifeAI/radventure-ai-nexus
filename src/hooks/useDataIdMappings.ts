
import { useUnifiedFormDataSource } from "./useUnifiedFormDataSource";

export interface DataIdMappings {
  // Converte nome para ID
  specialtyNameToId: (name: string) => number | null;
  modalityNameToId: (name: string) => number | null;  
  subtypeNameToId: (subtypeName: string, modalityName?: string) => number | null;
  difficultyLevelToId: (level: number) => number | null;
  
  // Converte ID para nome
  specialtyIdToName: (id: number) => string | null;
  modalityIdToName: (id: number) => string | null;
  subtypeIdToName: (id: number) => string | null;
  difficultyIdToLevel: (id: number) => number | null;
  
  // Validações
  isValidModalitySubtypePair: (modalityId: number, subtypeId: number) => boolean;
  getSubtypesForModality: (modalityId: number) => Array<{ id: number; name: string; }>;
  
  isLoading: boolean;
}

export function useDataIdMappings(): DataIdMappings {
  const { specialties, modalities, difficulties, isLoading } = useUnifiedFormDataSource();

  const specialtyNameToId = (name: string): number | null => {
    const specialty = specialties.find(s => s.name.toLowerCase() === name.toLowerCase());
    return specialty?.id || null;
  };

  const modalityNameToId = (name: string): number | null => {
    const modality = modalities.find(m => m.name.toLowerCase() === name.toLowerCase());
    return modality?.id || null;
  };

  const subtypeNameToId = (subtypeName: string, modalityName?: string): number | null => {
    if (modalityName) {
      const modality = modalities.find(m => m.name.toLowerCase() === modalityName.toLowerCase());
      const subtype = modality?.subtypes.find(s => s.name.toLowerCase() === subtypeName.toLowerCase());
      return subtype?.id || null;
    } else {
      // Buscar em todas as modalidades
      for (const modality of modalities) {
        const subtype = modality.subtypes.find(s => s.name.toLowerCase() === subtypeName.toLowerCase());
        if (subtype) return subtype.id;
      }
      return null;
    }
  };

  const difficultyLevelToId = (level: number): number | null => {
    const difficulty = difficulties.find(d => d.level === level);
    return difficulty?.id || null;
  };

  const specialtyIdToName = (id: number): string | null => {
    const specialty = specialties.find(s => s.id === id);
    return specialty?.name || null;
  };

  const modalityIdToName = (id: number): string | null => {
    const modality = modalities.find(m => m.id === id);
    return modality?.name || null;
  };

  const subtypeIdToName = (id: number): string | null => {
    for (const modality of modalities) {
      const subtype = modality.subtypes.find(s => s.id === id);
      if (subtype) return subtype.name;
    }
    return null;
  };

  const difficultyIdToLevel = (id: number): number | null => {
    const difficulty = difficulties.find(d => d.id === id);
    return difficulty?.level || null;
  };

  const isValidModalitySubtypePair = (modalityId: number, subtypeId: number): boolean => {
    const modality = modalities.find(m => m.id === modalityId);
    return modality?.subtypes.some(s => s.id === subtypeId) || false;
  };

  const getSubtypesForModality = (modalityId: number) => {
    const modality = modalities.find(m => m.id === modalityId);
    return modality?.subtypes || [];
  };

  return {
    specialtyNameToId,
    modalityNameToId,
    subtypeNameToId,
    difficultyLevelToId,
    specialtyIdToName,
    modalityIdToName,
    subtypeIdToName,
    difficultyIdToLevel,
    isValidModalitySubtypePair,
    getSubtypesForModality,
    isLoading
  };
}
