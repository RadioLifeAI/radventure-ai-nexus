
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Filter,
  Search,
  Calendar,
  Users,
  Trophy,
  Star,
  Save,
  Trash2,
  X
} from "lucide-react";

interface EventFilters {
  search: string;
  status: string[];
  event_type: string[];
  creator: string;
  date_range: {
    start?: string;
    end?: string;
  };
  participants: {
    min?: number;
    max?: number;
  };
  prize_range: {
    min?: number;
    max?: number;
  };
}

interface SavedFilter {
  id: string;
  name: string;
  filters: EventFilters;
  is_favorite?: boolean;
}

interface Props {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  savedFilters: SavedFilter[];
  onSaveFilter: (name: string, filters: EventFilters) => void;
  onLoadFilter: (filter: SavedFilter) => void;
  onDeleteFilter: (filterId: string) => void;
  totalEvents: number;
  filteredEvents: number;
}

export function EventsAdvancedFilters({
  filters,
  onFiltersChange,
  savedFilters,
  onSaveFilter,
  onLoadFilter,
  onDeleteFilter,
  totalEvents,
  filteredEvents
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState("");

  const statusOptions = [
    { value: "DRAFT", label: "Rascunho", color: "bg-gray-100 text-gray-700" },
    { value: "SCHEDULED", label: "Agendado", color: "bg-blue-100 text-blue-700" },
    { value: "ACTIVE", label: "Ativo", color: "bg-green-100 text-green-700" },
    { value: "FINISHED", label: "Finalizado", color: "bg-purple-100 text-purple-700" },
    { value: "CANCELLED", label: "Cancelado", color: "bg-red-100 text-red-700" }
  ];

  const eventTypeOptions = [
    { value: "quiz_timed", label: "Quiz Cronometrado" },
    { value: "quiz_free", label: "Quiz Livre" },
    { value: "tournament", label: "Torneio" },
    { value: "challenge", label: "Desafio" },
    { value: "workshop", label: "Workshop" }
  ];

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleArrayFilterToggle = (key: string, value: string) => {
    const currentArray = filters[key as keyof EventFilters] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    handleFilterChange(key, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      status: [],
      event_type: [],
      creator: "",
      date_range: {},
      participants: {},
      prize_range: {}
    });
  };

  const hasActiveFilters = () => {
    return filters.search || 
           filters.status.length > 0 || 
           filters.event_type.length > 0 ||
           filters.creator ||
           Object.keys(filters.date_range).length > 0 ||
           Object.keys(filters.participants).length > 0 ||
           Object.keys(filters.prize_range).length > 0;
  };

  const handleSaveFilter = () => {
    if (saveFilterName.trim()) {
      onSaveFilter(saveFilterName.trim(), filters);
      setSaveFilterName("");
    }
  };

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <Filter className="h-5 w-5" />
            Filtros Avançados de Eventos
            {hasActiveFilters() && (
              <Badge variant="secondary" className="ml-2">
                {filteredEvents} de {totalEvents}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Minimizar" : "Expandir"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Busca Principal */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar eventos por título, descrição..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros Rápidos - Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Status dos Eventos</label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <Badge
                key={status.value}
                variant={filters.status.includes(status.value) ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  filters.status.includes(status.value) ? status.color : "hover:bg-gray-100"
                }`}
                onClick={() => handleArrayFilterToggle("status", status.value)}
              >
                {status.label}
              </Badge>
            ))}
          </div>
        </div>

        {isExpanded && (
          <>
            <Separator />
            
            {/* Tipo de Evento */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tipo de Evento</label>
              <div className="flex flex-wrap gap-2">
                {eventTypeOptions.map((type) => (
                  <Badge
                    key={type.value}
                    variant={filters.event_type.includes(type.value) ? "default" : "outline"}
                    className="cursor-pointer transition-all hover:bg-gray-100"
                    onClick={() => handleArrayFilterToggle("event_type", type.value)}
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Filtros de Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Data Início</label>
                <Input
                  type="datetime-local"
                  value={filters.date_range.start || ""}
                  onChange={(e) => handleFilterChange("date_range", {
                    ...filters.date_range,
                    start: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Data Fim</label>
                <Input
                  type="datetime-local"
                  value={filters.date_range.end || ""}
                  onChange={(e) => handleFilterChange("date_range", {
                    ...filters.date_range,
                    end: e.target.value
                  })}
                />
              </div>
            </div>

            {/* Filtros de Participantes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  <Users className="h-4 w-4 inline mr-1" />
                  Min. Participantes
                </label>
                <Input
                  type="number"
                  placeholder="Mínimo"
                  value={filters.participants.min || ""}
                  onChange={(e) => handleFilterChange("participants", {
                    ...filters.participants,
                    min: e.target.value ? Number(e.target.value) : undefined
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Max. Participantes</label>
                <Input
                  type="number"
                  placeholder="Máximo"
                  value={filters.participants.max || ""}
                  onChange={(e) => handleFilterChange("participants", {
                    ...filters.participants,
                    max: e.target.value ? Number(e.target.value) : undefined
                  })}
                />
              </div>
            </div>

            {/* Filtros de Prêmio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  <Trophy className="h-4 w-4 inline mr-1" />
                  Min. RadCoins
                </label>
                <Input
                  type="number"
                  placeholder="Mínimo"
                  value={filters.prize_range.min || ""}
                  onChange={(e) => handleFilterChange("prize_range", {
                    ...filters.prize_range,
                    min: e.target.value ? Number(e.target.value) : undefined
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Max. RadCoins</label>
                <Input
                  type="number"
                  placeholder="Máximo"
                  value={filters.prize_range.max || ""}
                  onChange={(e) => handleFilterChange("prize_range", {
                    ...filters.prize_range,
                    max: e.target.value ? Number(e.target.value) : undefined
                  })}
                />
              </div>
            </div>
          </>
        )}

        {/* Filtros Salvos */}
        {savedFilters.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Filtros Salvos</label>
              <div className="flex flex-wrap gap-2">
                {savedFilters.map((savedFilter) => (
                  <div key={savedFilter.id} className="flex items-center gap-1">
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-blue-50 flex items-center gap-1"
                      onClick={() => onLoadFilter(savedFilter)}
                    >
                      {savedFilter.is_favorite && (
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      )}
                      {savedFilter.name}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      onClick={() => onDeleteFilter(savedFilter.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Salvar Filtro Atual */}
        {hasActiveFilters() && (
          <>
            <Separator />
            <div className="flex items-center gap-2">
              <Input
                placeholder="Nome do filtro..."
                value={saveFilterName}
                onChange={(e) => setSaveFilterName(e.target.value)}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={handleSaveFilter}
                disabled={!saveFilterName.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-1" />
                Salvar
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
