
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter, RotateCcw } from "lucide-react";

interface NotificationFiltersProps {
  onFiltersChange: (filters: any) => void;
  currentFilters: any;
}

const notificationTypes = [
  { value: 'achievement_unlocked', label: 'Conquista Desbloqueada' },
  { value: 'streak_milestone', label: 'Marco de Streak' },
  { value: 'radcoin_reward', label: 'Recompensa RadCoin' },
  { value: 'event_starting', label: 'Evento Iniciando' },
  { value: 'system_maintenance', label: 'Manutenção' },
  { value: 'feature_announcement', label: 'Novo Recurso' },
  { value: 'study_reminder', label: 'Lembrete de Estudo' },
  { value: 'learning_tip', label: 'Dica de Aprendizado' }
];

export function NotificationFilters({ onFiltersChange, currentFilters }: NotificationFiltersProps) {
  const [filters, setFilters] = React.useState(currentFilters || {});

  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    const activeFilters = Object.entries(filters)
      .filter(([_, value]) => value !== '' && value !== undefined)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
    onFiltersChange(activeFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros
        </CardTitle>
        <Button variant="outline" size="sm" onClick={clearFilters}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Limpar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select 
              value={filters.type || ''} 
              onValueChange={(value) => handleFilterChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                {notificationTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Prioridade</Label>
            <Select 
              value={filters.priority || ''} 
              onValueChange={(value) => handleFilterChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data Inicial</Label>
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Data Final</Label>
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={applyFilters} className="flex-1">
            Aplicar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
