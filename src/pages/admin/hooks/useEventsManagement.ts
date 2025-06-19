
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface EventFilters {
  search: string;
  status: string[];
  event_type: string[];
  creator: string;
  date_range: {
    start?: string;
    end?: string;
  };
  participants: {
    min?: number;
    max?: number;
  };
  prize_range: {
    min?: number;
    max?: number;
  };
}

interface SavedFilter {
  id: string;
  name: string;
  filters: EventFilters;
  is_favorite?: boolean;
}

export type EventViewMode = "cards" | "timeline" | "calendar" | "analytics";
export type EventSortField = "name" | "scheduled_start" | "prize_radcoins" | "max_participants" | "created_at";

export function useEventsManagement() {
  const [events, setEvents] = useState<any[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  
  // Estados de filtros e visualização
  const [filters, setFilters] = useState<EventFilters>({
    search: "",
    status: [],
    event_type: [],
    creator: "",
    date_range: {},
    participants: {},
    prize_range: {}
  });
  
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [viewMode, setViewMode] = useState<EventViewMode>("cards");
  const [sortField, setSortField] = useState<EventSortField>("scheduled_start");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Função para buscar eventos
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from("events").select("*");

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.status.length > 0) {
        query = query.in("status", filters.status);
      }

      if (filters.event_type.length > 0) {
        query = query.in("event_type", filters.event_type);
      }

      if (filters.date_range.start) {
        query = query.gte("scheduled_start", filters.date_range.start);
      }

      if (filters.date_range.end) {
        query = query.lte("scheduled_end", filters.date_range.end);
      }

      if (filters.participants.min !== undefined) {
        query = query.gte("max_participants", filters.participants.min);
      }

      if (filters.participants.max !== undefined) {
        query = query.lte("max_participants", filters.participants.max);
      }

      if (filters.prize_range.min !== undefined) {
        query = query.gte("prize_radcoins", filters.prize_range.min);
      }

      if (filters.prize_range.max !== undefined) {
        query = query.lte("prize_radcoins", filters.prize_range.max);
      }

      // Aplicar ordenação
      query = query.order(sortField, { ascending: sortDirection === "asc" });

      const { data, error, count } = await query;

      if (error) throw error;

      setEvents(data || []);
      setTotalEvents(count || 0);
    } catch (error: any) {
      console.error("Erro ao buscar eventos:", error);
      toast({
        title: "Erro ao carregar eventos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [filters, sortField, sortDirection]);

  // Função para salvar filtro
  const handleSaveFilter = useCallback((name: string, filterData: EventFilters) => {
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name,
      filters: filterData
    };
    setSavedFilters(prev => [...prev, newFilter]);
    toast({
      title: "Filtro salvo com sucesso!",
      description: `Filtro "${name}" foi salvo.`
    });
  }, []);

  // Função para carregar filtro
  const handleLoadFilter = useCallback((filter: SavedFilter) => {
    setFilters(filter.filters);
    toast({
      title: "Filtro carregado",
      description: `Filtro "${filter.name}" foi aplicado.`
    });
  }, []);

  // Função para deletar filtro
  const handleDeleteFilter = useCallback((filterId: string) => {
    setSavedFilters(prev => prev.filter(f => f.id !== filterId));
    toast({
      title: "Filtro removido",
      description: "Filtro foi excluído com sucesso."
    });
  }, []);

  // Função para ordenação
  const handleSort = useCallback((field: EventSortField, direction: "asc" | "desc") => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  // Função para seleção de eventos
  const handleEventSelect = useCallback((eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  }, []);

  // Função para selecionar todos
  const handleSelectAll = useCallback(() => {
    setSelectedEvents(prev => 
      prev.length === events.length ? [] : events.map(e => e.id)
    );
  }, [events]);

  // Função para ações em lote
  const handleBulkAction = useCallback(async (action: string) => {
    if (selectedEvents.length === 0) {
      toast({
        title: "Nenhum evento selecionado",
        description: "Selecione eventos para executar ações em lote.",
        variant: "destructive"
      });
      return;
    }

    try {
      switch (action) {
        case "duplicate":
          // Implementar duplicação em lote
          toast({
            title: "Duplicação em desenvolvimento",
            description: "Funcionalidade será implementada em breve."
          });
          break;
        case "archive":
          // Implementar arquivamento
          toast({
            title: "Arquivamento em desenvolvimento", 
            description: "Funcionalidade será implementada em breve."
          });
          break;
        case "delete":
          if (window.confirm(`Tem certeza que deseja excluir ${selectedEvents.length} eventos?`)) {
            const { error } = await supabase
              .from("events")
              .delete()
              .in("id", selectedEvents);
            
            if (error) throw error;
            
            setSelectedEvents([]);
            fetchEvents();
            toast({
              title: "Eventos excluídos",
              description: `${selectedEvents.length} eventos foram excluídos.`
            });
          }
          break;
      }
    } catch (error: any) {
      toast({
        title: "Erro na ação em lote",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [selectedEvents, fetchEvents]);

  // Função para exportação
  const handleExport = useCallback(async (format: string) => {
    try {
      // Implementar exportação
      toast({
        title: `Exportação ${format.toUpperCase()}`,
        description: "Funcionalidade será implementada em breve."
      });
    } catch (error: any) {
      toast({
        title: "Erro na exportação",
        description: error.message,
        variant: "destructive"
      });
    }
  }, []);

  // Função para deletar evento
  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;

      fetchEvents();
      toast({
        title: "Evento excluído",
        description: "Evento foi removido com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir evento",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [fetchEvents]);

  // Carregar eventos quando filtros ou ordenação mudarem
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
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
    refetch: fetchEvents
  };
}
