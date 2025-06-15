
import React from "react";
import { Filter, Award } from "lucide-react";

export function EventFilterBar() {
  // Os filtros serão funcionais em etapas futuras!
  return (
    <div className="w-full flex flex-wrap gap-4 items-center mb-4 px-1 animate-fade-in">
      <div className="flex items-center gap-2 bg-cyan-200/60 px-3 py-2 rounded-full font-semibold text-cyan-900">
        <Filter size={16} className="text-cyan-900" /> Filtros
      </div>
      <button className="px-3 py-1 rounded-full bg-white/80 text-cyan-700 font-semibold text-sm border border-cyan-400 hover:scale-105 transition">Categoria</button>
      <button className="px-3 py-1 rounded-full bg-white/80 text-cyan-700 font-semibold text-sm border border-cyan-400 hover:scale-105 transition">Dificuldade</button>
      <button className="px-3 py-1 rounded-full bg-white/80 text-cyan-700 font-semibold text-sm border border-cyan-400 hover:scale-105 transition">Prêmio <Award size={13} className="inline ml-1 text-yellow-600" /></button>
      <button className="px-3 py-1 rounded-full bg-white/80 text-cyan-700 font-semibold text-sm border border-cyan-400 hover:scale-105 transition">Status</button>
    </div>
  );
}
