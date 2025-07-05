
import React, { useState, useEffect } from "react";
import { Award, Trophy, Calendar, Users, Play, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventType } from "@/hooks/useActiveEvents";
import { useEventRegistration } from "@/hooks/useEventRegistration";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

type Props = {
  event: EventType;
  onEnter?: (eventId: string) => void;
};

export function EventCardGamified({ event, onEnter }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, registerForEvent, checkRegistration } = useEventRegistration();
  const [isRegistered, setIsRegistered] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);

  const isSoon = event.status === "SCHEDULED";
  const isActive = event.status === "ACTIVE";

  useEffect(() => {
    if (user) {
      checkUserRegistration();
    }
  }, [user, event.id]);

  const checkUserRegistration = async () => {
    if (!user) return;
    const registered = await checkRegistration(event.id, user.id);
    setIsRegistered(registered);
  };

  const handleQuickRegister = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    
    const success = await registerForEvent(event.id, user.id);
    if (success) {
      setIsRegistered(true);
    }
  };

  const handleCardClick = () => {
    // Navegar para página de detalhes do evento - CORRIGIDO
    navigate(`/app/evento/${event.id}`);
  };

  const handleEnterEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive && isRegistered) {
      onEnter?.(event.id);
    } else {
      navigate(`/app/evento/${event.id}`);
    }
  };

  return (
    <div 
      className="rounded-2xl shadow-xl bg-white bg-opacity-85 p-4 sm:p-6 flex flex-col hover:scale-105 transition-all duration-200 border-2 border-cyan-200 max-w-xl w-full relative overflow-hidden hover:ring-4 hover:ring-cyan-200 animate-fade-in cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Status badges */}
      <div className="absolute right-4 top-4 flex flex-wrap gap-1 z-10">
        {isActive && (
          <Badge className="bg-green-200 text-green-900 text-xs font-bold animate-pulse">
            Ao Vivo
          </Badge>
        )}
        {isSoon && (
          <Badge className="bg-yellow-200 text-yellow-900 text-xs font-bold">
            Em breve
          </Badge>
        )}
        {isRegistered && (
          <Badge className="bg-blue-200 text-blue-900 text-xs font-bold">
            <UserCheck className="h-3 w-3 mr-1" />
            Inscrito
          </Badge>
        )}
      </div>

      {/* Mobile: Vertical layout, Desktop: Horizontal */}
      <div className="flex flex-col sm:flex-row gap-4">
        <img
          src={event.banner_url || '/placeholder.svg'}
          alt="banner"
          className="w-full h-32 sm:w-28 sm:h-20 object-cover rounded-xl border"
        />
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="font-bold text-lg sm:text-xl text-cyan-700 drop-shadow mb-2 leading-tight">
              {event.name}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(event.scheduled_start).toLocaleDateString("pt-BR")}
              </span>
              {event.max_participants && (
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {event.max_participants} máx
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-yellow-400" />
                <span className="font-semibold">{event.prize_radcoins} RadCoins</span>
              </div>
              {Array.isArray(event.prize_distribution) && event.prize_distribution.length >= 3 && (
                <span className="text-gray-400 text-xs">
                  • Top 3: 
                  <Trophy size={12} className="inline ml-1 text-yellow-600" />
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            {/* Botão principal - varia conforme estado */}
            {isActive && isRegistered ? (
              <Button
                className="flex-1 min-h-[44px] bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-4 py-3 rounded-lg shadow text-sm sm:text-base"
                onClick={handleEnterEvent}
              >
                <Play className="h-4 w-4 mr-2" />
                Entrar Agora
              </Button>
            ) : !isRegistered ? (
              <Button
                className="flex-1 min-h-[44px] bg-gradient-to-r from-[#11d3fc] to-[#26b2fe] text-white font-bold px-4 py-3 rounded-lg shadow hover:scale-105 text-sm sm:text-base"
                onClick={handleQuickRegister}
                disabled={loading}
              >
                {loading ? "..." : "Inscrever-se"}
              </Button>
            ) : (
              <Button
                variant="outline"
                className="flex-1 min-h-[44px] px-4 py-3 text-sm sm:text-base"
                onClick={handleEnterEvent}
              >
                Ver Detalhes
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
