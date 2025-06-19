
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Grid3x3,
  BarChart3,
  Map,
  Clock,
  Users,
  Trophy,
  Zap,
  Star,
  Play
} from "lucide-react";
import { EventType } from "@/hooks/useActiveEvents";

interface Props {
  events: EventType[];
  onEnterEvent?: (eventId: string) => void;
}

export function EventsAdvancedVisualization({ events, onEnterEvent }: Props) {
  const [viewMode, setViewMode] = useState<"timeline" | "calendar" | "kanban" | "heatmap">("timeline");

  const getStatusColor = (status: string) => {
    const colors = {
      SCHEDULED: "bg-blue-100 text-blue-700 border-blue-200",
      ACTIVE: "bg-green-100 text-green-700 border-green-200",
      FINISHED: "bg-gray-100 text-gray-700 border-gray-200"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Zap className="h-3 w-3" />;
      case 'SCHEDULED': return <Clock className="h-3 w-3" />;
      default: return <Star className="h-3 w-3" />;
    }
  };

  const renderTimeline = () => (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 to-purple-500"></div>
        {events.map((event, index) => (
          <div key={event.id} className="relative flex items-start space-x-6 pb-8">
            <div className="flex-shrink-0 relative">
              <div className="w-8 h-8 bg-white border-4 border-cyan-500 rounded-full flex items-center justify-center">
                {getStatusIcon(event.status)}
              </div>
              {index < events.length - 1 && (
                <div className="absolute top-8 left-4 w-0.5 h-8 bg-gray-200"></div>
              )}
            </div>
            <Card className="flex-1 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{event.name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(event.scheduled_start).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <Badge className={getStatusColor(event.status)}>
                    {event.status === 'ACTIVE' ? 'Ao Vivo' : 
                     event.status === 'SCHEDULED' ? 'Agendado' : 'Finalizado'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      {event.prize_radcoins} RC
                    </span>
                    {event.max_participants && (
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.max_participants} máx
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onEnterEvent?.(event.id)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    {event.status === 'ACTIVE' ? 'Participar' : 'Ver Detalhes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCalendar = () => (
    <div className="grid grid-cols-7 gap-2">
      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
        <div key={day} className="p-3 text-center font-medium text-gray-600 bg-gray-50 rounded-lg">
          {day}
        </div>
      ))}
      {Array.from({ length: 35 }, (_, i) => {
        const dayEvents = events.filter(event => 
          new Date(event.scheduled_start).getDate() === (i % 30) + 1
        );
        return (
          <div key={i} className="p-2 min-h-[80px] border border-gray-200 rounded-lg bg-white hover:bg-gray-50">
            <div className="text-sm font-medium text-gray-600 mb-1">
              {(i % 30) + 1}
            </div>
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                className="text-xs p-1 rounded bg-cyan-100 text-cyan-700 mb-1 cursor-pointer hover:bg-cyan-200"
                onClick={() => onEnterEvent?.(event.id)}
              >
                {event.name.slice(0, 15)}...
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">+{dayEvents.length - 2} mais</div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderKanban = () => {
    const columns = [
      { title: 'Agendados', status: 'SCHEDULED', color: 'bg-blue-50 border-blue-200' },
      { title: 'Ao Vivo', status: 'ACTIVE', color: 'bg-green-50 border-green-200' },
      { title: 'Finalizados', status: 'FINISHED', color: 'bg-gray-50 border-gray-200' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(column => (
          <div key={column.status} className={`rounded-lg border-2 ${column.color} p-4`}>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              {getStatusIcon(column.status)}
              {column.title}
              <Badge variant="secondary">
                {events.filter(e => e.status === column.status).length}
              </Badge>
            </h3>
            <div className="space-y-3">
              {events
                .filter(event => event.status === column.status)
                .map(event => (
                  <Card key={event.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <h4 className="font-medium text-sm mb-2">{event.name}</h4>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{event.prize_radcoins} RC</span>
                        <span>{new Date(event.scheduled_start).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => onEnterEvent?.(event.id)}
                      >
                        Ver Evento
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderHeatmap = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Neurologia', 'Cardiologia', 'Radiologia', 'Dermatologia'].map(specialty => (
          <Card key={specialty} className="text-center">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">{specialty}</h4>
              <div className="w-full h-20 bg-gradient-to-t from-blue-200 to-blue-500 rounded-lg relative">
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-white text-xs font-bold">
                  {Math.floor(Math.random() * 50) + 10} eventos
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Atividade Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 * 4 }, (_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-sm ${
                  Math.random() > 0.5 ? 'bg-green-200' : 
                  Math.random() > 0.3 ? 'bg-green-300' : 'bg-green-500'
                }`}
                title={`${Math.floor(Math.random() * 10)} eventos`}
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const viewModes = [
    { id: "timeline", label: "Timeline", icon: Clock },
    { id: "calendar", label: "Calendário", icon: Calendar },
    { id: "kanban", label: "Kanban", icon: Grid3x3 },
    { id: "heatmap", label: "Heat Map", icon: Map }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-600" />
            Visualizações Avançadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
              {viewModes.map(mode => (
                <TabsTrigger key={mode.id} value={mode.id} className="flex items-center gap-2">
                  <mode.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{mode.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="timeline">{renderTimeline()}</TabsContent>
              <TabsContent value="calendar">{renderCalendar()}</TabsContent>
              <TabsContent value="kanban">{renderKanban()}</TabsContent>
              <TabsContent value="heatmap">{renderHeatmap()}</TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
