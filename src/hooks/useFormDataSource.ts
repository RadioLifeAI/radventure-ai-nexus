
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { modalitiesSubtypes } from "@/pages/admin/utils/modalitiesSubtypes";

export interface FormDataSource {
  specialties: Array<{ id: number; name: string; }>;
  modalities: Array<{ value: string; label: string; subtypes: Array<{ value: string; label: string; }>; }>;
  difficulties: Array<{ id: number; level: number; description: string | null; }>;
  isLoading: boolean;
}

export function useFormDataSource(): FormDataSource {
  // Buscar especialidades do banco (como no formulário)
  const { data: specialties, isLoading: loadingSpecialties } = useQuery({
    queryKey: ['form-specialties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_specialties')
        .select('id, name')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Buscar dificuldades do banco (como no formulário)
  const { data: difficulties, isLoading: loadingDifficulties } = useQuery({
    queryKey: ['form-difficulties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('difficulties')
        .select('id, level, description')
        .order('level', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Modalidades: usar a constante hardcoded do formulário (FONTE ÚNICA)
  const modalities = modalitiesSubtypes;

  return {
    specialties: specialties || [],
    modalities,
    difficulties: difficulties || [],
    isLoading: loadingSpecialties || loadingDifficulties
  };
}
