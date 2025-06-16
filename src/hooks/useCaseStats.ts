
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CaseStats {
  specialty: string;
  count: number;
}

export function useCaseStats() {
  const [stats, setStats] = useState<CaseStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCaseStats() {
      try {
        setLoading(true);
        
        // Get case counts by specialty from medical_cases table
        const { data: cases, error } = await supabase
          .from('medical_cases')
          .select('specialty')
          .not('specialty', 'is', null);

        if (error) {
          console.error('Error fetching case stats:', error);
          return;
        }

        // Count cases by specialty
        const specialtyCounts: Record<string, number> = {};
        cases?.forEach(case_ => {
          if (case_.specialty) {
            specialtyCounts[case_.specialty] = (specialtyCounts[case_.specialty] || 0) + 1;
          }
        });

        // Convert to array format
        const statsArray = Object.entries(specialtyCounts).map(([specialty, count]) => ({
          specialty,
          count
        }));

        setStats(statsArray);
      } catch (error) {
        console.error('Unexpected error fetching case stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCaseStats();
  }, []);

  return { stats, loading };
}
