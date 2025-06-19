
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Clock,
  Users,
  Trophy,
  Edit,
  Eye,
  Copy,
  MoreHorizontal,
  Trash2,
  BarChart3,
  Wand2,
  Play,
  Pause,
  Target
} from "lucide-react";

interface Event {
  id: string;
  name: string;
  description?: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string;
  prize_radcoins: number;
  max_participants?: number;
  number_of_cases?: number;
  banner_url?: string;
  event_type?: string;
  auto_start?: boolean;
  prize_distribution?: any[];
}

interface Props {
  events: Event[];
  selectedEvents: string[];
  onEventSelect: (eventId: string) => void;
  onEdit: (eventId: string) => void;
  onView: (eventId: string) => void;
  onDuplicate: (eventId: string) => void;
  onDelete: (eventId: string) => void;
  onAnalytics?: (eventId: string) => void;
  onToggleStatus?: (eventId: string) => void;
}

export function EventsCardsView({
  events,
  selectedEvents,
  onEventSelect,
  onEdit,
  onView,
  onDuplicate,
  onDelete,
  onAnalytics,
  onToggleStatus
}: Props) {
  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: "bg-gray-100 text-gray-700",
      SCHEDULED: "bg-blue-100 text-blue-700",
      ACTIVE: "bg-green-100 text-green-700",
      FINISHED: "bg-purple-100 text-purple-700",
      CANCELLED: "bg-red-100 text-red-700"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      DRAFT: "Rascunho",
      SCHEDULED: "Agendado",
      ACTIVE: "Ativo",
      FINISHED: "Finalizado",
      CANCELLED: "Cancelado"
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getEventTypeLabel = (type?: string) => {
    const labels = {
      quiz_timed: "Quiz Cronometrado",
      quiz_free: "Quiz Livre",
      tournament: "Torneio",
      challenge: "Desafio",
      workshop: "Workshop"
    };
    return labels[type as keyof typeof labels] || "Quiz";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalPrizeDistribution = (prizeDistribution?: any[]) => {
    if (!prizeDistribution || !Array.isArray(prizeDistribution)) return 0;
    return prizeDistribution.reduce((total, prize) => total + (prize.prize || 0), 0);
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">Nenhum evento encontrado</div>
        <div className="text-gray-500 text-sm">Ajuste os filtros ou crie um novo evento</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <Card key={event.id} className="hover:shadow-lg transition-all duration-200 border-2 hover:border-orange-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedEvents.includes(event.id)}
                  onCheckedChange={() => onEventSelect(event.id)}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg line-clamp-2 text-gray-800">
                    {event.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {getEventTypeLabel(event.event_type)}
                  </p>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(event.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(event.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(event.id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {onAnalytics && (
                    <DropdownMenuItem onClick={() => onAnalytics(event.id)}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </DropdownMenuItem>
                  )}
                  {onToggleStatus && event.status === "SCHEDULED" && (
                    <DropdownMenuItem onClick={() => onToggleStatus(event.id)}>
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Evento
                    </DropdownMenuItem>
                  )}
                  {onToggleStatus && event.status === "ACTIVE" && (
                    <DropdownMenuItem onClick={() => onToggleStatus(event.id)}>
                      <Pause className="h-4 w-4 mr-2" />
                      Pausar Evento
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(event.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Banner do Evento */}
            {event.banner_url && (
              <div className="w-full h-32 rounded-lg overflow-hidden">
                <img
                  src={event.banner_url}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Status e Tipo */}
            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(event.status)}>
                {getStatusLabel(event.status)}
              </Badge>
              {event.auto_start && (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Auto-start
                </Badge>
              )}
            </div>

            {/* Descrição */}
            {event.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {event.description}
              </p>
            )}

            {/* Informações do Evento */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Início: {formatDate(event.scheduled_start)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Fim: {formatDate(event.scheduled_end)}</span>
              </div>
              {event.max_participants && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>Máx. {event.max_participants} participantes</span>
                </div>
              )}
              {event.number_of_cases && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Target className="h-4 w-4" />
                  <span>{event.number_of_cases} casos</span>
                </div>
              )}
            </div>

            {/* Prêmios */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">
                    {event.prize_radcoins} RadCoins
                  </span>
                </div>
                {event.prize_distribution && Array.isArray(event.prize_distribution) && (
                  <span className="text-xs text-yellow-600">
                    Top 3: {event.prize_distribution.slice(0, 3).map(p => p.prize).join(', ')}
                  </span>
                )}
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onView(event.id)}
                className="flex-1"
              >
                <Eye className="h-3 w-3 mr-1" />
                Ver
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onEdit(event.id)}
                className="flex-1"
              >
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
              {onAnalytics && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onAnalytics(event.id)}
                  className="px-2"
                >
                  <BarChart3 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
