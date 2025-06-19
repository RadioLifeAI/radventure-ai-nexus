
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
  Filter, 
  Search, 
  Calendar as CalendarIcon, 
  X, 
  Bookmark,
  Clock,
  Star,
  Image,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type FilterState = {
  searchTerm: string;
  specialties: string[];
  modalities: string[];
  difficulties: string[];
  pointsRange: [number, number];
  dateRange: { from?: Date; to?: Date };
  status: string[];
  source: string[];
};

type Props = {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onSaveFilter: (name: string, filters: FilterState) => void;
  savedFilters: Array<{ name: string; filters: FilterState }>;
  onLoadFilter: (filters: FilterState) => void;
  totalCases: number;
  filteredCases: number;
};

export function CasesAdvancedFilters({ 
  filters, 
  onFiltersChange, 
  onSaveFilter, 
  savedFilters, 
  onLoadFilter,
  totalCases,
  filteredCases 
}: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState("");

  const quickFilters = [
    { 
      label: "Meus casos de hoje", 
      icon: Clock, 
      filters: { ...filters, dateRange: { from: new Date() } } 
    },
    { 
      label: "Casos sem imagem", 
      icon: Image, 
      filters: { ...filters, status: ["no_image"] } 
    },
    { 
      label: "Casos populares", 
      icon: TrendingUp, 
      filters: { ...filters, status: ["popular"] } 
    },
    { 
      label: "Alta dificuldade", 
      icon: Star, 
      filters: { ...filters, difficulties: ["4", "5"] } 
    }
  ];

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: "",
      specialties: [],
      modalities: [],
      difficulties: [],
      pointsRange: [0, 100],
      dateRange: {},
      status: [],
      source: []
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.specialties.length) count++;
    if (filters.modalities.length) count++;
    if (filters.difficulties.length) count++;
    if (filters.pointsRange[0] > 0 || filters.pointsRange[1] < 100) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.status.length) count++;
    if (filters.source.length) count++;
    return count;
  };

  return (
    <div className="space-y-4 bg-white rounded-lg shadow-sm border p-6">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-lg">Filtros Avançados</h3>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {getActiveFiltersCount()} filtros ativos
            </Badge>
          )}
        </div>
        <div className="text-sm text-gray-600">
          {filteredCases} de {totalCases} casos
        </div>
      </div>

      {/* Busca principal */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar em títulos, descrições, achados..."
          value={filters.searchTerm}
          onChange={(e) => updateFilter("searchTerm", e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((quick, index) => {
          const Icon = quick.icon;
          return (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onLoadFilter(quick.filters)}
              className="h-8 px-3 text-xs"
            >
              <Icon className="h-3 w-3 mr-1" />
              {quick.label}
            </Button>
          );
        })}
      </div>

      {/* Filtros salvos */}
      {savedFilters.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Filtros Salvos:</p>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map((saved, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => onLoadFilter(saved.filters)}
                className="h-7 px-2 text-xs bg-purple-50 hover:bg-purple-100"
              >
                <Bookmark className="h-3 w-3 mr-1" />
                {saved.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Toggle para filtros avançados */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-blue-600 hover:text-blue-700"
      >
        {showAdvanced ? "Ocultar" : "Mostrar"} filtros avançados
      </Button>

      {/* Filtros avançados */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t">
          {/* Especialidades */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Especialidades</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {["Radiologia Torácica", "Neurorradiologia", "Radiologia Abdominal", "Musculoesquelética"].map(specialty => (
                <label key={specialty} className="flex items-center space-x-2 text-sm">
                  <Checkbox
                    checked={filters.specialties.includes(specialty)}
                    onCheckedChange={() => toggleArrayFilter("specialties", specialty)}
                  />
                  <span>{specialty}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Modalidades */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Modalidades</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {["Radiografia (RX)", "Tomografia Computadorizada (TC)", "Ressonância Magnética (RM)", "Ultrassom (US)"].map(modality => (
                <label key={modality} className="flex items-center space-x-2 text-sm">
                  <Checkbox
                    checked={filters.modalities.includes(modality)}
                    onCheckedChange={() => toggleArrayFilter("modalities", modality)}
                  />
                  <span>{modality}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dificuldades */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Dificuldades</label>
            <div className="space-y-2">
              {[
                { value: "1", label: "Muito Fácil" },
                { value: "2", label: "Fácil" },
                { value: "3", label: "Moderado" },
                { value: "4", label: "Difícil" },
                { value: "5", label: "Muito Difícil" }
              ].map(diff => (
                <label key={diff.value} className="flex items-center space-x-2 text-sm">
                  <Checkbox
                    checked={filters.difficulties.includes(diff.value)}
                    onCheckedChange={() => toggleArrayFilter("difficulties", diff.value)}
                  />
                  <span>{diff.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Range de Pontos */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Pontos: {filters.pointsRange[0]} - {filters.pointsRange[1]}
            </label>
            <Slider
              value={filters.pointsRange}
              onValueChange={(value) => updateFilter("pointsRange", value)}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="space-y-2">
              {[
                { value: "published", label: "Publicado" },
                { value: "draft", label: "Rascunho" },
                { value: "archived", label: "Arquivado" }
              ].map(status => (
                <label key={status.value} className="flex items-center space-x-2 text-sm">
                  <Checkbox
                    checked={filters.status.includes(status.value)}
                    onCheckedChange={() => toggleArrayFilter("status", status.value)}
                  />
                  <span>{status.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fonte */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Fonte</label>
            <div className="space-y-2">
              {[
                { value: "radiopaedia", label: "Radiopaedia" },
                { value: "own", label: "Próprio" },
                { value: "imported", label: "Importado" }
              ].map(source => (
                <label key={source.value} className="flex items-center space-x-2 text-sm">
                  <Checkbox
                    checked={filters.source.includes(source.value)}
                    onCheckedChange={() => toggleArrayFilter("source", source.value)}
                  />
                  <span>{source.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Nome do filtro..."
            value={saveFilterName}
            onChange={(e) => setSaveFilterName(e.target.value)}
            className="w-40 h-8 text-xs"
          />
          <Button
            size="sm"
            onClick={() => {
              if (saveFilterName.trim()) {
                onSaveFilter(saveFilterName, filters);
                setSaveFilterName("");
              }
            }}
            disabled={!saveFilterName.trim()}
            className="h-8"
          >
            <Bookmark className="h-3 w-3 mr-1" />
            Salvar
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFilters}
          className="h-8"
        >
          <X className="h-3 w-3 mr-1" />
          Limpar tudo
        </Button>
      </div>
    </div>
  );
}
