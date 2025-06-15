
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, Clock } from "lucide-react";

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
  event: Event;
  participantCount?: number;
};

export function EventStatsHeader({ event, participantCount = 0 }: Props) {
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
      case 'ACTIVE': return 'Em Andamento';
      case 'FINISHED': return 'Finalizado';
      case 'SCHEDULED': return 'Agendado';
      default: return 'Desconhecido';
    }
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

  return (
    <div className="w-full bg-gradient-to-r from-cyan-50 via-blue-50 to-purple-50 border-2 border-cyan-200 rounded-xl p-6 mb-6 shadow-lg animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="text-yellow-500" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">{event.name}</h2>
            <Badge className={`text-white ${getStatusColor(event.status)}`}>
              {getStatusText(event.status)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>Início: {formatDate(event.scheduled_start)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>Fim: {formatDate(event.scheduled_end)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:items-end gap-2">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{event.prize_radcoins}</div>
              <div className="text-xs text-gray-500">RadCoins Total</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">{participantCount}</div>
              <div className="text-xs text-gray-500">Participantes</div>
            </div>
            
            {event.max_participants && (
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{event.max_participants}</div>
                <div className="text-xs text-gray-500">Máximo</div>
              </div>
            )}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300"
              style={{ 
                width: event.max_participants 
                  ? `${Math.min((participantCount / event.max_participants) * 100, 100)}%`
                  : '100%'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
