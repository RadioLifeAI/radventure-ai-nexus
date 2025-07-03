import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  MoreHorizontal,
  Edit,
  Eye,
  Copy,
  Trash2,
  BarChart3,
  Play,
  Target
} from "lucide-react";
import { EventRichViewModal } from "./EventRichViewModal";
import { EventSmartDuplicateModal } from "./EventSmartDuplicateModal";
import { EventAdvancedAnalyticsModal } from "./EventAdvancedAnalyticsModal";

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
  const [richViewModal, setRichViewModal] = useState<{ open: boolean; event: any }>({ open: false, event: null });
  const [duplicateModal, setDuplicateModal] = useState<{ open: boolean; event: any }>({ open: false, event: null });
  const [analyticsModal, setAnalyticsModal] = useState<{ open: boolean; event: any }>({ open: false, event: null });

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

  const handleRichView = (event: any) => {
    setRichViewModal({ open: true, event });
  };

  const handleSmartDuplicate = (event: any) => {
    setDuplicateModal({ open: true, event });
  };

  const handleAdvancedAnalytics = (event: any) => {
    setAnalyticsModal({ open: true, event });
  };

  const handleDuplicateComplete = (duplicatedEvent: any) => {
    // Notificar para atualizar a lista
    onDuplicate(duplicatedEvent.id);
    setDuplicateModal({ open: false, event: null });
    
    // Mostrar toast de sucesso já está no modal
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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const statusColors = getStatusColor(event.status);
          const isSelected = selectedEvents.includes(event.id);
          const isActive = event.status === "ACTIVE";
          const canStart = event.status === "SCHEDULED" && new Date(event.scheduled_start) <= new Date();

          return (
            <Card 
              key={event.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                isSelected ? "ring-2 ring-blue-500 shadow-blue-100" : ""
              } ${isActive ? "ring-2 ring-green-400 shadow-green-100" : ""}`}
            >
              {/* Checkbox de seleção */}
              <div className="absolute top-4 left-4 z-10">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onEventSelect(event.id)}
                  className="bg-white border-2 border-gray-300"
                />
              </div>

              {/* Menu de ações */}
              <div className="absolute top-4 right-4 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="bg-white shadow-sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white">
                    <DropdownMenuItem onClick={() => handleRichView(event)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Visualização Rica
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(event.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSmartDuplicate(event)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicação Inteligente
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAdvancedAnalytics(event)}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics Avançado
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {canStart && (
                      <DropdownMenuItem onClick={() => onToggleStatus(event.id)}>
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar Evento
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => onDelete(event.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Banner do evento */}
              {event.banner_url && (
                <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg relative overflow-hidden">
                  <img
                    src={event.banner_url}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                  {isActive && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-red-500 text-white animate-pulse">
                        AO VIVO
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              <CardContent className="p-6">
                {/* Título e status */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {event.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors}>
                      {getStatusLabel(event.status)}
                    </Badge>
                    {canStart && (
                      <Badge className="bg-orange-100 text-orange-700">
                        Pronto para Iniciar
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Descrição */}
                {event.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                )}

                {/* Métricas principais */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <div className="text-xs text-blue-600 font-medium">Início</div>
                    <div className="text-sm font-semibold text-blue-800">
                      {formatDate(event.scheduled_start)}
                    </div>
                  </div>

                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Users className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <div className="text-xs text-green-600 font-medium">Participantes</div>
                    <div className="text-sm font-semibold text-green-800">
                      {event.max_participants || "Ilimitado"}
                    </div>
                  </div>

                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                    <div className="text-xs text-yellow-600 font-medium">Prêmio</div>
                    <div className="text-sm font-semibold text-yellow-800">
                      {event.prize_radcoins} RC
                    </div>
                  </div>

                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Target className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                    <div className="text-xs text-purple-600 font-medium">Casos</div>
                    <div className="text-sm font-semibold text-purple-800">
                      {event.number_of_cases}
                    </div>
                  </div>
                </div>

                {/* Ações principais */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRichView(event)}
                    className="flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onEdit(event.id)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modais */}
      <EventRichViewModal
        open={richViewModal.open}
        onClose={() => setRichViewModal({ open: false, event: null })}
        event={richViewModal.event}
        onEdit={onEdit}
        onDuplicate={handleSmartDuplicate}
        onAnalytics={handleAdvancedAnalytics}
      />

      <EventSmartDuplicateModal
        open={duplicateModal.open}
        onClose={() => setDuplicateModal({ open: false, event: null })}
        event={duplicateModal.event}
        onDuplicate={handleDuplicateComplete}
      />

      <EventAdvancedAnalyticsModal
        open={analyticsModal.open}
        onClose={() => setAnalyticsModal({ open: false, event: null })}
        event={analyticsModal.event}
      />
    </>
  );
}
