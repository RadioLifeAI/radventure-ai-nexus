
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MedicalCase {
  id: string;
  title: string;
  description?: string;
  specialty?: string;
  modality?: string;
  subtype?: string;
  difficulty_level?: number;
  points?: number;
  findings?: string;
  patient_clinical_info?: string;
  patient_age?: string;
  patient_gender?: string;
  symptoms_duration?: string;
  main_question?: string;
  answer_options?: string[];
  correct_answer_index?: number;
  explanation?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  category_id?: number;
}

export function useRealMedicalCases() {
  const queryClient = useQueryClient();

  const { data: cases = [], isLoading, error, refetch } = useQuery({
    queryKey: ['real-medical-cases'],
    queryFn: async () => {
      console.log('Fetching real medical cases from Supabase...');
      
      const { data, error } = await supabase
        .from('medical_cases')
        .select(`
          *,
          medical_specialties (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching medical cases:', error);
        throw error;
      }

      console.log('Real medical cases fetched:', data?.length);
      return data as MedicalCase[];
    },
    refetchOnWindowFocus: false,
  });

  const deleteCaseMutation = useMutation({
    mutationFn: async (caseId: string) => {
      console.log('Deleting medical case:', caseId);
      
      const { error } = await supabase
        .from('medical_cases')
        .delete()
        .eq('id', caseId);

      if (error) {
        console.error('Error deleting case:', error);
        throw error;
      }

      return caseId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['real-medical-cases'] });
      toast.success('Caso médico deletado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error deleting case:', error);
      toast.error(`Erro ao deletar caso: ${error.message}`);
    }
  });

  // Stats calculation
  const casesStats = cases.length > 0 ? {
    totalCases: cases.length,
    bySpecialty: cases.reduce((acc, case_) => {
      const specialty = case_.specialty || 'Não especificado';
      acc[specialty] = (acc[specialty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byDifficulty: cases.reduce((acc, case_) => {
      const difficulty = case_.difficulty_level || 1;
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {} as Record<number, number>),
    byModality: cases.reduce((acc, case_) => {
      const modality = case_.modality || 'Não especificado';
      acc[modality] = (acc[modality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  } : null;

  return {
    cases,
    isLoading,
    error,
    refetch,
    deleteCase: deleteCaseMutation.mutate,
    isDeleting: deleteCaseMutation.isPending,
    casesStats
  };
}
