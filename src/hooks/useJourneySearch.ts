
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface JourneyFilters {
  specialty?: string;
  modality?: string;
  subtype?: string;
  difficulty?: string;
  searchTerm?: string;
  patientAge?: string;
  patientGender?: string;
  symptomsDuration?: string;
}

export function useJourneySearch(filters: JourneyFilters) {
  return useQuery({
    queryKey: ['journey-search', filters],
    queryFn: async () => {
      let query = supabase
        .from('medical_cases')
        .select('id, title, specialty, modality, subtype, difficulty_level, patient_age, patient_gender, symptoms_duration, description, findings')
        .order('difficulty_level', { ascending: true })
        .order('created_at', { ascending: true });

      // Aplicar filtros seguindo EXATAMENTE os campos do formulário
      if (filters.specialty && filters.specialty !== '') {
        query = query.eq('specialty', filters.specialty);
      }
      
      if (filters.modality && filters.modality !== '') {
        query = query.eq('modality', filters.modality);
      }
      
      if (filters.subtype && filters.subtype !== '') {
        query = query.eq('subtype', filters.subtype);
      }
      
      if (filters.difficulty && filters.difficulty !== '') {
        query = query.eq('difficulty_level', parseInt(filters.difficulty));
      }
      
      if (filters.patientAge && filters.patientAge !== '') {
        query = query.eq('patient_age', filters.patientAge);
      }
      
      if (filters.patientGender && filters.patientGender !== '') {
        query = query.eq('patient_gender', filters.patientGender);
      }
      
      if (filters.symptomsDuration && filters.symptomsDuration !== '') {
        query = query.eq('symptoms_duration', filters.symptomsDuration);
      }

      // Busca por texto em múltiplos campos
      if (filters.searchTerm && filters.searchTerm.trim() !== '') {
        const searchTerm = filters.searchTerm.trim();
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,findings.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Remover duplicatas por título (seguindo requisito)
      const uniqueCases = data?.reduce((acc, current) => {
        const existingCase = acc.find(item => item.title === current.title);
        if (!existingCase) {
          acc.push(current);
        }
        return acc;
      }, [] as typeof data) || [];

      return uniqueCases;
    },
    enabled: true
  });
}
