
import React, { useState } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { AdvancedCasesDashboard } from "./advanced/AdvancedCasesDashboard";
import { CaseFilters } from "./CaseFilters";
import { CasesGrid } from "./CasesGrid";
import { CreateJourneyModal } from "@/components/journey/CreateJourneyModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Filter, 
  Brain, 
  Sparkles,
  Zap,
  Target
} from "lucide-react";
import { useCasesData } from "@/hooks/useCasesData";

export function CasesCentralAdvanced() {
  const { casesStats, userProgress, isLoading } = useCasesData();
  const [filters, setFilters] = useState({
    specialty: "",
    modality: "",
    difficulty: "",
    searchTerm: ""
  });
  const [showJourneyModal, setShowJourneyModal] = useState(false);

  const filtersStats = casesStats ? {
    total: casesStats.totalCases,
    bySpecialty: casesStats.bySpecialty
  } : { total: 0, bySpecialty: {} };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header Revolucionário */}
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Central de Casos Avançada
            </h1>
            <p className="text-cyan-100 text-xl max-w-3xl mx-auto">
              Experiência de aprendizado revolucionária com IA, gamificação e visualizações inteligentes
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-sm">Powered by AI</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <Zap className="h-4 w-4 text-orange-400" />
                <span className="text-sm">Real-time Analytics</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <Target className="h-4 w-4 text-green-400" />
                <span className="text-sm">Adaptive Learning</span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="advanced-dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm border border-white/20">
              <TabsTrigger value="advanced-dashboard" className="data-[state=active]:bg-white/20">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard Avançado
              </TabsTrigger>
              <TabsTrigger value="explorer" className="data-[state=active]:bg-white/20">
                <Filter className="h-4 w-4 mr-2" />
                Explorar Casos
              </TabsTrigger>
              <TabsTrigger value="ai-journey" className="data-[state=active]:bg-white/20">
                <Brain className="h-4 w-4 mr-2" />
                Jornada IA
              </TabsTrigger>
            </TabsList>

            <TabsContent value="advanced-dashboard" className="space-y-6">
              <AdvancedCasesDashboard />
            </TabsContent>

            <TabsContent value="explorer" className="space-y-6">
              <CaseFilters 
                filters={filters} 
                onFiltersChange={setFilters}
                stats={filtersStats}
              />
              <CasesGrid filters={filters} />
            </TabsContent>

            <TabsContent value="ai-journey" className="space-y-6">
              <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-purple-300/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Jornadas Personalizadas com IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Brain className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">
                      Trilhas Inteligentes de Aprendizado
                    </h3>
                    <p className="text-purple-100 mb-6">
                      Nossa IA cria trilhas personalizadas baseadas no seu perfil, objetivos e performance
                    </p>
                    <Button 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={() => setShowJourneyModal(true)}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Criar Jornada Inteligente
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
      </main>
    </div>
  );
}
