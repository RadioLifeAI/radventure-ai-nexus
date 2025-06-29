
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { HeaderNav } from "@/components/HeaderNav";
import { AdvancedCasesDashboard } from "./advanced/AdvancedCasesDashboard";
import { CaseFilters } from "./CaseFilters";
import { CasesGrid } from "./CasesGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  Filter, 
  Brain, 
  Sparkles,
  Zap,
  Target,
  ArrowLeft
} from "lucide-react";
import { useCasesData } from "@/hooks/useCasesData";

export function CasesCentralAdvanced() {
  const { casesStats, userProgress, isLoading } = useCasesData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Ler parâmetros da URL e definir filtros iniciais
  const [filters, setFilters] = useState(() => {
    const specialtyFromUrl = searchParams.get('specialty') || '';
    return {
      specialty: specialtyFromUrl,
      modality: "",
      difficulty: "",
      searchTerm: ""
    };
  });

  // Controlar aba ativa baseado em parâmetros URL
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('specialty') ? 'explorer' : 'advanced-dashboard';
  });

  // Atualizar filtros quando URL mudar
  useEffect(() => {
    const specialtyFromUrl = searchParams.get('specialty') || '';
    if (specialtyFromUrl && specialtyFromUrl !== filters.specialty) {
      setFilters(prev => ({
        ...prev,
        specialty: specialtyFromUrl
      }));
      setActiveTab('explorer');
    }
  }, [searchParams, filters.specialty]);

  const filtersStats = casesStats ? {
    total: casesStats.totalCases,
    bySpecialty: casesStats.bySpecialty
  } : { total: 0, bySpecialty: {} };

  // Função para limpar filtros e voltar ao dashboard
  const handleBackToDashboard = () => {
    setFilters({
      specialty: "",
      modality: "",
      difficulty: "",
      searchTerm: ""
    });
    setActiveTab('advanced-dashboard');
    navigate('/app/casos', { replace: true });
  };//... keep existing code (rest of the component logic)

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 text-gray-900">
      <HeaderNav />
      
      <main className="flex-1 w-full px-2 sm:px-4 lg:px-8 xl:px-16 py-4 sm:py-8 overflow-x-hidden">
        <div className="w-full space-y-4 sm:space-y-8">
          {/* Header com indicador de filtro ativo */}
          <div className="text-center px-2">
            {filters.specialty && (
              <div className="mb-4 flex flex-col sm:flex-row items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToDashboard}
                  className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 border border-blue-300/60 bg-white shadow-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar ao Dashboard
                </Button>
                <div className="bg-blue-100 rounded-full px-4 py-2 border border-blue-300/60 shadow-sm">
                  <span className="text-blue-800 text-sm font-medium">
                    Filtrado por: <strong className="text-blue-900">{filters.specialty}</strong>
                  </span>
                </div>
              </div>
            )}
            
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent mb-2 sm:mb-4">
              Central de Casos Avançada
            </h1>
            <p className="text-gray-700 text-sm sm:text-xl max-w-3xl mx-auto mb-4 sm:mb-6">
              Experiência de aprendizado revolucionária com IA, gamificação e visualizações inteligentes
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 sm:px-4 sm:py-2 border border-gray-300/60 shadow-sm">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
                <span className="text-xs sm:text-sm text-gray-800 font-medium">Powered by AI</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 sm:px-4 sm:py-2 border border-gray-300/60 shadow-sm">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                <span className="text-xs sm:text-sm text-gray-800 font-medium">Real-time Analytics</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 sm:px-4 sm:py-2 border border-gray-300/60 shadow-sm">
                <Target className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                <span className="text-xs sm:text-sm text-gray-800 font-medium">Adaptive Learning</span>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100/80 backdrop-blur-sm border border-gray-300/60 h-auto shadow-sm">
              <TabsTrigger value="advanced-dashboard" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-700 text-xs sm:text-sm p-2 sm:p-3 font-medium">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Dashboard Avançado</span>
                <span className="sm:hidden">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="explorer" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-700 text-xs sm:text-sm p-2 sm:p-3 font-medium">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Explorar Casos</span>
                <span className="sm:hidden">Explorar</span>
                {filters.specialty && (
                  <div className="ml-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                )}
              </TabsTrigger>
              <TabsTrigger value="ai-journey" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-700 text-xs sm:text-sm p-2 sm:p-3 font-medium">
                <Brain className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Jornada IA</span>
                <span className="sm:hidden">Jornada</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="advanced-dashboard" className="w-full space-y-4 sm:space-y-6">
              <AdvancedCasesDashboard />
            </TabsContent>

            <TabsContent value="explorer" className="w-full space-y-4 sm:space-y-6">
              <CaseFilters 
                filters={filters} 
                onFiltersChange={setFilters}
                stats={filtersStats}
              />
              <CasesGrid filters={filters} />
            </TabsContent>

            <TabsContent value="ai-journey" className="w-full space-y-4 sm:space-y-6">
              <Card className="bg-white border-gray-300/60 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center gap-2 text-lg sm:text-xl">
                    <Brain className="h-5 w-5 text-purple-700" />
                    Jornadas Personalizadas com IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4 sm:py-8">
                    <Brain className="h-12 w-12 sm:h-16 sm:w-16 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                      Trilhas Inteligentes de Aprendizado
                    </h3>
                    <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base px-2">
                      Nossa IA cria trilhas personalizadas baseadas no seu perfil, objetivos e performance
                    </p>
                    <Button 
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white w-full sm:w-auto shadow-sm"
                      onClick={() => navigate('/app/criar-jornada')}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Criar Jornada Inteligente
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
