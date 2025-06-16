
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Download, Search } from "lucide-react";

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: "all" | "USER" | "ADMIN";
  setFilterType: (type: "all" | "USER" | "ADMIN") => void;
  onCreateUser?: () => void;
}

export function UserFilters({ 
  searchTerm, 
  setSearchTerm, 
  filterType, 
  setFilterType, 
  onCreateUser 
}: UserFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, email ou username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterType} onValueChange={(value: "all" | "USER" | "ADMIN") => setFilterType(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="USER">Usuários</SelectItem>
            <SelectItem value="ADMIN">Administradores</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        {onCreateUser && (
          <Button onClick={onCreateUser} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Button>
        )}
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>
    </div>
  );
}
