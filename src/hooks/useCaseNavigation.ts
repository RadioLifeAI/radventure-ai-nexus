
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NavigationFilters {
  specialty?: string;
  modality?: string;
  difficulty?: number;
}

export function useCaseNavigation(initialFilters: NavigationFilters = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filters, setFilters] = useState<NavigationFilters>(initialFilters);

  const { data: cases, isLoading } = useQuery({
    queryKey: ['navigation-cases', filters],
    queryFn: async () => {
      let query = supabase
        .from('medical_cases')
        .select('id, title, specialty, modality, difficulty_level')
        .order('created_at', { ascending: true });

      if (filters.specialty) {
        query = query.eq('specialty', filters.specialty);
      }
      if (filters.modality) {
        query = query.eq('modality', filters.modality);
      }
      if (filters.difficulty) {
        query = query.eq('difficulty_level', filters.difficulty);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const currentCase = cases?.[currentIndex];
  const hasNext = currentIndex < (cases?.length || 0) - 1;
  const hasPrevious = currentIndex > 0;

  const goToNext = useCallback(() => {
    if (hasNext) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [hasNext]);

  const goToPrevious = useCallback(() => {
    if (hasPrevious) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [hasPrevious]);

  const goToCase = useCallback((index: number) => {
    if (index >= 0 && index < (cases?.length || 0)) {
      setCurrentIndex(index);
    }
  }, [cases?.length]);

  return {
    currentCase,
    currentIndex,
    totalCases: cases?.length || 0,
    hasNext,
    hasPrevious,
    goToNext,
    goToPrevious,
    goToCase,
    filters,
    setFilters,
    isLoading
  };
}
