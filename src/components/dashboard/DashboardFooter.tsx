
import React from "react";

interface DashboardFooterProps {
  specialties: any[];
  events: any[];
  profile: any;
}

export function DashboardFooter({ specialties, events, profile }: DashboardFooterProps) {
  return (
    <footer className="w-full bg-gradient-to-t from-[#131f3a] to-transparent px-4 py-10 text-center mt-auto border-t border-white/10 flex-shrink-0">
      <div className="max-w-4xl mx-auto">
        <span className="text-cyan-100 text-sm flex items-center justify-center gap-2">
          Powered by RadVenture · Experiência para médicos do futuro 
          <span className="text-lg animate-bounce">🚀</span>
        </span>
        <div className="mt-2 text-xs text-cyan-300">
          {specialties.length} especialidades • {specialties.reduce((sum, spec) => sum + spec.cases, 0)} casos • {events.length} eventos
        </div>
        {profile && (
          <div className="mt-1 text-xs text-cyan-400">
            Bem-vindo, {profile.full_name || profile.username || 'Usuário'}!
          </div>
        )}
      </div>
    </footer>
  );
}
