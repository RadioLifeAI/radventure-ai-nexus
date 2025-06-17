
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, RotateCcw, Target } from "lucide-react";
import { useFormDataSource } from "@/hooks/useFormDataSource";

interface UnifiedCaseFiltersProps {
  filters: {
    specialty: string;
    modality: string;
    subtype: string;
    difficulty: string;
    searchTerm: string;
  };
  onFiltersChange: (filters: any) => void;
  stats?: {
    total: number;
    bySpecialty: Record<string, number>;
  };
}

export function UnifiedCaseFilters({ filters, onFiltersChange, stats }: UnifiedCaseFiltersProps) {
  const { specialties, modalities, difficulties, isLoading } = useFormDataSource();

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value
    };

    // Se mudou modalidade, limpar subtipo
    if (key === 'modality') {
      newFilters.subtype = '';
    }

    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    onFiltersChange({
      specialty: "",
      modality: "",
      subtype: "",
      difficulty: "",
      searchTerm: ""
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => value && value !== 'all').length;

  // Filtrar especialidades válidas
  const validSpecialties = specialties.filter(specialty => 
    specialty.name && 
    specialty.name.trim() !== '' && 
    typeof specialty.name === 'string'
  );

  // Filtrar modalidades válidas
  const validModalities = modalities.filter(modality => 
    modality.value && 
    modality.value.trim() !== '' && 
    typeof modality.value === 'string'
  );

  // Filtrar dificuldades válidas
  const validDifficulties = difficulties.filter(difficulty => 
    difficulty.level && 
    difficulty.description && 
    difficulty.description.trim() !== ''
  );

  // Obter subtipos para modalidade selecionada
  const selectedModalityData = validModalities.find(m => m.value === filters.modality);
  const availableSubtypes = selectedModalityData?.subtypes || [];

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Casos (Dados Unificados)
          </CardTitle>
          <div className="flex items-center gap-2">
            {stats && (
              <Badge variant="secondary" className="bg-white/20 text-white">
                {stats.total} casos
              </Badge>
            )}
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Busca por termo */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar casos por título ou descrição..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-300"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Especialidade - MESMA FONTE DO FORMULÁRIO */}
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Especialidade
            </label>
            <Select value={filters.specialty} onValueChange={(value) => handleFilterChange('specialty', value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Todas as especialidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as especialidades</SelectItem>
                {validSpecialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.name}>
                    {specialty.name}
                    {stats?.bySpecialty[specialty.name] && (
                      <Badge variant="secondary" className="ml-2">
                        {stats.bySpecialty[specialty.name]}
                      </Badge>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Modalidade - MESMA FONTE DO FORMULÁRIO */}
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Modalidade
            </label>
            <Select value={filters.modality} onValueChange={(value) => handleFilterChange('modality', value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Todas as modalidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as modalidades</SelectItem>
                {validModalities.map((modality) => (
                  <SelectItem key={modality.value} value={modality.value}>
                    {modality.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subtipo - BASEADO NA MODALIDADE SELECIONADA */}
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Subtipo
            </label>
            <Select 
              value={filters.subtype} 
              onValueChange={(value) => handleFilterChange('subtype', value)}
              disabled={!filters.modality || filters.modality === 'all'}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Todos os subtipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os subtipos</SelectItem>
                {availableSubtypes.map((subtype) => (
                  <SelectItem key={subtype.value} value={subtype.value}>
                    {subtype.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dificuldade - MESMA FONTE DO FORMULÁRIO */}
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Dificuldade
            </label>
            <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange('difficulty', value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Todas as dificuldades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as dificuldades</SelectItem>
                {validDifficulties.map((difficulty) => (
                  <SelectItem key={difficulty.id} value={difficulty.level.toString()}>
                    Nível {difficulty.level} - {difficulty.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtros ativos */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-white/20">
            <Target className="h-4 w-4 text-cyan-300" />
            <span className="text-sm text-cyan-300 font-medium">
              {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
            </span>
            <div className="flex flex-wrap gap-2">
              {filters.specialty && filters.specialty !== 'all' && (
                <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300">
                  {filters.specialty}
                </Badge>
              )}
              {filters.modality && filters.modality !== 'all' && (
                <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300">
                  {filters.modality}
                </Badge>
              )}
              {filters.subtype && filters.subtype !== 'all' && (
                <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300">
                  {filters.subtype}
                </Badge>
              )}
              {filters.difficulty && filters.difficulty !== 'all' && (
                <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300">
                  {validDifficulties.find(d => d.level.toString() === filters.difficulty)?.description}
                </Badge>
              )}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center text-white/70 py-4">
            Carregando filtros...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
