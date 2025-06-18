
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CaseCard } from "./CaseCard";
import { CaseCardSkeleton } from "@/components/ui/skeleton-loader";

type Case = {
  id: string;
  title: string;
  specialty: string;
  modality: string;
  difficulty_level: number;
  points: number;
  image_url: any;
  created_at: string;
};

type Props = {
  filters: {
    specialty: string;
    modality: string;
    difficulty: string;
    searchTerm: string;
  };
};

export function CasesGrid({ filters }: Props) {
  const { data: cases, isLoading } = useQuery({
    queryKey: ['filtered-cases', filters],
    queryFn: async () => {
      let query = supabase
        .from('medical_cases')
        .select('id, title, specialty, modality, difficulty_level, points, image_url, created_at')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.specialty) {
        query = query.eq('specialty', filters.specialty);
      }
      if (filters.modality) {
        query = query.eq('modality', filters.modality);
      }
      if (filters.difficulty) {
        query = query.eq('difficulty_level', parseInt(filters.difficulty));
      }
      if (filters.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CaseCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!cases || cases.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-white mb-2">Nenhum caso encontrado</h3>
        <p className="text-cyan-100">
          {Object.values(filters).some(f => f) 
            ? "Tente ajustar os filtros ou explore outras especialidades" 
            : "Os casos estão sendo preparados para esta especialidade"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {cases.map((case_) => (
        <CaseCard key={case_.id} case={case_} />
      ))}
    </div>
  );
}
