
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, RotateCcw, Brain, Sparkles } from "lucide-react";
import { useFormDataSource } from "@/hooks/useFormDataSource";

interface AdvancedJourneyFiltersProps {
  filters: {
    specialty: string;
    modality: string;
    subtype: string;
    difficulty: string;
    searchTerm: string;
    patientAge: string;
    patientGender: string;
    symptomsDuration: string;
  };
  onFiltersChange: (filters: any) => void;
  onAutoFillWithAI: () => void;
  isLoadingAI?: boolean;
  casesFound?: number;
}

export function AdvancedJourneyFilters({ 
  filters, 
  onFiltersChange, 
  onAutoFillWithAI,
  isLoadingAI = false,
  casesFound = 0
}: AdvancedJourneyFiltersProps) {
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
      searchTerm: "",
      patientAge: "",
      patientGender: "",
      symptomsDuration: ""
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => value && value !== 'all').length;

  // Filtrar dados válidos
  const validSpecialties = specialties.filter(specialty => 
    specialty.name && specialty.name.trim() !== ''
  );

  const validModalities = modalities.filter(modality => 
    modality.value && modality.value.trim() !== ''
  );

  const validDifficulties = difficulties.filter(difficulty => 
    difficulty.level && difficulty.description
  );

  // Obter subtipos para modalidade selecionada
  const selectedModalityData = validModalities.find(m => m.value === filters.modality);
  const availableSubtypes = selectedModalityData?.subtypes || [];

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-purple-800 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avançados de Jornada
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={onAutoFillWithAI}
              disabled={isLoadingAI}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {isLoadingAI ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-spin" />
                  Analisando com IA...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Auto-completar com IA
                </>
              )}
            </Button>
            {casesFound > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {casesFound} casos encontrados
              </Badge>
            )}
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Busca por termo */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar casos por título, descrição ou diagnóstico..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="pl-10 border-purple-200 focus:border-purple-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Especialidade - MESMA FONTE DO FORMULÁRIO */}
          <div>
            <label className="text-sm font-medium text-purple-800 mb-2 block">
              Especialidade
            </label>
            <Select value={filters.specialty} onValueChange={(value) => handleFilterChange('specialty', value)}>
              <SelectTrigger className="border-purple-200 focus:border-purple-400">
                <SelectValue placeholder="Todas as especialidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as especialidades</SelectItem>
                {validSpecialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.name}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Modalidade - MESMA FONTE DO FORMULÁRIO */}
          <div>
            <label className="text-sm font-medium text-purple-800 mb-2 block">
              Modalidade
            </label>
            <Select value={filters.modality} onValueChange={(value) => handleFilterChange('modality', value)}>
              <SelectTrigger className="border-purple-200 focus:border-purple-400">
                <SelectValue placeholder="Todas as modalidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as modalidades</SelectItem>
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
            <label className="text-sm font-medium text-purple-800 mb-2 block">
              Subtipo
            </label>
            <Select 
              value={filters.subtype} 
              onValueChange={(value) => handleFilterChange('subtype', value)}
              disabled={!filters.modality}
            >
              <SelectTrigger className="border-purple-200 focus:border-purple-400">
                <SelectValue placeholder="Todos os subtipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os subtipos</SelectItem>
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
            <label className="text-sm font-medium text-purple-800 mb-2 block">
              Dificuldade
            </label>
            <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange('difficulty', value)}>
              <SelectTrigger className="border-purple-200 focus:border-purple-400">
                <SelectValue placeholder="Todas as dificuldades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as dificuldades</SelectItem>
                {validDifficulties.map((difficulty) => (
                  <SelectItem key={difficulty.id} value={difficulty.level.toString()}>
                    Nível {difficulty.level} - {difficulty.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtros adicionais de paciente */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-purple-800 mb-2 block">
              Idade do Paciente
            </label>
            <Select value={filters.patientAge} onValueChange={(value) => handleFilterChange('patientAge', value)}>
              <SelectTrigger className="border-purple-200 focus:border-purple-400">
                <SelectValue placeholder="Todas as idades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as idades</SelectItem>
                <SelectItem value="Neonato">Neonato</SelectItem>
                <SelectItem value="Lactente">Lactente</SelectItem>
                <SelectItem value="Pré-escolar">Pré-escolar</SelectItem>
                <SelectItem value="Escolar">Escolar</SelectItem>
                <SelectItem value="Adolescente">Adolescente</SelectItem>
                <SelectItem value="Adulto jovem">Adulto jovem</SelectItem>
                <SelectItem value="Adulto">Adulto</SelectItem>
                <SelectItem value="Idoso">Idoso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-purple-800 mb-2 block">
              Gênero do Paciente
            </label>
            <Select value={filters.patientGender} onValueChange={(value) => handleFilterChange('patientGender', value)}>
              <SelectTrigger className="border-purple-200 focus:border-purple-400">
                <SelectValue placeholder="Todos os gêneros" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os gêneros</SelectItem>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Feminino">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-purple-800 mb-2 block">
              Duração dos Sintomas
            </label>
            <Select value={filters.symptomsDuration} onValueChange={(value) => handleFilterChange('symptomsDuration', value)}>
              <SelectTrigger className="border-purple-200 focus:border-purple-400">
                <SelectValue placeholder="Qualquer duração" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Qualquer duração</SelectItem>
                <SelectItem value="Agudo">Agudo (< 1 semana)</SelectItem>
                <SelectItem value="Subagudo">Subagudo (1-4 semanas)</SelectItem>
                <SelectItem value="Crônico">Crônico (> 1 mês)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtros ativos */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-purple-200">
            <span className="text-sm text-purple-700 font-medium">
              {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}:
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (!value || value === 'all') return null;
                return (
                  <Badge key={key} variant="secondary" className="bg-purple-100 text-purple-800">
                    {key === 'difficulty' 
                      ? `Nível ${value}` 
                      : value.length > 20 
                        ? `${value.substring(0, 20)}...` 
                        : value
                    }
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center text-purple-700 py-4">
            Carregando opções de filtro...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
