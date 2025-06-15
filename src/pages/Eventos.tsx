
import React from "react";
import { EventsSectionPlayer } from "@/components/EventsSectionPlayer";
import { HeaderNav } from "@/components/HeaderNav";

export default function Eventos() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      <main className="flex-1 flex flex-col px-2 md:px-16 pt-4 pb-10">
        <h1 className="font-extrabold text-3xl mb-3 text-white">Eventos Gamificados</h1>
        <EventsSectionPlayer />
      </main>
    </div>
  );
}
