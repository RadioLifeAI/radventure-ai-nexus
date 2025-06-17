
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { 
  BookOpen, 
  Target, 
  Brain, 
  Play, 
  Plus,
  X,
  Sparkles,
  Save,
  Search
} from "lucide-react";
import { AdvancedJourneyFilters } from "./AdvancedJourneyFilters";
import { JourneyExecutionModal } from "./JourneyExecutionModal";
import { useJourneySearch } from "@/hooks/useJourneySearch";
import { useJourneyManagement } from "@/hooks/useJourneyManagement";
import { useJourneyAISuggestions } from "@/hooks/useJourneyAISuggestions";

export function JourneyCreator() {
  // Estados do formulário
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState<string[]>([]);
  const [newObjective, setNewObjective] = useState("");
  
  // Estados dos filtros
  const [filters, setFilters] = useState({
    specialty: "",
    modality: "",
    subtype: "",
    difficulty: "",
    searchTerm: "",
    patientAge: "",
    patientGender: "",
    symptomsDuration: ""
  });

  // Estados da UI
  const [executionModalOpen, setExecutionModalOpen] = useState(false);
  const [currentJourney, setCurrentJourney] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Hooks
  const { data: searchResults, isLoading: searchLoading } = useJourneySearch(filters);
  const { createJourney } = useJourneyManagement();
  const { getAutoFill, loading: aiLoading } = useJourneyAISuggestions();

  // Adicionar objetivo
  const addObjective = () => {
    if (newObjective.trim() && !objectives.includes(newObjective.trim())) {
      setObjectives([...objectives, newObjective.trim()]);
      setNewObjective("");
    }
  };

  // Remover objetivo
  const removeObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  // Auto-preenchimento com IA
  const handleAutoFillWithAI = async () => {
    try {
      const context = `Quero criar uma jornada com os seguintes parâmetros: ${title || 'título não definido'}, ${description || 'descrição não definida'}`;
      const aiData = await getAutoFill(filters, context);
      
      if (aiData) {
        if (aiData.title) setTitle(aiData.title);
        if (aiData.description) setDescription(aiData.description);
        if (aiData.objectives && Array.isArray(aiData.objectives)) {
          setObjectives(aiData.objectives);
        }
        if (aiData.suggestedFilters) {
          setFilters(prev => ({ ...prev, ...aiData.suggestedFilters }));
        }
        
        toast({
          title: "✨ Jornada preenchida pela IA!",
          description: "Todos os campos foram preenchidos com sugestões inteligentes",
          className: "bg-purple-50 border-purple-200"
        });
      }
    } catch (error) {
      console.error("Erro no auto-preenchimento:", error);
    }
  };

  // Criar jornada
  const handleCreateJourney = async () => {
    if (!title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, insira um título para a jornada",
        variant: "destructive"
      });
      return;
    }

    if (!searchResults || searchResults.length === 0) {
      toast({
        title: "Nenhum caso encontrado",
        description: "Ajuste os filtros para encontrar casos médicos",
        variant: "destructive"
      });
      return;
    }

    try {
      const journeyData = {
        title: title.trim(),
        description: description.trim(),
        objectives,
        filters,
        case_ids: searchResults.map(c => c.id),
        estimated_duration_minutes: searchResults.length * 5
      };

      await createJourney.mutateAsync(journeyData);
      
      // Limpar formulário
      setTitle("");
      setDescription("");
      setObjectives([]);
      setFilters({
        specialty: "",
        modality: "",
        subtype: "",
        difficulty: "",
        searchTerm: "",
        patientAge: "",
        patientGender: "",
        symptomsDuration: ""
      });
      
    } catch (error) {
      console.error("Erro ao criar jornada:", error);
    }
  };

  // Iniciar preview da jornada
  const handlePreviewJourney = () => {
    if (!searchResults || searchResults.length === 0) {
      toast({
        title: "Nenhum caso para preview",
        description: "Configure os filtros para encontrar casos",
        variant: "destructive"
      });
      return;
    }

    const previewJourney = {
      id: 'preview',
      title: title || 'Preview da Jornada',
      description,
      objectives,
      case_ids: searchResults.map(c => c.id),
      total_cases: searchResults.length,
      current_case_index: 0,
      completed_cases: 0,
      progress_percentage: 0,
      status: 'preview'
    };

    setCurrentJourney(previewJourney);
    setExecutionModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl">Criar Jornada de Aprendizado</CardTitle>
                <p className="text-purple-100">Use IA para criar trilhas personalizadas baseadas em seus objetivos</p>
              </div>
            </div>
            <Button
              onClick={handleAutoFillWithAI}
              disabled={aiLoading}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              {aiLoading ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-spin" />
                  IA Trabalhando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Auto-Preencher com IA
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário da Jornada */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Informações da Jornada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Título *</label>
                <Input
                  placeholder="Ex: Jornada em Radiologia Torácica"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Descrição</label>
                <Textarea
                  placeholder="Descreva os objetivos e foco desta jornada de aprendizado..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border-purple-200 focus:border-purple-400 min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Objetivos de Aprendizado</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Adicionar objetivo..."
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addObjective()}
                    className="border-purple-200 focus:border-purple-400"
                  />
                  <Button onClick={addObjective} size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {objectives.map((objective, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                      {objective}
                      <button
                        onClick={() => removeObjective(index)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Button
                  onClick={handleCreateJourney}
                  disabled={createJourney.isPending || !title.trim() || !searchResults?.length}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createJourney.isPending ? 'Criando...' : 'Criar Jornada'}
                </Button>
                
                <Button
                  onClick={handlePreviewJourney}
                  disabled={!searchResults?.length}
                  variant="outline"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Resultados */}
        <div className="space-y-6">
          <AdvancedJourneyFilters
            filters={filters}
            onFiltersChange={setFilters}
            onAutoFillWithAI={handleAutoFillWithAI}
            isLoadingAI={aiLoading}
            casesFound={searchResults?.length || 0}
          />

          {/* Resultados da busca */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-purple-600" />
                Casos Encontrados ({searchResults?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {searchLoading ? (
                <div className="text-center py-4 text-gray-600">
                  Buscando casos...
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.slice(0, 10).map((case_item) => (
                    <div key={case_item.id} className="p-2 border rounded bg-gray-50">
                      <p className="font-medium text-sm">{case_item.title}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{case_item.specialty}</Badge>
                        <Badge variant="outline" className="text-xs">{case_item.modality}</Badge>
                        {case_item.difficulty_level && (
                          <Badge variant="outline" className="text-xs">Nível {case_item.difficulty_level}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {searchResults.length > 10 && (
                    <p className="text-sm text-gray-500 text-center">
                      ... e mais {searchResults.length - 10} casos
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-600">
                  Configure os filtros para encontrar casos médicos
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Execução/Preview */}
      {executionModalOpen && currentJourney && (
        <JourneyExecutionModal
          journey={currentJourney}
          isOpen={executionModalOpen}
          onClose={() => {
            setExecutionModalOpen(false);
            setCurrentJourney(null);
          }}
        />
      )}
    </div>
  );
}
