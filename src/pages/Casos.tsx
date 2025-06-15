
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HeaderNav } from "@/components/HeaderNav";
import { CasesGrid } from "@/components/cases/CasesGrid";
import { CaseFilters } from "@/components/cases/CaseFilters";
import { Loader } from "@/components/Loader";
import { Brain, BookOpen } from "lucide-react";

export default function Casos() {
  const [filters, setFilters] = useState({
    specialty: "",
    modality: "",
    difficulty: "",
    searchTerm: ""
  });

  const { data: cases, isLoading } = useQuery({
    queryKey: ['medical-cases', filters],
    queryFn: async () => {
      let query = supabase
        .from('medical_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.specialty) {
        query = query.eq('specialty', filters.specialty);
      }
      if (filters.modality) {
        query = query.eq('modality', filters.modality);
      }
      if (filters.difficulty) {
        query = query.eq('difficulty_level', filters.difficulty);
      }
      if (filters.searchTerm) {
        query = query.ilike('title', `%${filters.searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['cases-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_cases')
        .select('specialty, modality, difficulty_level');
      
      if (error) throw error;
      
      const specialtyCount = data?.reduce((acc: any, case_: any) => {
        acc[case_.specialty] = (acc[case_.specialty] || 0) + 1;
        return acc;
      }, {}) || {};

      return {
        total: data?.length || 0,
        bySpecialty: specialtyCount
      };
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="text-cyan-400" size={40} />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Central de Casos
            </h1>
          </div>
          <p className="text-cyan-100 text-lg">
            Resolva casos reais, aprenda e suba de nível!
          </p>
          
          {stats && (
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <BookOpen size={20} className="text-yellow-400" />
                <span className="text-yellow-400 font-semibold">{stats.total} casos disponíveis</span>
              </div>
            </div>
          )}
        </div>

        <CaseFilters filters={filters} onFiltersChange={setFilters} stats={stats} />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : (
          <CasesGrid cases={cases || []} />
        )}
      </main>
    </div>
  );
}
