
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
import { useEventsManagement } from "./hooks/useEventsManagement";
import { Loader } from "@/components/Loader";

export default function EventsManagement() {
  const navigate = useNavigate();
  const {
    events,
    totalEvents,
    loading,
    selectedEvents,
    filters,
    setFilters,
    savedFilters,
    handleSaveFilter,
    handleLoadFilter,
    handleDeleteFilter,
    viewMode,
    setViewMode,
    sortField,
    sortDirection,
    handleSort,
    handleEventSelect,
    handleSelectAll,
    handleBulkAction,
    handleExport,
    deleteEvent,
    refetch
  } = useEventsManagement();

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleEdit = (eventId: string) => {
    navigate(`/admin/events/${eventId}/edit`);
  };

  const handleView = (eventId: string) => {
    setSelectedEventId(eventId);
    // Em futuras implementações, abrir modal de visualização rica
    console.log("Ver evento:", eventId);
  };

  const handleDuplicate = (eventId: string) => {
    // Em futuras implementações, abrir modal de duplicação inteligente
    console.log("Duplicar evento:", eventId);
  };

  const handleAnalytics = (eventId: string) => {
    // Em futuras implementações, abrir modal de analytics avançado
    console.log("Analytics do evento:", eventId);
  };

  const handleToggleStatus = async (eventId: string) => {
    // Em futuras implementações, alternar status do evento
    console.log("Alternar status do evento:", eventId);
  };

  const renderEventsView = () => {
    if (loading) {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="space-y-6 animate-fade-in p-6">
        {/* Navegação */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <BackToDashboard variant="back" />
          <div className="text-sm text-gray-600">
            {events.length} de {totalEvents} eventos exibidos
          </div>
        </div>

        <EventsManagementHeader 
          totalEvents={totalEvents}
          activeEvents={activeEvents}
          onCreateNew={() => navigate('/admin/create-event')}
        />

        {/* Filtros Avançados */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <EventsAdvancedFilters
            filters={filters}
            onFiltersChange={setFilters}
            savedFilters={savedFilters}
            onSaveFilter={handleSaveFilter}
            onLoadFilter={handleLoadFilter}
            onDeleteFilter={handleDeleteFilter}
            totalEvents={totalEvents}
            filteredEvents={events.length}
          />
        </div>

        {/* Seletor de Visualização */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <EventsViewSelector
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            selectedCount={selectedEvents.length}
            totalCount={events.length}
            onBulkAction={handleBulkAction}
            onExport={handleExport}
          />
        </div>

        {/* Visualização dos Eventos */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            {renderEventsView()}
          </div>
        </div>
      </div>
    </div>
  );
}
