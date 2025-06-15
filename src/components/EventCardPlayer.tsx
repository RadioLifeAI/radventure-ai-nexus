
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
    <div className="rounded-2xl shadow-lg bg-white p-4 flex flex-col justify-between hover:scale-105 transition-all duration-200 border border-cyan-200 max-w-xl w-full">
      <div className="flex gap-4">
        <img
          src={event.banner_url || '/placeholder.svg'}
          alt="banner"
          className="w-28 h-20 object-cover rounded-xl border"
        />
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex gap-2 items-center mb-1">
              <span className="font-bold text-lg text-cyan-700">{event.name}</span>
              {event.status === "ACTIVE" && (
                <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-bold">Ao Vivo</span>
              )}
              {event.status === "SCHEDULED" && (
                <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs font-bold">Em breve</span>
              )}
            </div>
            <div className="flex gap-3 text-xs text-gray-500 mb-1">
              <span className="flex items-center gap-1"><Calendar size={14} />{new Date(event.scheduled_start).toLocaleDateString("pt-BR")}</span>
              {event.max_participants && (
                <span className="flex items-center gap-1"><Users size={14} />{event.max_participants} máx</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm">
              <Award size={16} className="text-yellow-400" />
              <span className="font-semibold">{event.prize_radcoins} RadCoins</span>
              {Array.isArray(event.prize_distribution) && event.prize_distribution.length >= 3 && (
                <span className="ml-1 text-gray-400">{'• Top 3: '}
                  <Trophy size={12} className="inline-align text-yellow-600" />
                  {event.prize_distribution.slice(0, 3).map((p: any, i: number) =>
                    <span className="ml-1">{p.position}º: <b className="text-cyan-700">{p.prize}</b></span>
                  )}
                </span>
              )}
            </div>
          </div>
          <Button
            size="sm"
            className="mt-3 bg-gradient-to-r from-[#11d3fc] to-[#26b2fe] text-white font-bold px-6 py-2 rounded-lg shadow hover:scale-105 outline-none border-none"
            onClick={() => onEnter?.(event.id)}
          >
            {event.status === "ACTIVE" ? "Participar Agora" : "Fique Ligado"}
          </Button>
        </div>
      </div>
    </div>
  );
}
