
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NextCaseOptions {
  specialty?: string;
  difficulty?: number;
  excludeCurrentCase?: string;
}

export function useCaseNavigation() {
  const [loading, setLoading] = useState(false);

  const getNextCase = async (options: NextCaseOptions = {}) => {
    setLoading(true);
    try {
      let query = supabase
        .from('medical_cases')
        .select('id, title, specialty, difficulty_level')
        .limit(1);

      // Apply filters
      if (options.specialty) {
        query = query.eq('specialty', options.specialty);
      }

      if (options.difficulty) {
        query = query.eq('difficulty_level', options.difficulty);
      }

      if (options.excludeCurrentCase) {
        query = query.neq('id', options.excludeCurrentCase);
      }

      // Order randomly to get different cases each time
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching next case:', error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Unexpected error getting next case:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const navigateToNextCase = async (currentCaseId?: string) => {
    const nextCase = await getNextCase({ 
      excludeCurrentCase: currentCaseId 
    });
    
    if (nextCase) {
      window.location.href = `/caso/${nextCase.id}`;
    } else {
      // If no next case, redirect to cases page
      window.location.href = '/casos';
    }
  };

  return {
    getNextCase,
    navigateToNextCase,
    loading
  };
}
