
import React from "react";
import { EventosHeaderActions } from "./EventosHeaderActions";

export function EventosHeader() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="font-extrabold text-4xl mb-2 text-white animate-fade-in bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Eventos Gamificados 🚀
        </h1>
        <p className="mb-4 text-cyan-100 text-lg animate-fade-in">
          Experiência revolucionária de aprendizado com IA, rankings em tempo real e conquistas épicas!
        </p>
      </div>
      <EventosHeaderActions />
    </div>
  );
}
