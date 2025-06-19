
import { useState, useCallback } from "react";
import { EventType } from "./useActiveEvents";

export interface EventFilters {
  search: string;
  status: string[];
  eventType: string[];
  specialty: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  prizeRange: {
    min?: number;
    max?: number;
  };
}

export function useEventFilters() {
  const [filters, setFilters] = useState<EventFilters>({
    search: "",
    status: [],
    eventType: [],
    specialty: [],
    dateRange: {},
    prizeRange: {}
  });

  const applyFilters = useCallback((events: EventType[]) => {
    return events.filter(event => {
      // Filtro de busca
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          event.name.toLowerCase().includes(searchLower) ||
          (event.description && event.description.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Filtro de status
      if (filters.status.length > 0) {
        if (!filters.status.includes(event.status)) return false;
      }

      // Filtro de tipo de evento
      if (filters.eventType.length > 0) {
        if (!filters.eventType.includes(event.event_type || 'quiz_timed')) return false;
      }

      // Filtro de data
      if (filters.dateRange.start) {
        if (new Date(event.scheduled_start) < new Date(filters.dateRange.start)) return false;
      }
      if (filters.dateRange.end) {
        if (new Date(event.scheduled_end) > new Date(filters.dateRange.end)) return false;
      }

      // Filtro de prêmio
      if (filters.prizeRange.min !== undefined) {
        if (event.prize_radcoins < filters.prizeRange.min) return false;
      }
      if (filters.prizeRange.max !== undefined) {
        if (event.prize_radcoins > filters.prizeRange.max) return false;
      }

      return true;
    });
  }, [filters]);

  const updateFilter = useCallback((key: keyof EventFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const updateArrayFilter = useCallback((key: keyof EventFilters, value: string) => {
    setFilters(prev => {
      const currentArray = prev[key] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [key]: newArray
      };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      status: [],
      eventType: [],
      specialty: [],
      dateRange: {},
      prizeRange: {}
    });
  }, []);

  const hasActiveFilters = useCallback(() => {
    return filters.search !== "" ||
           filters.status.length > 0 ||
           filters.eventType.length > 0 ||
           filters.specialty.length > 0 ||
           Object.keys(filters.dateRange).length > 0 ||
           Object.keys(filters.prizeRange).length > 0;
  }, [filters]);

  return {
    filters,
    applyFilters,
    updateFilter,
    updateArrayFilter,
    clearFilters,
    hasActiveFilters: hasActiveFilters()
  };
}
