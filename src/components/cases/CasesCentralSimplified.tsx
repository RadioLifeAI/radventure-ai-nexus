
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { HeaderNav } from "@/components/HeaderNav";
import { CaseFilters } from "./CaseFilters";
import { CasesGrid } from "./CasesGrid";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  Filter, 
  Brain, 
  Target,
  ArrowLeft,
  TrendingUp,
  Award
} from "lucide-react";
import { useCasesData } from "@/hooks/useCasesData";
import { useRealUserStats } from "@/hooks/useRealUserStats";

export function CasesCentralSimplified() {
  const { casesStats, userProgress, isLoading } = useCasesData();
  const { stats: realStats } = useRealUserStats();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [filters, setFilters] = useState(() => {
    const specialtyFromUrl = searchParams.get('specialty') || '';
    return {
      specialty: specialtyFromUrl,
      modality: "",
      difficulty: "",
      searchTerm: ""
    };
  });

  useEffect(() => {
    const specialtyFromUrl = searchParams.get('specialty') || '';
    if (specialtyFromUrl && specialtyFromUrl !== filters.specialty) {
      setFilters(prev => ({
        ...prev,
        specialty: specialtyFromUrl
      }));
    }
  }, [searchParams, filters.specialty]);

  const filtersStats = casesStats ? {
    total: casesStats.totalCases,
    bySpecialty: casesStats.bySpecialty
  } : { total: 0, bySpecialty: {} };

  const handleBackToDashboard = () => {
    setFilters({
      specialty: "",
      modality: "",
      difficulty: "",
      searchTerm: ""
    });
    navigate('/app/dashboard', { replace: true });
  };

  const quickStats = realStats ? [
    {
      label: "Casos Resolvidos",
      value: realStats.totalCases,
      icon: Target,
      color: "text-blue-400"
    },
    {
      label: "Precisão",
      value: `${realStats.accuracy}%`,
      icon: TrendingUp,
      color: "text-green-400"
    }
  ] : [];

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      
      <main className="flex-1 w-full px-4 lg:px-8 py-6 overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          {/* Header limpo */}
          <div className="text-center">
            {filters.specialty && (
              <div className="mb-4 flex flex-col sm:flex-row items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToDashboard}
                  className="text-cyan-200 hover:text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar ao Dashboard
                </Button>
                <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <span className="text-cyan-200 text-sm">
                    Filtrado por: <strong className="text-white">{filters.specialty}</strong>
                  </span>
                </div>
              </div>
            )}
            
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Explorar Casos Médicos
            </h1>
            <p className="text-cyan-100 text-lg max-w-2xl mx-auto mb-6">
              Pratique com casos reais e aprimore suas habilidades diagnósticas
            </p>

            {/* Stats rápidas - apenas 2 */}
            {quickStats.length > 0 && (
              <div className="flex justify-center gap-6 mb-6">
                {quickStats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <div className="text-left">
                      <p className="text-xs text-cyan-200">{stat.label}</p>
                      <p className="font-semibold text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Botões de navegação simplificados */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Button 
                onClick={() => navigate('/app/estatisticas')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Estatísticas Completas
              </Button>
              <Button 
                onClick={() => navigate('/app/jornada/criar')}
                variant="outline"
                className="border-cyan-200 text-cyan-200 hover:bg-white/10 hover:text-white"
              >
                <Brain className="h-4 w-4 mr-2" />
                Criar Jornada IA
              </Button>
              <Button 
                onClick={() => navigate('/app/rankings')}
                variant="outline"
                className="border-green-200 text-green-200 hover:bg-white/10 hover:text-white"
              >
                <Award className="h-4 w-4 mr-2" />
                Rankings
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <CaseFilters 
              filters={filters} 
              onFiltersChange={setFilters}
              stats={filtersStats}
            />
          </div>

          {/* Grid de casos */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-cyan-200" />
              <h2 className="text-lg font-semibold text-white">
                Casos Disponíveis
              </h2>
            </div>
            <CasesGrid filters={filters} />
          </div>
        </div>
      </main>
    </div>
  );
}
