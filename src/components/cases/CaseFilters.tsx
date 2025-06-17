
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, RotateCcw, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  // Buscar especialidades dinamicamente do BD
  const { data: specialties } = useQuery({
    queryKey: ['specialties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_specialties')
        .select('name')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Buscar modalidades dinamicamente do BD
  const { data: modalities } = useQuery({
    queryKey: ['modalities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('imaging_modalities')
        .select('name')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      specialty: "",
      modality: "",
      difficulty: "",
      searchTerm: ""
    });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  // Filter out empty or invalid specialty names
  const validSpecialties = specialties?.filter(specialty => 
    specialty.name && 
    specialty.name.trim() !== '' && 
    typeof specialty.name === 'string'
  ) || [];

  // Filter out empty or invalid modality names
  const validModalities = modalities?.filter(modality => 
    modality.name && 
    modality.name.trim() !== '' && 
    typeof modality.name === 'string'
  ) || [];

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Casos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white">
              {stats.total} casos
            </Badge>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Especialidade */}
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
                  <SelectItem key={specialty.name} value={specialty.name}>
                    {specialty.name}
                    {stats.bySpecialty[specialty.name] && (
                      <Badge variant="secondary" className="ml-2">
                        {stats.bySpecialty[specialty.name]}
                      </Badge>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Modalidade */}
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
                  <SelectItem key={modality.name} value={modality.name}>
                    {modality.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dificuldade */}
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
                <SelectItem value="1">Nível 1 - Básico</SelectItem>
                <SelectItem value="2">Nível 2 - Intermediário</SelectItem>
                <SelectItem value="3">Nível 3 - Avançado</SelectItem>
                <SelectItem value="4">Nível 4 - Expert</SelectItem>
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
              {filters.difficulty && filters.difficulty !== 'all' && (
                <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300">
                  Nível {filters.difficulty}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
