import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutGrid,
  Calendar,
  Clock,
  BarChart3,
  SortAsc,
  SortDesc,
  Download,
  MoreHorizontal,
  Eye,
  Users,
  Trophy
} from "lucide-react";

export type EventViewMode = "cards" | "timeline" | "calendar" | "analytics";

export type EventSortField = "name" | "scheduled_start" | "prize_radcoins" | "max_participants" | "created_at";

interface Props {
  viewMode: EventViewMode;
  onViewModeChange: (mode: EventViewMode) => void;
  sortField: EventSortField;
  sortDirection: "asc" | "desc";
  onSort: (field: EventSortField, direction: "asc" | "desc") => void;
  selectedCount: number;
  totalCount: number;
  onBulkAction: (action: string) => void;
  onExport: (format: string) => void;
}

export function EventsViewSelector({
  viewMode,
  onViewModeChange,
  sortField,
  sortDirection,
  onSort,
  selectedCount,
  totalCount,
  onBulkAction,
  onExport
}: Props) {
  const viewOptions = [
    {
      mode: "cards" as EventViewMode,
      icon: LayoutGrid,
      label: "Cards",
      description: "Visualização em cartões"
    },
    {
      mode: "timeline" as EventViewMode,
      icon: Clock,
      label: "Timeline",
      description: "Linha do tempo cronológica"
    },
    {
      mode: "calendar" as EventViewMode,
      icon: Calendar,
      label: "Calendário",
      description: "Vista de calendário"
    },
    {
      mode: "analytics" as EventViewMode,
      icon: BarChart3,
      label: "Analytics",
      description: "Dashboard analítico"
    }
  ];

  const sortOptions = [
    { value: "name", label: "Nome", icon: Eye },
    { value: "scheduled_start", label: "Data de Início", icon: Clock },
    { value: "prize_radcoins", label: "Prêmio (RadCoins)", icon: Trophy },
    { value: "max_participants", label: "Participantes", icon: Users },
    { value: "created_at", label: "Data de Criação", icon: Calendar }
  ];

  const handleSort = (field: EventSortField) => {
    const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    onSort(field, newDirection);
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Seletor de Visualização */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Visualização:</span>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {viewOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.mode}
                    variant={viewMode === option.mode ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onViewModeChange(option.mode)}
                    className={`rounded-none border-0 ${
                      viewMode === option.mode 
                        ? "bg-blue-600 text-white" 
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                    title={option.description}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">{option.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Controles de Ordenação */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Ordenar:</span>
            <Select
              value={sortField}
              onValueChange={(value) => handleSort(value as EventSortField)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSort(sortField, sortDirection === "asc" ? "desc" : "asc")}
              className="px-2"
            >
              {sortDirection === "asc" ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Ações e Estatísticas */}
          <div className="flex items-center gap-4">
            {/* Contador de Seleção */}
            {selectedCount > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedCount} selecionados
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Ações em Lote
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onBulkAction("duplicate")}>
                      Duplicar Selecionados
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onBulkAction("archive")}>
                      Arquivar Selecionados
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onBulkAction("delete")}
                      className="text-red-600"
                    >
                      Excluir Selecionados
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Menu de Exportação */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onExport("csv")}>
                  Exportar CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport("excel")}>
                  Exportar Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport("pdf")}>
                  Relatório PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Estatísticas Rápidas */}
            <div className="text-sm text-gray-600">
              <span className="font-medium">{totalCount}</span> eventos
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
