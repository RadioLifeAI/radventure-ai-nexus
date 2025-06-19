
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
  // Novos filtros semânticos
  context?: string;
  rarity?: string;
  targetAudience?: string;
  educationalValue?: string;
  estimatedTime?: string;
  urgency?: string;
  aiQuery?: string;
}

export function useJourneySearch(filters: JourneyFilters) {
  return useQuery({
    queryKey: ['journey-search', filters],
    queryFn: async () => {
      let query = supabase
        .from('medical_cases')
        .select('id, title, specialty, modality, subtype, difficulty_level, patient_age, patient_gender, symptoms_duration, description, findings, case_context, educational_value, estimated_time, urgency_level')
        .order('difficulty_level', { ascending: true })
        .order('created_at', { ascending: true });

      // Filtros básicos existentes
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

      // Novos filtros semânticos
      if (filters.context && filters.context !== '') {
        query = query.eq('case_context', filters.context);
      }

      if (filters.urgency && filters.urgency !== '') {
        query = query.eq('urgency_level', filters.urgency);
      }

      if (filters.educationalValue && filters.educationalValue !== '') {
        query = query.eq('educational_value', filters.educationalValue);
      }

      if (filters.estimatedTime && filters.estimatedTime !== '') {
        query = query.eq('estimated_time', filters.estimatedTime);
      }

      // Filtro por público-alvo baseado na dificuldade
      if (filters.targetAudience && filters.targetAudience !== '') {
        const audienceMap: Record<string, number[]> = {
          'graduation': [1, 2],
          'r1': [2, 3],
          'r2': [3, 4],
          'r3': [4, 5],
          'specialist': [4, 5]
        };
        
        const difficultyRange = audienceMap[filters.targetAudience];
        if (difficultyRange) {
          query = query.gte('difficulty_level', difficultyRange[0])
                      .lte('difficulty_level', difficultyRange[1]);
        }
      }

      // Filtro por raridade (simulado baseado na frequência na base)
      if (filters.rarity && filters.rarity !== '') {
        const rarityMap: Record<string, string> = {
          'common': '>10',
          'uncommon': '1-10',
          'rare': '<1',
          'very-rare': '<0.1'
        };
        
        // Implementar lógica de raridade quando o campo estiver disponível
        // Por enquanto, usar uma aproximação baseada na dificuldade
        if (filters.rarity === 'rare' || filters.rarity === 'very-rare') {
          query = query.gte('difficulty_level', 4);
        }
      }

      // Busca por texto em múltiplos campos (incluindo IA query)
      const searchQuery = filters.aiQuery || filters.searchTerm;
      if (searchQuery && searchQuery.trim() !== '') {
        const searchTerm = searchQuery.trim();
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,findings.ilike.%${searchTerm}%,specialty.ilike.%${searchTerm}%,modality.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Remover duplicatas por título
      const uniqueCases = data?.reduce((acc, current) => {
        const existingCase = acc.find(item => item.title === current.title);
        if (!existingCase) {
          acc.push(current);
        }
        return acc;
      }, [] as typeof data) || [];

      // Aplicar filtros adicionais que não estão no banco
      let filteredCases = uniqueCases;

      // Filtro por tempo estimado (simulado)
      if (filters.estimatedTime && filters.estimatedTime !== '') {
        const timeMap: Record<string, (level: number) => boolean> = {
          'fast': (level) => level <= 2,
          'medium': (level) => level === 3,
          'long': (level) => level >= 4
        };
        
        const timeFilter = timeMap[filters.estimatedTime];
        if (timeFilter) {
          filteredCases = filteredCases.filter(case_item => 
            timeFilter(case_item.difficulty_level || 1)
          );
        }
      }

      return filteredCases;
    },
    enabled: true
  });
}
