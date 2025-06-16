
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CasesGrid } from "@/components/cases/CasesGrid";
import { CaseFilters } from "@/components/cases/CaseFilters";
import { SpecialtyQuickAccess } from "@/components/cases/SpecialtyQuickAccess";
import { BackButton } from "@/components/navigation/BackButton";
import { Loader } from "@/components/Loader";
import { AlertCircle, BookOpen } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CaseFiltersType {
  specialty?: string;
  difficulty?: number;
  modality?: string;
}

export default function Casos() {
  const [filters, setFilters] = useState<CaseFiltersType>({});

  const { data: cases, isLoading, error } = useQuery({
    queryKey: ['medical-cases', filters],
    queryFn: async () => {
      console.log('Fetching cases with filters:', filters);
      
      let query = supabase
        .from('medical_cases')
        .select(`
          *,
          category:medical_specialties(name),
          difficulty:difficulties(level, description)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.specialty) {
        query = query.eq('specialty', filters.specialty);
      }
      
      if (filters.difficulty) {
        query = query.eq('difficulty_level', filters.difficulty);
      }
      
      if (filters.modality) {
        query = query.eq('modality', filters.modality);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching cases:', error);
        throw error;
      }
      
      console.log('Fetched cases:', data);
      return data || [];
    },
  });

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar casos médicos. Tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <BackButton to="/dashboard" className="text-cyan-100 hover:text-white mb-4" />
          <div className="flex items-center gap-3 mb-2">
            <BookOpen size={32} />
            <h1 className="text-3xl font-bold">Casos Médicos</h1>
          </div>
          <p className="text-cyan-100">
            Pratique com casos reais e aprimore suas habilidades diagnósticas
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Quick Access Cards */}
        <SpecialtyQuickAccess />

        {/* Filters */}
        <div className="mb-6">
          <CaseFilters onFiltersChange={setFilters} />
        </div>

        {/* Cases Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Casos Disponíveis ({cases?.length || 0})
            </h2>
          </div>
          
          {cases && cases.length > 0 ? (
            <CasesGrid cases={cases} />
          ) : (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum caso encontrado
              </h3>
              <p className="text-gray-600">
                Ajuste os filtros ou tente novamente mais tarde.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
