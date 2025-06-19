
import React from "react";
import { EventType } from "@/hooks/useActiveEvents";
import { Calendar, Award, Users, Clock, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEventRegistration } from "@/hooks/useEventRegistration";

type Props = {
  highlights: EventType[];
};

export function UpcomingEventsSlider({ highlights }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { registerForEvent, loading } = useEventRegistration();

  if (!highlights || highlights.length === 0) return null;

  const handleEventClick = (event: EventType) => {
    navigate(`/app/evento/${event.id}`);
  };

  const handleQuickAction = async (e: React.MouseEvent, event: EventType) => {
    e.stopPropagation();
    
    if (!user) {
      navigate("/login");
      return;
    }

    if (event.status === 'ACTIVE') {
      navigate(`/app/evento/${event.id}/arena`);
    } else if (event.status === 'SCHEDULED') {
      const success = await registerForEvent(event.id, user.id);
      if (success) {
        // Registro realizado com sucesso
      }
    } else {
      navigate(`/app/evento/${event.id}`);
    }
  };

  const getTimeUntilStart = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start.getTime() - now.getTime();
    
    if (diff <= 0) return "Iniciado";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <div className="w-full mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Award className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-bold text-white">Eventos em Destaque</h3>
      </div>
      
      <div className="flex overflow-x-auto gap-4 pb-4 animate-fade-in">
        {highlights.map((event) => {
          const isActive = event.status === "ACTIVE";
          const isScheduled = event.status === "SCHEDULED";
          const timeInfo = isScheduled ? getTimeUntilStart(event.scheduled_start) : null;

          return (
            <div 
              key={event.id} 
              className="min-w-[360px] max-w-sm rounded-2xl bg-gradient-to-br from-white via-cyan-50 to-blue-100 shadow-xl p-5 flex flex-col gap-3 border-2 border-cyan-200 hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => handleEventClick(event)}
            >
              {/* Header com imagem e status */}
              <div className="relative">
                <img
                  src={event.banner_url || "/placeholder.svg"}
                  alt={event.name}
                  className="w-full h-32 object-cover rounded-xl border-2 border-white shadow-sm"
                />
                <div className="absolute top-2 right-2">
                  {isActive && (
                    <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      AO VIVO
                    </span>
                  )}
                  {isScheduled && (
                    <span className="inline-flex items-center gap-1 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      <Clock className="h-3 w-3" />
                      {timeInfo}
                    </span>
                  )}
                </div>
              </div>

              {/* Conteúdo */}
              <div className="flex-1">
                <h4 className="font-bold text-xl text-gray-800 mb-2 line-clamp-2">
                  {event.name}
                </h4>
                
                {event.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {event.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.scheduled_start).toLocaleDateString("pt-BR", {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  
                  {event.max_participants && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {event.participant_count || 0}/{event.max_participants}
                    </span>
                  )}
                </div>

                {/* Prêmio */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-2 rounded-lg">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span className="font-bold text-yellow-800">
                      {event.prize_radcoins.toLocaleString()} RadCoins
                    </span>
                  </div>
                  
                  {event.event_type && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {event.event_type === 'quiz_timed' ? 'Quiz Cronometrado' :
                       event.event_type === 'quiz_free' ? 'Quiz Livre' :
                       event.event_type === 'tournament' ? 'Torneio' : 'Desafio'}
                    </span>
                  )}
                </div>

                {/* Ação */}
                <button
                  onClick={(e) => handleQuickAction(e, event)}
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl' 
                      : isScheduled 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600' 
                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                >
                  {loading ? (
                    "Processando..."
                  ) : isActive ? (
                    <>
                      <Play className="inline h-4 w-4 mr-2" />
                      Entrar Agora
                    </>
                  ) : isScheduled ? (
                    user ? "Inscrever-se" : "Fazer Login"
                  ) : (
                    "Ver Detalhes"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
