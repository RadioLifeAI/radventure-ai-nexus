
import React from "react";
import { useActiveEvents } from "@/hooks/useActiveEvents";
import { HeaderNav } from "@/components/HeaderNav";
import { EventFilterBar } from "@/components/eventos/EventFilterBar";
import { UpcomingEventsSlider } from "@/components/eventos/UpcomingEventsSlider";
import { EventsGrid } from "@/components/eventos/EventsGrid";

export default function Eventos() {
  const { events, loading } = useActiveEvents();

  // Em destaque: próximos 2 eventos
  const highlights = events.slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      <main className="flex-1 flex flex-col px-2 md:px-16 pt-4 pb-10">
        <h1 className="font-extrabold text-3xl mb-2 text-white animate-fade-in">Eventos Gamificados</h1>
        <p className="mb-4 text-cyan-100 text-lg animate-fade-in">Participe de desafios interativos, dispute prêmios e suba no ranking!</p>
        <UpcomingEventsSlider highlights={highlights} />
        <EventFilterBar />
        {loading ? (
          <div className="text-cyan-400 mt-6 animate-fade-in">Carregando eventos...</div>
        ) : (
          <EventsGrid events={events} />
        )}
        {/* Placeholder para MyEventHistory na parte inferior (proximas etapas) */}
      </main>
    </div>
  );
}
