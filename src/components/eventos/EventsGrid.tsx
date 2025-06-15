
import React from "react";
import { EventCardGamified } from "./EventCardGamified";
import { EventType } from "@/hooks/useActiveEvents";

type Props = {
  events: EventType[];
  onEnterEvent?: (eventId: string) => void;
};

export function EventsGrid({ events, onEnterEvent }: Props) {
  if (events.length === 0) {
    return (
      <section className="w-full mt-10 flex flex-col items-center animate-fade-in">
        <span className="text-cyan-500">Nenhum evento disponível no momento. Volte em breve!</span>
      </section>
    );
  }
  return (
    <section className="w-full mt-2 mb-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
      {events.map((event) => (
        <EventCardGamified key={event.id} event={event} onEnter={onEnterEvent} />
      ))}
    </section>
  );
}
