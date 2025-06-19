
import React, { useState } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { JourneyCreator } from "@/components/journey/JourneyCreator";
import { JourneyList } from "@/components/journey/JourneyList";
import { JourneyExecutionModal } from "@/components/journey/JourneyExecutionModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BookOpen, List } from "lucide-react";

export default function CreateJourney() {
  const [executionModalOpen, setExecutionModalOpen] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState<any>(null);

  const handleStartJourney = (journey: any) => {
    setSelectedJourney(journey);
    setExecutionModalOpen(true);
  };

  const handleEditJourney = (journey: any) => {
    // TODO: Implementar edição de jornada
    console.log("Editar jornada:", journey);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <HeaderNav />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-purple-600" />
            Jornadas de Aprendizado
          </h1>
          <p className="text-gray-600">
            Crie trilhas personalizadas ou continue suas jornadas existentes
          </p>
        </div>
        
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Criar Nova
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
      </main>
    </div>
  );
}
