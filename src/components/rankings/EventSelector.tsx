
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, Users, Clock } from "lucide-react";

type Event = {
  id: string;
  name: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string;
  prize_radcoins: number;
  max_participants?: number;
};

type Props = {
  events: Event[];
  selectedEvent: Event | null;
  onSelectEvent: (event: Event) => void;
};

export function EventSelector({ events, selectedEvent, onSelectEvent }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'FINISHED': return 'bg-gray-500';
      case 'SCHEDULED': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Ativo';
      case 'FINISHED': return 'Finalizado';
      case 'SCHEDULED': return 'Agendado';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="w-full mb-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Calendar className="text-cyan-400" size={20} />
        Selecionar Evento
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <Button
            key={event.id}
            onClick={() => onSelectEvent(event)}
            variant="outline"
            className={`h-auto p-4 text-left justify-start transition-all duration-200 hover:scale-105 ${
              selectedEvent?.id === event.id
                ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-300 ring-2 ring-cyan-200'
                : 'bg-white/90 border-gray-200 hover:bg-white hover:shadow-lg'
            }`}
          >
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800 text-sm truncate">{event.name}</span>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(event.status)}`} />
              </div>
              
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{getStatusText(event.status)}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Trophy size={12} />
                  <span>{event.prize_radcoins} RadCoins</span>
                </div>
                
                {event.max_participants && (
                  <div className="flex items-center gap-1">
                    <Users size={12} />
                    <span>Máx: {event.max_participants}</span>
                  </div>
                )}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
