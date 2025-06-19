
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Users,
  Trophy,
  Eye,
  Edit
} from "lucide-react";

interface Event {
  id: string;
  name: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string;
  prize_radcoins: number;
  max_participants?: number;
  banner_url?: string;
}

interface Props {
  events: Event[];
  onView: (eventId: string) => void;
  onEdit: (eventId: string) => void;
}

export function EventsCalendarView({ events, onView, onEdit }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Função para obter eventos de um dia específico
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.scheduled_start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Função para gerar o calendário do mês
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    let currentCalendarDate = new Date(startDate);
    
    // Gerar 42 dias (6 semanas)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentCalendarDate));
      currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
    }
    
    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: "bg-gray-400",
      SCHEDULED: "bg-blue-500",
      ACTIVE: "bg-green-500",
      FINISHED: "bg-purple-500",
      CANCELLED: "bg-red-500"
    };
    return colors[status as keyof typeof colors] || "bg-gray-400";
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-6">
      {/* Header do Calendário */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hoje
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendário Principal */}
      <Card>
        <CardContent className="p-0">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 border-b">
            {dayNames.map((day) => (
              <div key={day} className="p-4 text-center font-medium text-gray-600 bg-gray-50">
                {day}
              </div>
            ))}
          </div>

          {/* Dias do calendário */}
          <div className="grid grid-cols-7">
            {calendarDays.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const isCurrentMonthDay = isCurrentMonth(date);
              const isTodayDate = isToday(date);

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border-b border-r border-gray-200 ${
                    !isCurrentMonthDay ? "bg-gray-50 text-gray-400" : "bg-white"
                  } ${isTodayDate ? "bg-blue-50 border-blue-300" : ""}`}
                >
                  {/* Número do dia */}
                  <div className={`text-sm font-medium mb-1 ${
                    isTodayDate ? "text-blue-600" : ""
                  }`}>
                    {date.getDate()}
                  </div>

                  {/* Eventos do dia */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(event.status)} text-white`}
                        onClick={() => onView(event.id)}
                        title={event.name}
                      >
                        <div className="truncate font-medium">
                          {event.name}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 opacity-90">
                          <Clock className="h-2 w-2" />
                          <span>
                            {new Date(event.scheduled_start).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Indicador de mais eventos */}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayEvents.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Eventos do Dia Selecionado */}
      {(() => {
        const todayEvents = getEventsForDate(new Date());
        if (todayEvents.length > 0) {
          return (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Eventos de Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {event.banner_url && (
                          <img
                            src={event.banner_url}
                            alt={event.name}
                            className="w-12 h-8 object-cover rounded"
                          />
                        )}
                        <div>
                          <h4 className="font-medium">{event.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(event.scheduled_start).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {event.max_participants && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {event.max_participants}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {event.prize_radcoins}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(event.status) + " text-white"}>
                          {event.status}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => onView(event.id)}>
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onEdit(event.id)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        }
        return null;
      })()}
    </div>
  );
}
