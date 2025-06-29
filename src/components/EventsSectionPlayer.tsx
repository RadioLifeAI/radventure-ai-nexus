
import React from "react";
import { useActiveEvents } from "@/hooks/useActiveEvents";
import { EventCardPlayer } from "./EventCardPlayer";

type Props = {
  onEnterEvent?: (eventId: string) => void;
};

export function EventsSectionPlayer({ onEnterEvent }: Props) {
  const { events, loading } = useActiveEvents();

  if (loading) {
    return (
      <section className="w-full mt-6 mb-8 flex flex-col items-center animate-fade-in">
        <span className="text-cyan-500">Carregando eventos...</span>
      </section>
    );
  }
  if (events.length === 0) {
    return (
      <section className="w-full mt-6 mb-8 flex flex-col items-center animate-fade-in">
        <span className="text-cyan-500">Nenhum evento disponível no momento. Volte em breve!</span>
      </section>
    );
  }

  return (
    <section className="w-full mt-6 mb-12">
      <h2 className="font-extrabold text-2xl text-white mb-2">Eventos Gamificados de Radiologia</h2>
      <div className="flex flex-col gap-6 md:grid md:grid-cols-2 xl:grid-cols-3">
        {events.map(event => (
          <EventCardPlayer key={event.id} event={event} onEnter={onEnterEvent} />
        ))}
      </div>
    </section>
  );
}
