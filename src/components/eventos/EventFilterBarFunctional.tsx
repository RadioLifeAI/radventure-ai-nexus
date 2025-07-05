
import React from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Filter,
  Search,
  X,
  Calendar as CalendarIcon,
  Trophy,
  Zap,
  Clock
} from "lucide-react";
import { EventFilters } from "@/hooks/useEventFilters";

interface Props {
  filters: EventFilters;
  onUpdateFilter: (key: keyof EventFilters, value: any) => void;
  onUpdateArrayFilter: (key: keyof EventFilters, value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  totalEvents: number;
  filteredEvents: number;
}

export function EventFilterBarFunctional({
  filters,
  onUpdateFilter,
  onUpdateArrayFilter,
  onClearFilters,
  hasActiveFilters,
  totalEvents,
  filteredEvents
}: Props) {
  const statusOptions = [
    { value: "SCHEDULED", label: "Agendado", icon: Clock, color: "bg-blue-500 text-white" },
    { value: "ACTIVE", label: "Ativo", icon: Zap, color: "bg-green-500 text-white" },
    { value: "FINISHED", label: "Finalizado", icon: Trophy, color: "bg-gray-500 text-white" }
  ];

  const eventTypeOptions = [
    { value: "quiz_timed", label: "Quiz Cronometrado" },
    { value: "quiz_free", label: "Quiz Livre" },
    { value: "tournament", label: "Torneio" },
    { value: "challenge", label: "Desafio" }
  ];

  return (
    <div className="w-full space-y-4 mb-6">
      {/* Barra de busca principal */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar eventos por nome ou descrição..."
          value={filters.search}
          onChange={(e) => onUpdateFilter("search", e.target.value)}
          className="pl-10 bg-white/90 border-cyan-200 focus:border-cyan-400"
        />
      </div>

      {/* Filtros rápidos */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Filter className="h-4 w-4" />
          Filtros:
        </div>

        {/* Status */}
        <div className="flex gap-2">
          {statusOptions.map(option => {
            const isSelected = filters.status.includes(option.value);
            return (
              <Badge
                key={option.value}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  isSelected ? option.color : "hover:bg-gray-100"
                }`}
                onClick={() => onUpdateArrayFilter("status", option.value)}
              >
                <option.icon className="h-3 w-3 mr-1" />
                {option.label}
              </Badge>
            );
          })}
        </div>

        {/* Tipo de Evento */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              Tipo {filters.eventType.length > 0 && `(${filters.eventType.length})`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="space-y-2">
              {eventTypeOptions.map(option => (
                <Badge
                  key={option.value}
                  variant={filters.eventType.includes(option.value) ? "default" : "outline"}
                  className="cursor-pointer w-full justify-start"
                  onClick={() => onUpdateArrayFilter("eventType", option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Faixa de Prêmio */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Trophy className="h-3 w-3 mr-1" />
              Prêmio
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">RadCoins Mínimo</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.prizeRange.min || ""}
                  onChange={(e) => onUpdateFilter("prizeRange", {
                    ...filters.prizeRange,
                    min: e.target.value ? Number(e.target.value) : undefined
                  })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">RadCoins Máximo</label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={filters.prizeRange.max || ""}
                  onChange={(e) => onUpdateFilter("prizeRange", {
                    ...filters.prizeRange,
                    max: e.target.value ? Number(e.target.value) : undefined
                  })}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Data */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <CalendarIcon className="h-3 w-3 mr-1" />
              Data
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Data Início</label>
                <Input
                  type="datetime-local"
                  value={filters.dateRange.start || ""}
                  onChange={(e) => onUpdateFilter("dateRange", {
                    ...filters.dateRange,
                    start: e.target.value
                  })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Data Fim</label>
                <Input
                  type="datetime-local"
                  value={filters.dateRange.end || ""}
                  onChange={(e) => onUpdateFilter("dateRange", {
                    ...filters.dateRange,
                    end: e.target.value
                  })}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Limpar filtros */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Contador de resultados */}
      {hasActiveFilters && (
        <div className="text-sm text-cyan-600 bg-cyan-50 px-3 py-2 rounded-lg">
          Mostrando {filteredEvents} de {totalEvents} eventos
        </div>
      )}
    </div>
  );
}
