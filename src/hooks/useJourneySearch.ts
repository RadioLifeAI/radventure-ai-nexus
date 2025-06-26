
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useJourneySearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJourneys, setFilteredJourneys] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJourneys = async () => {
      if (!searchTerm.trim()) {
        setFilteredJourneys([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_journeys')
          .select('*')
          .ilike('title', `%${searchTerm}%`)
          .limit(10);

        if (error) throw error;
        setFilteredJourneys(data || []);
      } catch (error) {
        console.error('Error searching journeys:', error);
        setFilteredJourneys([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchJourneys, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredJourneys,
    loading
  };
}
