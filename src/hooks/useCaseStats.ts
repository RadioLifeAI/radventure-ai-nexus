
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CaseStats {
  specialty: string;
  count: number;
  modality?: string;
}

interface SpecialtyInfo {
  id: number;
  name: string;
  caseCount: number;
}

export function useCaseStats() {
  const [specialties, setSpecialties] = useState<SpecialtyInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCaseStats() {
      try {
        // Buscar especialidades médicas disponíveis
        const { data: specialtiesData, error: specialtiesError } = await supabase
          .from('medical_specialties')
          .select('id, name');

        if (specialtiesError) {
          console.error('Error fetching specialties:', specialtiesError);
          return;
        }

        // Para cada especialidade, contar casos disponíveis
        const specialtyStats = await Promise.all(
          (specialtiesData || []).map(async (specialty) => {
            const { count } = await supabase
              .from('medical_cases')
              .select('id', { count: 'exact' })
              .eq('category_id', specialty.id);

            return {
              id: specialty.id,
              name: specialty.name,
              caseCount: count || 0
            };
          })
        );

        // Filtrar apenas especialidades com casos disponíveis
        const availableSpecialties = specialtyStats.filter(s => s.caseCount > 0);
        setSpecialties(availableSpecialties);
      } catch (error) {
        console.error('Error fetching case statistics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCaseStats();
  }, []);

  return { specialties, loading };
}
