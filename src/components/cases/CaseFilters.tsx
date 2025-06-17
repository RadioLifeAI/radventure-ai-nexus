
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, TrendingUp } from "lucide-react";

type Filters = {
  specialty: string;
  modality: string;
  difficulty: string;
  searchTerm: string;
};

type Props = {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  stats?: {
    total: number;
    bySpecialty: Record<string, number>;
  };
};

const specialties = [
  "Neurologia", "Cardiologia", "Pneumologia", "Gastroenterologia", 
  "Radiologia", "Medicina de Emergência", "Pediatria", "Dermatologia"
];

const modalities = [
  "Raio-X", "Tomografia", "Ressonância", "Ultrassom", "Mamografia"
];

export function CaseFilters({ filters, onFiltersChange, stats }: Props) {
  const updateFilter = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ specialty: "", modality: "", difficulty: "", searchTerm: "" });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-cyan-200/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-cyan-400" size={20} />
          <h2 className="text-lg font-semibold text-white">Filtros de Busca</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Buscar casos..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter("searchTerm", e.target.value)}
              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-gray-300"
            />
          </div>
          
          <Select value={filters.specialty} onValueChange={(value) => updateFilter("specialty", value)}>
            <SelectTrigger className="bg-white/20 border-white/30 text-white">
              <SelectValue placeholder="Especialidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as especialidades</SelectItem>
              {specialties.map(specialty => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                  {stats?.bySpecialty[specialty] && (
                    <span className="ml-1 text-xs text-gray-500">
                      ({stats.bySpecialty[specialty]})
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filters.modality} onValueChange={(value) => updateFilter("modality", value)}>
            <SelectTrigger className="bg-white/20 border-white/30 text-white">
              <SelectValue placeholder="Modalidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as modalidades</SelectItem>
              {modalities.map(modality => (
                <SelectItem key={modality} value={modality}>{modality}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filters.difficulty} onValueChange={(value) => updateFilter("difficulty", value)}>
            <SelectTrigger className="bg-white/20 border-white/30 text-white">
              <SelectValue placeholder="Dificuldade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as dificuldades</SelectItem>
              <SelectItem value="1">Iniciante</SelectItem>
              <SelectItem value="2">Fácil</SelectItem>
              <SelectItem value="3">Médio</SelectItem>
              <SelectItem value="4">Difícil</SelectItem>
              <SelectItem value="5">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">Filtros ativos:</span>
            {filters.specialty && <Badge variant="secondary">{filters.specialty}</Badge>}
            {filters.modality && <Badge variant="secondary">{filters.modality}</Badge>}
            {filters.difficulty && <Badge variant="secondary">Nível {filters.difficulty}</Badge>}
            {filters.searchTerm && <Badge variant="secondary">"{filters.searchTerm}"</Badge>}
            <button 
              onClick={clearFilters}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline ml-2"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
