
import React, { useState } from "react";
import { useActiveEvents } from "@/hooks/useActiveEvents";
import { useEventFilters } from "@/hooks/useEventFilters";
import { useEventMetrics } from "@/hooks/useEventMetrics";
import { useEventosHandlers } from "@/hooks/useEventosHandlers";
import { HeaderNav } from "@/components/HeaderNav";
import { EventMetricsCards } from "@/components/eventos/EventMetricsCards";
import { UpcomingEventsSlider } from "@/components/eventos/UpcomingEventsSlider";
import { EventosHeader } from "@/components/eventos/EventosHeader";
import { EventosTabs } from "@/components/eventos/EventosTabs";
import { EventRankingsAccessButton } from "@/components/eventos/EventRankingsAccessButton";

export default function EventosEnhanced() {
  const { events, loading } = useActiveEvents();
  const { metrics, loading: metricsLoading } = useEventMetrics();
  const { 
    filters, 
    applyFilters, 
    updateFilter, 
    updateArrayFilter, 
    clearFilters, 
    hasActiveFilters 
  } = useEventFilters();
  const { handleEnterEvent } = useEventosHandlers();
  const [activeView, setActiveView] = useState("events");

  // Aplicar filtros aos eventos
  const filteredEvents = applyFilters(events);
  const highlights = filteredEvents.slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      <main className="flex-1 flex flex-col px-2 md:px-16 pt-4 pb-10">
        <EventosHeader />
        <EventMetricsCards metrics={metrics} loading={metricsLoading} />
        
        {/* Botão de Acesso aos Rankings de Eventos */}
        <EventRankingsAccessButton className="mb-6 animate-fade-in" />
        
        <UpcomingEventsSlider highlights={highlights} />
        
        <EventosTabs
          activeView={activeView}
          onViewChange={setActiveView}
          filteredEvents={filteredEvents}
          loading={loading}
          filters={filters}
          onUpdateFilter={updateFilter}
          onUpdateArrayFilter={updateArrayFilter}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          totalEvents={events.length}
          onEnterEvent={handleEnterEvent}
        />
      </main>
    </div>
  );
}
