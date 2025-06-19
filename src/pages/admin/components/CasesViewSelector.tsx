
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutGrid, 
  List, 
  Table, 
  SortAsc, 
  SortDesc,
  Download,
  Eye,
  MoreVertical,
  Grid3X3
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export type ViewMode = "cards" | "grid" | "table";
export type SortField = "title" | "created_at" | "specialty" | "difficulty_level" | "points";
export type SortDirection = "asc" | "desc";

type Props = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField, direction: SortDirection) => void;
  selectedCount: number;
  totalCount: number;
  onBulkAction: (action: string) => void;
  onExport: () => void;
  gridDensity: number;
  onGridDensityChange: (density: number) => void;
};

export function CasesViewSelector({
  viewMode,
  onViewModeChange,
  sortField,
  sortDirection,
  onSort,
  selectedCount,
  totalCount,
  onBulkAction,
  onExport,
  gridDensity,
  onGridDensityChange
}: Props) {
  const viewOptions = [
    { value: "cards" as ViewMode, icon: LayoutGrid, label: "Cards" },
    { value: "grid" as ViewMode, icon: Grid3X3, label: "Grid" },
    { value: "table" as ViewMode, icon: List, label: "Tabela" }
  ];

  const sortOptions = [
    { value: "title" as SortField, label: "Título" },
    { value: "created_at" as SortField, label: "Data de criação" },
    { value: "specialty" as SortField, label: "Especialidade" },
    { value: "difficulty_level" as SortField, label: "Dificuldade" },
    { value: "points" as SortField, label: "Pontos" }
  ];

  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border p-4">
      {/* Left side - View modes */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {viewOptions.map(option => {
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                variant={viewMode === option.value ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange(option.value)}
                className="h-8 px-3"
              >
                <Icon className="h-4 w-4 mr-1" />
                {option.label}
              </Button>
            );
          })}
        </div>

        {/* Grid density for grid view */}
        {viewMode === "grid" && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Densidade:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(density => (
                <Button
                  key={density}
                  variant={gridDensity === density ? "default" : "outline"}
                  size="sm"
                  onClick={() => onGridDensityChange(density)}
                  className="h-6 w-6 p-0 text-xs"
                >
                  {density}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Selection info */}
        {selectedCount > 0 && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {selectedCount} selecionados
          </Badge>
        )}
      </div>

      {/* Right side - Sort and actions */}
      <div className="flex items-center gap-2">
        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              {sortDirection === "asc" ? (
                <SortAsc className="h-4 w-4 mr-1" />
              ) : (
                <SortDesc className="h-4 w-4 mr-1" />
              )}
              Ordenar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {sortOptions.map(option => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => {
                  const newDirection = sortField === option.value && sortDirection === "asc" ? "desc" : "asc";
                  onSort(option.value, newDirection);
                }}
                className="flex items-center justify-between"
              >
                {option.label}
                {sortField === option.value && (
                  sortDirection === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Export button */}
        <Button variant="outline" size="sm" onClick={onExport} className="h-8">
          <Download className="h-4 w-4 mr-1" />
          Exportar
        </Button>

        {/* Bulk actions */}
        {selectedCount > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <MoreVertical className="h-4 w-4 mr-1" />
                Ações
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onBulkAction("publish")}>
                Publicar selecionados
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkAction("unpublish")}>
                Despublicar selecionados
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkAction("archive")}>
                Arquivar selecionados
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onBulkAction("duplicate")}>
                Duplicar selecionados
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkAction("export")}>
                Exportar selecionados
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onBulkAction("delete")}
                className="text-red-600"
              >
                Excluir selecionados
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <div className="text-sm text-gray-500">
          {totalCount} casos
        </div>
      </div>
    </div>
  );
}
