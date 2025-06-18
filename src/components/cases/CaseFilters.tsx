
import React from "react";
import { UnifiedCaseFilters } from "./UnifiedCaseFilters";

interface CaseFiltersProps {
  filters: {
    specialty: string;
    modality: string;
    difficulty: string;
    searchTerm: string;
  };
  onFiltersChange: (filters: any) => void;
  stats: {
    total: number;
    bySpecialty: Record<string, number>;
  };
}

export function CaseFilters({ filters, onFiltersChange, stats }: CaseFiltersProps) {
  // Converter filtros antigos para o novo formato unificado
  const unifiedFilters = {
    ...filters,
    subtype: '', // Adicionar subtipo vazio se não existir
  };

  return (
    <UnifiedCaseFilters 
      filters={unifiedFilters}
      onFiltersChange={onFiltersChange}
      stats={stats}
    />
  );
}
