
import React from "react";
import { Calendar, Award, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventType } from "@/hooks/useActiveEvents";

type Props = {
  event: EventType;
  onEnter?: (eventId: string) => void;
};

export function EventCardPlayer({ event, onEnter }: Props) {
  return (
    <div className="rounded-2xl shadow-lg bg-white p-4 sm:p-6 flex flex-col hover:scale-105 transition-all duration-200 border border-cyan-200 max-w-xl w-full">
      {/* Mobile: Vertical layout, Desktop: Horizontal */}
      <div className="flex flex-col sm:flex-row gap-4">
        <img
          src={event.banner_url || '/placeholder.svg'}
          alt="banner"
          className="w-full h-32 sm:w-28 sm:h-20 object-cover rounded-xl border"
        />
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:gap-2 sm:items-center mb-2">
              <span className="font-bold text-lg sm:text-xl text-cyan-700 leading-tight">{event.name}</span>
              <div className="flex gap-2 mt-1 sm:mt-0">
                {event.status === "ACTIVE" && (
                  <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold">Ao Vivo</span>
                )}
                {event.status === "SCHEDULED" && (
                  <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-bold">Em breve</span>
                )}
              </div>
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
                  {event.prize_distribution.slice(0, 3).map((p: any, i: number) =>
                    <span key={i} className="ml-1">{p.position}º: <b className="text-cyan-700">{p.prize}</b></span>
                  )}
                </span>
              )}
            </div>
          </div>
          <Button
            className="mt-4 min-h-[44px] bg-gradient-to-r from-[#11d3fc] to-[#26b2fe] text-white font-bold px-6 py-3 rounded-lg shadow hover:scale-105 outline-none border-none text-sm sm:text-base"
            onClick={() => onEnter?.(event.id)}
          >
            {event.status === "ACTIVE" ? "Participar Agora" : "Fique Ligado"}
          </Button>
        </div>
      </div>
    </div>
  );
}
