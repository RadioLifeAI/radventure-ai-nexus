
import React from "react";
import { EventType } from "@/hooks/useActiveEvents";
import { Calendar, Award, Users } from "lucide-react";

type Props = {
  highlights: EventType[];
};

export function UpcomingEventsSlider({ highlights }: Props) {
  if (!highlights || highlights.length === 0) return null;
  return (
    <div className="w-full flex overflow-x-auto gap-4 mb-4 animate-fade-in">
      {highlights.map((event) => (
        <div key={event.id} className="min-w-[340px] max-w-xs rounded-2xl bg-gradient-to-br from-cyan-800 via-cyan-500 to-blue-400 shadow-lg p-4 flex flex-col gap-2 border-2 border-cyan-200 hover:scale-105 transition">
          <div className="flex items-center gap-2">
            <img
              src={event.banner_url || "/placeholder.svg"}
              alt=""
              className="w-16 h-14 object-cover rounded-xl border"
            />
            <div>
              <div className="font-bold text-lg text-white drop-shadow">{event.name}</div>
              <div className="flex gap-2 text-xs text-cyan-100">
                <span className="flex items-center gap-1"><Calendar size={14} />{new Date(event.scheduled_start).toLocaleDateString("pt-BR")}</span>
                {event.max_participants && (
                  <span className="flex items-center gap-1"><Users size={14} />{event.max_participants} máx</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center text-yellow-200 gap-1">
            <Award size={15} /> {" "}
            <span className="font-semibold">{event.prize_radcoins} RadCoins em prêmios</span>
          </div>
          {event.status === "SCHEDULED" && (
            <span className="inline-block bg-yellow-200/90 text-yellow-900 text-xs font-semibold px-2 py-1 rounded-full w-fit">Em breve</span>
          )}
          {event.status === "ACTIVE" && (
            <span className="inline-block bg-green-200/90 text-green-800 text-xs font-semibold px-2 py-1 rounded-full w-fit">Ao Vivo</span>
          )}
        </div>
      ))}
    </div>
  );
}
