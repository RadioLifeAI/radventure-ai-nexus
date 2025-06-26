
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackToDashboard } from "@/components/navigation/BackToDashboard";
import { EventsManagementHeader } from "@/components/admin/events/EventsManagementHeader";
import { EventsAdvancedFilters } from "./components/EventsAdvancedFilters";
import { EventsViewSelector, EventViewMode } from "./components/EventsViewSelector";
import { EventsCardsView } from "./components/EventsCardsView";
import { EventsTimelineView } from "./components/EventsTimelineView";
import { EventsCalendarView } from "./components/EventsCalendarView";
import { EventsAnalyticsView } from "./components/EventsAnalyticsView";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/Loader";

// Interface para eventos com tipos corretos
interface Event {
  id: string;
  name: string;
  description?: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string;
  event_type?: string;
  max_participants?: number;
  number_of_cases?: number;
  prize_radcoins: number;
  prize_distribution?: any;
  banner_url?: string;
  auto_start?: boolean;
  duration_minutes?: number;
  case_filters?: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export default function EventsManagement() {
  const navigate = useNavigate();
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    status: [],
    event_type: [],
    creator: "",
    date_range: {},
    participants: {},
    prize_range: {}
  });
  const [viewMode, setViewMode] = useState<EventViewMode>("cards");
  const [sortField, setSortField] = useState("scheduled_start");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Fetch events using real Supabase data with proper type conversion
  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ['events', filters, sortField, sortDirection],
    queryFn: async () => {
      let query = supabase.from("events").select("*");

      // Apply filters
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.status.length > 0) {
        query = query.in("status", filters.status);
      }

      // Apply sorting
      query = query.order(sortField, { ascending: sortDirection === "asc" });

      const { data, error } = await query;
      if (error) throw error;
      
      // Convert Supabase data to Event interface
      return (data || []).map(event => ({
        ...event,
        prize_distribution: event.prize_distribution ? 
          (typeof event.prize_distribution === 'string' ? 
            JSON.parse(event.prize_distribution) : 
            event.prize_distribution) : 
          null,
        case_filters: event.case_filters ? 
          (typeof event.case_filters === 'string' ? 
            JSON.parse(event.case_filters) : 
            event.case_filters) : 
          null
      })) as Event[];
    }
  });

  const deleteEvent = async (eventId: string) => {
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (error) {
      console.error("Error deleting event:", error);
      return;
    }

    refetch();
  };

  const handleEdit = (eventId: string) => {
    navigate(`/admin/events/${eventId}/edit`);
  };

  const handleView = (eventId: string) => {
    console.log("Ver evento:", eventId);
  };

  const handleDuplicate = (eventId: string) => {
    console.log("Duplicar evento:", eventId);
  };

  const handleAnalytics = (eventId: string) => {
    console.log("Analytics do evento:", eventId);
  };

  const handleToggleStatus = async (eventId: string) => {
    console.log("Alternar status do evento:", eventId);
  };

  const handleEventSelect = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSelectAll = () => {
    setSelectedEvents(prev => 
      prev.length === events.length ? [] : events.map(e => e.id)
    );
  };

  const handleBulkAction = async (action: string) => {
    console.log("Ação em lote:", action, selectedEvents);
  };

  const handleExport = () => {
    console.log("Exportar eventos:", selectedEvents);
  };

  const handleSort = (field: string, direction: "asc" | "desc") => {
    setSortField(field);
    setSortDirection(direction);
  };

  const handleSaveFilter = (name: string, filterData: any) => {
    console.log("Salvar filtro:", name, filterData);
  };

  const handleLoadFilter = (filterData: any) => {
    setFilters(filterData);
  };

  const handleDeleteFilter = (filterId: string) => {
    console.log("Deletar filtro:", filterId);
  };

  const renderEventsView = () => {
    if (isLoading) {
      return <Loader />;
    }

    switch (viewMode) {
      case "cards":
        return (
          <EventsCardsView
            events={events}
            selectedEvents={selectedEvents}
            onEventSelect={handleEventSelect}
            onEdit={handleEdit}
            onView={handleView}
            onDuplicate={handleDuplicate}
            onDelete={deleteEvent}
            onAnalytics={handleAnalytics}
            onToggleStatus={handleToggleStatus}
          />
        );
      case "timeline":
        return (
          <EventsTimelineView
            events={events}
            onView={handleView}
            onEdit={handleEdit}
          />
        );
      case "calendar":
        return (
          <EventsCalendarView
            events={events}
            onView={handleView}
            onEdit={handleEdit}
          />
        );
      case "analytics":
        return (
          <EventsAnalyticsView
            events={events}
          />
        );
      default:
        return null;
    }
  };

  const activeEvents = events.filter(e => e.status === 'ACTIVE' || e.status === 'SCHEDULED').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Navegação */}
      <div className="flex items-center justify-between">
        <BackToDashboard variant="back" />
        <div className="text-sm text-gray-500">
          {events.length} eventos exibidos
        </div>
      </div>

      <EventsManagementHeader 
        totalEvents={events.length}
        activeEvents={activeEvents}
        onCreateNew={() => navigate('/admin/create-event')}
      />

      {/* Filtros Básicos */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <input
          type="text"
          placeholder="Buscar eventos..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Seletor de Visualização Simplificado */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-4 py-2 rounded ${viewMode === "cards" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`px-4 py-2 rounded ${viewMode === "timeline" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              Linha do Tempo
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {selectedEvents.length} selecionados
          </div>
        </div>
      </div>

      {/* Visualização dos Eventos */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {renderEventsView()}
      </div>
    </div>
  );
}
