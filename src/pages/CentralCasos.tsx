
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HeaderNav } from "@/components/HeaderNav";
import { BackToDashboard } from "@/components/navigation/BackToDashboard";
import { CasesGrid } from "@/components/cases/CasesGrid";
import { CaseFilters } from "@/components/cases/CaseFilters";
import { UserStatsPanel } from "@/components/central-casos/UserStatsPanel";
import { UserProgressChart } from "@/components/central-casos/UserProgressChart";
import { AchievementsList } from "@/components/central-casos/AchievementsList";
import { Loader } from "@/components/Loader";
import { Brain, BookOpen, Trophy, TrendingUp, Target, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CentralCasos() {
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
        const difficultyLevel = parseInt(filters.difficulty);
        if (!isNaN(difficultyLevel)) {
          query = query.eq('difficulty_level', difficultyLevel);
        }
      }
      if (filters.searchTerm) {
        query = query.ilike('title', `%${filters.searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: history, error } = await supabase
        .from('user_case_history')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const totalCases = history?.length || 0;
      const correctCases = history?.filter(h => h.is_correct).length || 0;
      const totalPoints = history?.reduce((sum, h) => sum + (h.points || 0), 0) || 0;
      const accuracy = totalCases > 0 ? Math.round((correctCases / totalCases) * 100) : 0;

      return {
        totalCases,
        correctCases,
        totalPoints,
        accuracy,
        history: history || []
      };
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header com navegação */}
        <div className="flex items-center justify-between mb-6">
          <BackToDashboard variant="back" />
          <div className="text-sm text-cyan-200">
            Central de Casos Avançada
          </div>
        </div>

        {/* Título principal */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="text-cyan-400" size={40} />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Central de Casos
            </h1>
          </div>
          <p className="text-cyan-100 text-lg">
            Resolva casos, acompanhe seu progresso e conquiste achievements!
          </p>
        </div>

        {/* Tabs principais */}
        <Tabs defaultValue="cases" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="cases" className="flex items-center gap-2">
              <BookOpen size={16} />
              Casos
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <TrendingUp size={16} />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <Target size={16} />
              Progresso
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award size={16} />
              Conquistas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="space-y-6 mt-6">
            <CaseFilters 
              filters={filters} 
              onFiltersChange={setFilters} 
              showAdvanced={true}
            />

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader />
              </div>
            ) : (
              <CasesGrid cases={cases || []} />
            )}
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <UserStatsPanel userStats={userStats} />
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <UserProgressChart userStats={userStats} />
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <AchievementsList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
