
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
    },
    // Cache mais agressivo para melhor performance
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000 // 10 minutos
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
            ? `Nenhum caso encontrado para ${filters.specialty || 'os filtros selecionados'}. Tente ajustar os filtros.`
            : "Os casos estão sendo preparados para esta especialidade"
          }
        </p>
        {filters.specialty && (
          <p className="text-cyan-200 text-sm mt-2">
            Casos para <strong>{filters.specialty}</strong> em desenvolvimento
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Contador de resultados */}
      {cases.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="text-cyan-100 text-sm">
            {cases.length} caso{cases.length !== 1 ? 's' : ''} encontrado{cases.length !== 1 ? 's' : ''}
            {filters.specialty && (
              <span className="ml-2 text-cyan-200">
                em <strong>{filters.specialty}</strong>
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Grid de casos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((case_) => (
          <CaseCard key={case_.id} case={case_} />
        ))}
      </div>
    </div>
  );
}
