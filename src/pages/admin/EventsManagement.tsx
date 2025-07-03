
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
import { toast } from "@/hooks/use-toast";

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
    toggleEventStatus,
    refetch
  } = useEventsManagement();

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleEdit = (eventId: string) => {
    navigate(`/admin/events/${eventId}/edit`);
  };

  const handleView = (eventId: string) => {
    setSelectedEventId(eventId);
    // Funcionalidade implementada nos modais das cardsView
  };

  const handleDuplicate = (eventId: string) => {
    // Funcionalidade implementada nos modais das cardsView
    refetch(); // Atualizar lista após duplicação
  };

  const handleAnalytics = (eventId: string) => {
    // Funcionalidade implementada nos modais das cardsView
  };

  const handleToggleStatus = async (eventId: string) => {
    await toggleEventStatus(eventId);
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
    <div className="space-y-6 animate-fade-in">
      {/* Navegação */}
      <div className="flex items-center justify-between">
        <BackToDashboard variant="back" />
        <div className="text-sm text-gray-500">
          {events.length} de {totalEvents} eventos exibidos
        </div>
      </div>

      <EventsManagementHeader 
        totalEvents={totalEvents}
        activeEvents={activeEvents}
        onCreateNew={() => navigate('/admin/create-event')}
      />

      {/* Filtros Avançados */}
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

      {/* Seletor de Visualização */}
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

      {/* Visualização dos Eventos */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {renderEventsView()}
      </div>
    </div>
  );
}
