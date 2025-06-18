
import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface CaseFiltersProps {
  filters: {
    specialty: string;
    modality: string;
    difficulty: string;
    searchTerm: string;
  };
  onFiltersChange: (filters: any) => void;
}

export const CaseFilters = React.memo(function CaseFilters({ filters, onFiltersChange }: CaseFiltersProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(filters.searchTerm);
  
  // Debounce search term para evitar muitas requests
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);
  
  React.useEffect(() => {
    if (debouncedSearchTerm !== filters.searchTerm) {
      onFiltersChange({ ...filters, searchTerm: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm, filters, onFiltersChange]);

  const specialties = useMemo(() => [
    "Radiologia Geral",
    "Neurorradiologia",
    "Radiologia Torácica",
    "Radiologia Abdominal",
    "Radiologia Músculoesquelética",
    "Medicina de Emergência",
    "Cardiologia",
    "Neurologia",
    "Ortopedia"
  ], []);

  const modalities = useMemo(() => [
    "Radiografia",
    "Tomografia Computadorizada",
    "Ressonância Magnética",
    "Ultrassonografia",
    "Mamografia",
    "Exame Clínico"
  ], []);

  const handleFilterChange = React.useCallback((key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  }, [filters, onFiltersChange]);

  const clearFilters = React.useCallback(() => {
    setLocalSearchTerm("");
    onFiltersChange({
      specialty: "",
      modality: "",
      difficulty: "",
      searchTerm: ""
    });
  }, [onFiltersChange]);

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value => value && value !== "").length;
  }, [filters]);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-cyan-300" />
          <h3 className="text-lg font-semibold text-white">Filtros</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-cyan-500 text-white">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-cyan-300 hover:text-white hover:bg-white/20"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar casos..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="pl-10 bg-white/80 border-white/30"
          />
        </div>

        {/* Specialty */}
        <Select value={filters.specialty} onValueChange={(value) => handleFilterChange("specialty", value)}>
          <SelectTrigger className="bg-white/80 border-white/30">
            <SelectValue placeholder="Especialidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as especialidades</SelectItem>
            {specialties.map((specialty) => (
              <SelectItem key={specialty} value={specialty}>
                {specialty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Modality */}
        <Select value={filters.modality} onValueChange={(value) => handleFilterChange("modality", value)}>
          <SelectTrigger className="bg-white/80 border-white/30">
            <SelectValue placeholder="Modalidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as modalidades</SelectItem>
            {modalities.map((modality) => (
              <SelectItem key={modality} value={modality}>
                {modality}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Difficulty */}
        <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange("difficulty", value)}>
          <SelectTrigger className="bg-white/80 border-white/30">
            <SelectValue placeholder="Dificuldade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as dificuldades</SelectItem>
            <SelectItem value="1">Nível 1 - Iniciante</SelectItem>
            <Select value="2">Nível 2 - Intermediário</SelectItem>
            <SelectItem value="3">Nível 3 - Avançado</SelectItem>
            <SelectItem value="4">Nível 4 - Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});
