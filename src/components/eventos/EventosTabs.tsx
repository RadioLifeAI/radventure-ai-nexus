
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Calendar, Target } from "lucide-react";
import { EventsAdvancedVisualization } from "./EventsAdvancedVisualization";
import { EventFilterBarFunctional } from "./EventFilterBarFunctional";
import { EventsGrid } from "./EventsGrid";
import { EventosAnalytics } from "./EventosAnalytics";

interface EventosTabsProps {
  activeView: string;
  onViewChange: (view: string) => void;
  filteredEvents: any[];
  loading: boolean;
  filters: any;
  onUpdateFilter: any;
  onUpdateArrayFilter: any;
  onClearFilters: any;
  hasActiveFilters: boolean;
  totalEvents: number;
  onEnterEvent: (eventId: string) => void;
}

export function EventosTabs({
  activeView,
  onViewChange,
  filteredEvents,
  loading,
  filters,
  onUpdateFilter,
  onUpdateArrayFilter,
  onClearFilters,
  hasActiveFilters,
  totalEvents,
  onEnterEvent
}: EventosTabsProps) {
  return (
    <div className="mt-6">
      <Tabs value={activeView} onValueChange={onViewChange} className="space-y-6">
        <TabsList className="grid grid-cols-3 bg-white/10 backdrop-blur-sm border border-white/20">
          <TabsTrigger value="visualization" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
            <TrendingUp className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Visualizações</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Todos</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
            <Target className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visualization">
          <EventsAdvancedVisualization events={filteredEvents} onEnterEvent={onEnterEvent} />
        </TabsContent>

        <TabsContent value="events">
          <div className="space-y-6">
            <EventFilterBarFunctional
              filters={filters}
              onUpdateFilter={onUpdateFilter}
              onUpdateArrayFilter={onUpdateArrayFilter}
              onClearFilters={onClearFilters}
              hasActiveFilters={hasActiveFilters}
              totalEvents={totalEvents}
              filteredEvents={filteredEvents.length}
            />
            
            {loading ? (
              <div className="text-cyan-400 mt-6 animate-fade-in">Carregando eventos...</div>
            ) : (
              <EventsGrid events={filteredEvents} onEnterEvent={onEnterEvent} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <EventosAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
