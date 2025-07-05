
import React from "react";
import { Activity, BookOpen, Calendar, Trophy } from "lucide-react";
import { ActionCard } from "./ActionCard";

interface QuickActionsSectionProps {
  onCentralCasos: () => void;
  onCriarJornada: () => void;
  onEventos: () => void;
  onConquistas: () => void;
}

export function QuickActionsSection({ 
  onCentralCasos, 
  onCriarJornada, 
  onEventos, 
  onConquistas 
}: QuickActionsSectionProps) {
  return (
    <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-2 mb-4 px-2 sm:px-0">
      <ActionCard
        icon={<Activity />}
        title="Central de Casos"
        description="Resolva desafios reais, aprenda e suba de nível!"
        onClick={onCentralCasos}
        color="text-[#11d3fc]"
      />
      <ActionCard
        icon={<BookOpen />}
        title="Crie sua Jornada"
        description="Personalize seu aprendizado com módulos e trilhas temáticas."
        onClick={onCriarJornada}
        color="text-[#a189fa]"
      />
      <ActionCard
        icon={<Calendar />}
        title="Eventos"
        description="Participe de eventos exclusivos e concorra no ranking."
        onClick={onEventos}
        color="text-[#11d3fc]"
      />
      <ActionCard
        icon={<Trophy />}
        title="Sistema de Conquistas"
        description="Desbloqueie conquistas épicas e ganhe RadCoins!"
        onClick={onConquistas}
        color="text-[#ffd700]"
      />
    </section>
  );
}
