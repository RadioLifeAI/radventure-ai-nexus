
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
  // Filtros semânticos - campos reais do banco
  context?: string; // mapeia para exam_context
  rarity?: string; // mapeia para case_rarity
  targetAudience?: string; // mapeia para target_audience
  educationalValue?: string; // usa educational_value real
  estimatedTime?: string; // mapeia para estimated_solve_time
  urgency?: string; // simulado baseado em outros campos
  aiQuery?: string;
}

export function useJourneySearch(filters: JourneyFilters) {
  return useQuery({
    queryKey: ['journey-search', filters],
    queryFn: async () => {
      let query = supabase
        .from('medical_cases')
        .select('id, title, specialty, modality, subtype, difficulty_level, patient_age, patient_gender, symptoms_duration, description, findings, exam_context, educational_value, estimated_solve_time, case_rarity, target_audience, diagnosis_internal')
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
        // Converter string para number para difficulty_level
        const difficultyNumber = parseInt(filters.difficulty);
        if (!isNaN(difficultyNumber)) {
          query = query.eq('difficulty_level', difficultyNumber);
        }
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

      // Filtros semânticos usando campos reais do banco
      if (filters.context && filters.context !== '') {
        query = query.eq('exam_context', filters.context);
      }

      if (filters.rarity && filters.rarity !== '') {
        query = query.eq('case_rarity', filters.rarity);
      }

      if (filters.educationalValue && filters.educationalValue !== '') {
        query = query.eq('educational_value', filters.educationalValue);
      }

      if (filters.estimatedTime && filters.estimatedTime !== '') {
        // Mapear valores textuais para números ou usar números diretos
        let timeValue: number | null = null;
        
        if (filters.estimatedTime === 'fast') {
          timeValue = 10; // < 10 minutos
        } else if (filters.estimatedTime === 'medium') {
          timeValue = 15; // 10-20 minutos
        } else if (filters.estimatedTime === 'long') {
          timeValue = 25; // > 20 minutos
        } else {
          // Tentar converter string para número
          const timeNumber = parseInt(filters.estimatedTime);
          if (!isNaN(timeNumber)) {
            timeValue = timeNumber;
          }
        }
        
        if (timeValue !== null) {
          query = query.eq('estimated_solve_time', timeValue);
        }
      }

      // Filtro por público-alvo usando array real
      if (filters.targetAudience && filters.targetAudience !== '') {
        query = query.contains('target_audience', [filters.targetAudience]);
      }

      // Busca por texto em múltiplos campos incluindo diagnosis_internal
      const searchQuery = filters.aiQuery || filters.searchTerm;
      if (searchQuery && searchQuery.trim() !== '') {
        const searchTerm = searchQuery.trim();
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,findings.ilike.%${searchTerm}%,specialty.ilike.%${searchTerm}%,modality.ilike.%${searchTerm}%,diagnosis_internal.ilike.%${searchTerm}%`);
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

      // Aplicar filtros adicionais simulados
      let filteredCases = uniqueCases;

      // Filtro por urgência simulado (baseado em exam_context e difficulty_level)
      if (filters.urgency && filters.urgency !== '') {
        filteredCases = filteredCases.filter(case_item => {
          const isEmergency = case_item.exam_context === 'emergency' || case_item.exam_context === 'icu';
          const isHighDifficulty = (case_item.difficulty_level || 1) >= 3;
          
          if (filters.urgency === 'high') {
            return isEmergency || isHighDifficulty;
          } else if (filters.urgency === 'medium') {
            return !isEmergency && (case_item.difficulty_level || 1) === 2;
          } else if (filters.urgency === 'low') {
            return !isEmergency && (case_item.difficulty_level || 1) === 1;
          }
          return true;
        });
      }

      return filteredCases;
    },
    enabled: true
  });
}
