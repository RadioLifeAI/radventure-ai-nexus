
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
    // Navegar para página de detalhes do evento
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
      className="rounded-2xl shadow-xl bg-white/95 backdrop-blur-sm p-4 flex flex-col hover:scale-105 transition-all duration-200 border-2 border-cyan-300/60 max-w-xl w-full relative overflow-hidden hover:ring-4 hover:ring-cyan-300/40 animate-fade-in cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Status badges */}
      <div className="absolute right-4 top-4 flex gap-1 z-10">
        {isActive && (
          <Badge className="bg-green-100 text-green-800 text-xs font-bold animate-pulse border border-green-300">
            Ao Vivo
          </Badge>
        )}
        {isSoon && (
          <Badge className="bg-yellow-100 text-yellow-800 text-xs font-bold border border-yellow-300">
            Em breve
          </Badge>
        )}
        {isRegistered && (
          <Badge className="bg-blue-100 text-blue-800 text-xs font-bold border border-blue-300">
            <UserCheck className="h-3 w-3 mr-1" />
            Inscrito
          </Badge>
        )}
      </div>

      <div className="flex gap-4">
        <img
          src={event.banner_url || '/placeholder.svg'}
          alt="banner"
          className="w-28 h-20 object-cover rounded-xl border border-gray-300/60"
        />
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="font-bold text-lg text-gray-900 drop-shadow mb-1">
              {event.name}
            </div>
            <div className="flex gap-3 text-xs text-gray-600 mb-1">
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
            <div className="flex items-center gap-2 mt-2 text-sm">
              <Award size={16} className="text-yellow-600" />
              <span className="font-semibold text-gray-900">{event.prize_radcoins} RadCoins</span>
              {Array.isArray(event.prize_distribution) && event.prize_distribution.length >= 3 && (
                <span className="ml-1 text-gray-600 text-xs">
                  • Top 3: 
                  <Trophy size={12} className="inline ml-1 text-yellow-600" />
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 mt-3">
            {/* Botão principal - varia conforme estado */}
            {isActive && isRegistered ? (
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-4 py-2 rounded-lg shadow-md border border-white/20"
                onClick={handleEnterEvent}
              >
                <Play className="h-3 w-3 mr-1" />
                Entrar Agora
              </Button>
            ) : !isRegistered ? (
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold px-4 py-2 rounded-lg shadow-md hover:scale-105 border border-white/20"
                onClick={handleQuickRegister}
                disabled={loading}
              >
                {loading ? "..." : "Inscrever-se"}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-gray-300 text-gray-800 hover:bg-gray-50"
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
