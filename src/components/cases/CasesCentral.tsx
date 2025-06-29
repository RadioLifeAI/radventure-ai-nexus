
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Trophy, 
  Brain, 
  Zap,
  BarChart3,
  Calendar,
  Filter,
  Play
} from "lucide-react";
import { CaseFilters } from "./CaseFilters";
import { CasesGrid } from "./CasesGrid";
import { CaseNavigation } from "./CaseNavigation";
import { CreateJourneyModal } from "@/components/journey/CreateJourneyModal";
import { Skeleton } from "@/components/ui/skeleton-loader";
import { useCasesData } from "@/hooks/useCasesData";
import { useCaseNavigation } from "@/hooks/useCaseNavigation";

export function CasesCentral() {
  const { casesStats, userProgress, isLoading } = useCasesData();
  const [filters, setFilters] = useState({
    specialty: "",
    modality: "",
    difficulty: "",
    searchTerm: ""
  });
  const [showJourneyModal, setShowJourneyModal] = useState(false);

  // Convert filters for navigation hook
  const navigationFilters = {
    specialty: filters.specialty || undefined,
    modality: filters.modality || undefined,
    difficulty: filters.difficulty ? parseInt(filters.difficulty) : undefined
  };

  // Navegação inteligente entre casos
  const navigation = useCaseNavigation(navigationFilters);

  const { data: recentCases, isLoading: recentLoading } = useQuery({
    queryKey: ['recent-cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_cases')
        .select('id, title, specialty, difficulty_level, created_at, points')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }: any) => (
    <Card className="bg-white/90 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
          <div className={`p-3 bg-${color}-50 rounded-full border border-${color}-200`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Transform casesStats to match CaseFilters expected format
  const filtersStats = casesStats ? {
    total: casesStats.totalCases,
    bySpecialty: casesStats.bySpecialty
  } : { total: 0, bySpecialty: {} };

  return (
    <div className="space-y-8">
      {/* Header com estatísticas principais */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Central de Casos Avançada
        </h1>
        <p className="text-gray-600 text-lg">
          Acompanhe seu progresso e explore casos médicos organizados por especialidade
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={Target}
          title="Cases Disponíveis"
          value={casesStats?.totalCases || 0}
          subtitle="Total no sistema"
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          title="Casos Resolvidos"
          value={userProgress?.totalAttempts || 0}
          subtitle={`${userProgress?.accuracy || 0}% de precisão`}
          color="green"
        />
        <StatCard
          icon={Trophy}
          title="Pontos Totais"
          value={userProgress?.totalPoints || 0}
          subtitle="RadCoins ganhas"
          color="yellow"
        />
        <StatCard
          icon={Brain}
          title="Especialidades"
          value={Object.keys(casesStats?.bySpecialty || {}).length}
          subtitle="Áreas disponíveis"
          color="purple"
        />
      </div>

      <Tabs defaultValue="explorer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm">
          <TabsTrigger value="explorer" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <Filter className="h-4 w-4 mr-2" />
            Explorar
          </TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <BarChart3 className="h-4 w-4 mr-2" />
            Progresso
          </TabsTrigger>
          <TabsTrigger value="recent" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <Calendar className="h-4 w-4 mr-2" />
            Recentes
          </TabsTrigger>
          <TabsTrigger value="journey" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <Zap className="h-4 w-4 mr-2" />
            Jornada
          </TabsTrigger>
        </TabsList>

        <TabsContent value="explorer" className="space-y-6">
          <CaseFilters 
            filters={filters} 
            onFiltersChange={setFilters}
            stats={filtersStats}
          />
          
          {/* Navegação entre casos */}
          {navigation.totalCases > 0 && (
            <CaseNavigation
              currentIndex={navigation.currentIndex}
              totalCases={navigation.totalCases}
              hasNext={navigation.hasNext}
              hasPrevious={navigation.hasPrevious}
              onNext={navigation.goToNext}
              onPrevious={navigation.goToPrevious}
              currentCase={navigation.currentCase}
            />
          )}
          
          <CasesGrid filters={filters} />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progresso por Especialidade */}
            <Card className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Progresso por Especialidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(userProgress?.bySpecialty || {}).map(([specialty, stats]: [string, any]) => (
                  <div key={specialty} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-800 font-medium">{specialty}</span>
                      <span className="text-blue-600">
                        {stats.correct}/{stats.total} ({Math.round((stats.correct / stats.total) * 100)}%)
                      </span>
                    </div>
                    <Progress 
                      value={(stats.correct / stats.total) * 100} 
                      className="h-2 bg-gray-200"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Conquistas */}
            <Card className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Conquistas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                  <p className="text-gray-600">Sistema de conquistas em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-800 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Cases Adicionados Recentemente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentCases?.map((case_) => (
                  <div key={case_.id} className="bg-white rounded-lg p-4 hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-2">{case_.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {case_.specialty}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-600 bg-yellow-50">
                        {case_.points} pts
                      </Badge>
                    </div>
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                      <Play className="h-4 w-4 mr-2" />
                      Resolver
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journey" className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-800 flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                Crie sua Jornada Personalizada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Trilhas de Aprendizado Inteligentes
                </h3>
                <p className="text-gray-600 mb-6">
                  IA personalizada criará trilhas baseadas no seu perfil e objetivos
                </p>
                <Button 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                  onClick={() => setShowJourneyModal(true)}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Criar Jornada com IA
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateJourneyModal
        isOpen={showJourneyModal}
        onClose={() => setShowJourneyModal(false)}
      />
    </div>
  );
}
