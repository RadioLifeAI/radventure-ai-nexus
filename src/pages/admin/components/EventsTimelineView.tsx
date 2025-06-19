
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Users,
  Trophy,
  Edit,
  Eye,
  MapPin,
  Target,
  Zap
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
}

interface Props {
  events: Event[];
  onView: (eventId: string) => void;
  onEdit: (eventId: string) => void;
}

export function EventsTimelineView({ events, onView, onEdit }: Props) {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime()
  );

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" },
      SCHEDULED: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
      ACTIVE: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
      FINISHED: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
      CANCELLED: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" }
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min`;
    }
    return `${diffMinutes}min`;
  };

  const isEventPast = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const isEventActive = (startDate: string, endDate: string) => {
    const now = new Date();
    return new Date(startDate) <= now && now <= new Date(endDate);
  };

  const isEventUpcoming = (startDate: string) => {
    return new Date(startDate) > new Date();
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
    <div className="space-y-8">
      {/* Linha do Tempo Principal */}
      <div className="relative">
        {/* Linha Vertical */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-purple-300 to-orange-300"></div>
        
        <div className="space-y-8">
          {sortedEvents.map((event, index) => {
            const statusColors = getStatusColor(event.status);
            const isPast = isEventPast(event.scheduled_end);
            const isActive = isEventActive(event.scheduled_start, event.scheduled_end);
            const isUpcoming = isEventUpcoming(event.scheduled_start);
            
            return (
              <div key={event.id} className="relative flex items-start gap-6">
                {/* Indicador na Timeline */}
                <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-4 ${statusColors.border} ${statusColors.bg}`}>
                  {isActive && <Zap className="h-4 w-4 text-green-600" />}
                  {isUpcoming && <Clock className="h-4 w-4 text-blue-600" />}
                  {isPast && <Target className="h-4 w-4 text-purple-600" />}
                  {event.status === "DRAFT" && <Edit className="h-4 w-4 text-gray-600" />}
                </div>

                {/* Card do Evento */}
                <Card className={`flex-1 transition-all duration-200 hover:shadow-lg ${
                  isActive ? "ring-2 ring-green-300 shadow-green-100" :
                  isUpcoming ? "ring-2 ring-blue-300 shadow-blue-100" :
                  "opacity-75"
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-800">
                            {event.name}
                          </h3>
                          <Badge className={`${statusColors.bg} ${statusColors.text}`}>
                            {getStatusLabel(event.status)}
                          </Badge>
                          {isActive && (
                            <Badge className="bg-green-500 text-white animate-pulse">
                              AO VIVO
                            </Badge>
                          )}
                        </div>
                        
                        {event.description && (
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>

                      {event.banner_url && (
                        <div className="ml-4">
                          <img
                            src={event.banner_url}
                            alt={event.name}
                            className="w-20 h-16 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>

                    {/* Informações do Evento */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="font-medium">Início</div>
                          <div>{formatDate(event.scheduled_start)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <div>
                          <div className="font-medium">Duração</div>
                          <div>{formatDuration(event.scheduled_start, event.scheduled_end)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4 text-green-500" />
                        <div>
                          <div className="font-medium">Participantes</div>
                          <div>{event.max_participants || "Ilimitado"}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <div>
                          <div className="font-medium">Prêmio</div>
                          <div className="font-semibold text-yellow-600">
                            {event.prize_radcoins} RadCoins
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Informações Adicionais */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {event.number_of_cases && (
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {event.number_of_cases} casos
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.event_type || "Quiz"}
                        </span>
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onView(event.id)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Visualizar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(event.id)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
