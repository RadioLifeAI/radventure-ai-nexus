
import React, { useState } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { JourneyCreator } from "@/components/journey/JourneyCreator";
import { JourneyList } from "@/components/journey/JourneyList";
import { JourneyExecutionModal } from "@/components/journey/JourneyExecutionModal";
import { IntelligentJourneyModal } from "@/components/journey/IntelligentJourneyModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, List, Brain, Sparkles, TrendingUp } from "lucide-react";

export default function CreateJourney() {
  const [executionModalOpen, setExecutionModalOpen] = useState(false);
  const [intelligentModalOpen, setIntelligentModalOpen] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState<any>(null);

  const handleStartJourney = (journey: any) => {
    setSelectedJourney(journey);
    setExecutionModalOpen(true);
  };

  const handleEditJourney = (journey: any) => {
    // TODO: Implementar edição de jornada
    console.log("Editar jornada:", journey);
  };

  const handleIntelligentCreate = (journeyData: any) => {
    // Criar jornada baseada nos dados do modal inteligente
    console.log("Criar jornada inteligente:", journeyData);
    setIntelligentModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <HeaderNav />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header melhorado */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <BookOpen className="h-10 w-10 text-purple-600" />
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Jornadas de Aprendizado
                </span>
              </h1>
              <p className="text-gray-600 text-lg">
                Crie trilhas personalizadas com IA avançada ou continue suas jornadas existentes
              </p>
            </div>
            
            <Button
              onClick={() => setIntelligentModalOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3 text-lg"
            >
              <Brain className="h-5 w-5 mr-2" />
              Assistente IA
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">IA Avançada</div>
                  <div className="text-sm text-gray-600">Recomendações personalizadas</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">Filtros Inteligentes</div>
                  <div className="text-sm text-gray-600">Busca semântica avançada</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">Progressão Adaptativa</div>
                  <div className="text-sm text-gray-600">Dificuldade que se ajusta</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Criar Nova
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 ml-1">
                IA
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Minhas Jornadas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-6">
            <JourneyCreator />
          </TabsContent>
          
          <TabsContent value="list" className="space-y-6">
            <JourneyList 
              onStartJourney={handleStartJourney}
              onEditJourney={handleEditJourney}
            />
          </TabsContent>
        </Tabs>

        {/* Modal de Execução */}
        {executionModalOpen && selectedJourney && (
          <JourneyExecutionModal
            journey={selectedJourney}
            isOpen={executionModalOpen}
            onClose={() => {
              setExecutionModalOpen(false);
              setSelectedJourney(null);
            }}
          />
        )}

        {/* Modal Inteligente */}
        <IntelligentJourneyModal
          isOpen={intelligentModalOpen}
          onClose={() => setIntelligentModalOpen(false)}
          onCreateJourney={handleIntelligentCreate}
        />
      </main>
    </div>
  );
}
