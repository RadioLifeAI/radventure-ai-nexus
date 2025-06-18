
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ModalityWithSubtypes {
  id: number;
  name: string;
  subtypes: Array<{ id: number; name: string; }>;
}

export interface UnifiedFormDataSource {
  specialties: Array<{ id: number; name: string; }>;
  modalities: Array<ModalityWithSubtypes>;
  difficulties: Array<{ id: number; level: number; description: string | null; }>;
  isLoading: boolean;
}

export function useUnifiedFormDataSource(): UnifiedFormDataSource {
  // Buscar especialidades do banco
  const { data: specialties, isLoading: loadingSpecialties } = useQuery({
    queryKey: ['unified-specialties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_specialties')
        .select('id, name')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Buscar dificuldades do banco
  const { data: difficulties, isLoading: loadingDifficulties } = useQuery({
    queryKey: ['unified-difficulties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('difficulties')
        .select('id, level, description')
        .order('level', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Buscar modalidades com subtipos do banco
  const { data: modalities, isLoading: loadingModalities } = useQuery({
    queryKey: ['unified-modalities-with-subtypes'],
    queryFn: async () => {
      // Buscar modalidades
      const { data: modalitiesData, error: modalitiesError } = await supabase
        .from('imaging_modalities')
        .select('id, name')
        .order('name', { ascending: true });
      
      if (modalitiesError) throw modalitiesError;

      // Buscar subtipos
      const { data: subtypesData, error: subtypesError } = await supabase
        .from('imaging_subtypes')
        .select('id, name, modality_name')
        .order('name', { ascending: true });
      
      if (subtypesError) throw subtypesError;

      // Organizar dados: agrupar subtipos por modalidade
      const modalitiesWithSubtypes: ModalityWithSubtypes[] = (modalitiesData || []).map(modality => ({
        id: modality.id,
        name: modality.name,
        subtypes: (subtypesData || [])
          .filter(subtype => subtype.modality_name === modality.name)
          .map(subtype => ({
            id: subtype.id,
            name: subtype.name
          }))
      }));

      return modalitiesWithSubtypes;
    }
  });

  return {
    specialties: specialties || [],
    modalities: modalities || [],
    difficulties: difficulties || [],
    isLoading: loadingSpecialties || loadingDifficulties || loadingModalities
  };
}
