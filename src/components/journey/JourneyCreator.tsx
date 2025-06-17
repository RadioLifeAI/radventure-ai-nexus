import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Brain, 
  Target, 
  Clock, 
  Star, 
  Sparkles, 
  CheckCircle, 
  ArrowRight,
  Lightbulb,
  TrendingUp,
  Award
} from "lucide-react";

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  cases: string[];
  estimatedTime: number;
  difficulty: number;
  completed: boolean;
}

export function JourneyCreator() {
  const [journeyData, setJourneyData] = useState({
    title: "",
    description: "",
    specialty: "",
    difficulty: "",
    duration: "",
    objectives: [] as string[]
  });
  const [currentObjective, setCurrentObjective] = useState("");
  const [generatedJourney, setGeneratedJourney] = useState<JourneyStep[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Buscar especialidades
  const { data: specialties } = useQuery({
    queryKey: ['specialties-journey'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_specialties')
        .select('name')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Buscar casos da especialidade
  const { data: availableCases } = useQuery({
    queryKey: ['cases-for-journey', journeyData.specialty],
    queryFn: async () => {
      if (!journeyData.specialty) return [];
      
      const { data, error } = await supabase
        .from('medical_cases')
        .select('id, title, difficulty_level, specialty')
        .eq('specialty', journeyData.specialty)
        .order('difficulty_level', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!journeyData.specialty
  });

  const addObjective = () => {
    if (currentObjective.trim() && !journeyData.objectives.includes(currentObjective.trim())) {
      setJourneyData(prev => ({
        ...prev,
        objectives: [...prev.objectives, currentObjective.trim()]
      }));
      setCurrentObjective("");
    }
  };

  const removeObjective = (index: number) => {
    setJourneyData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const generateJourneyWithAI = async () => {
    if (!journeyData.title || !journeyData.specialty || journeyData.objectives.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título, especialidade e pelo menos um objetivo",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simular geração de jornada com IA
      const mockJourney: JourneyStep[] = [
        {
          id: "step-1",
          title: "Fundamentos Básicos",
          description: `Introdução aos conceitos fundamentais de ${journeyData.specialty}`,
          cases: availableCases?.filter(c => c.difficulty_level === 1).map(c => c.id) || [],
          estimatedTime: 30,
          difficulty: 1,
          completed: false
        },
        {
          id: "step-2",
          title: "Casos Intermediários",
          description: `Aplicação prática dos conceitos em casos de ${journeyData.specialty}`,
          cases: availableCases?.filter(c => c.difficulty_level === 2).map(c => c.id) || [],
          estimatedTime: 45,
          difficulty: 2,
          completed: false
        },
        {
          id: "step-3",
          title: "Desafios Avançados",
          description: `Resolução de casos complexos de ${journeyData.specialty}`,
          cases: availableCases?.filter(c => c.difficulty_level >= 3).map(c => c.id) || [],
          estimatedTime: 60,
          difficulty: 3,
          completed: false
        }
      ];

      setGeneratedJourney(mockJourney);
      toast({
        title: "Jornada gerada com sucesso!",
        description: "Sua trilha de aprendizado personalizada está pronta"
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar jornada",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveJourney = async () => {
    if (!generatedJourney) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Por enquanto, apenas mostramos uma mensagem de sucesso
      // A tabela user_journeys ainda não existe no banco
      toast({
        title: "Jornada criada!",
        description: "Sua trilha de aprendizado foi configurada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar jornada",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    }
  };

  // Filter out empty specialty names to prevent Select error
  const validSpecialties = specialties?.filter(specialty => 
    specialty.name && 
    specialty.name.trim() !== '' && 
    typeof specialty.name === 'string'
  ) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Crie sua Jornada de Aprendizado
        </h1>
        <p className="text-gray-600 text-lg">
          IA personalizada criará uma trilha baseada no seu perfil e objetivos
        </p>
      </div>

      {!generatedJourney ? (
        // Formulário de criação
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Brain className="h-6 w-6" />
              Configurar Jornada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título da Jornada</label>
                <Input
                  placeholder="Ex: Mastering Pneumologia"
                  value={journeyData.title}
                  onChange={(e) => setJourneyData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Especialidade</label>
                <Select 
                  value={journeyData.specialty} 
                  onValueChange={(value) => setJourneyData(prev => ({ ...prev, specialty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {validSpecialties.map((specialty) => (
                      <SelectItem key={specialty.name} value={specialty.name}>
                        {specialty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <Textarea
                placeholder="Descreva o que você quer aprender nesta jornada..."
                value={journeyData.description}
                onChange={(e) => setJourneyData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Objetivos */}
            <div>
              <label className="block text-sm font-medium mb-2">Objetivos de Aprendizado</label>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Ex: Dominar diagnóstico de pneumonia"
                  value={currentObjective}
                  onChange={(e) => setCurrentObjective(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addObjective()}
                />
                <Button onClick={addObjective} variant="outline">
                  <Target className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {journeyData.objectives.map((objective, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeObjective(index)}>
                    {objective} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Preferências */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nível de Dificuldade</label>
                <Select 
                  value={journeyData.difficulty} 
                  onValueChange={(value) => setJourneyData(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Iniciante</SelectItem>
                    <SelectItem value="2">Intermediário</SelectItem>
                    <SelectItem value="3">Avançado</SelectItem>
                    <SelectItem value="4">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duração Estimada</label>
                <Select 
                  value={journeyData.duration} 
                  onValueChange={(value) => setJourneyData(prev => ({ ...prev, duration: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tempo disponível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-week">1 semana</SelectItem>
                    <SelectItem value="2-weeks">2 semanas</SelectItem>
                    <SelectItem value="1-month">1 mês</SelectItem>
                    <SelectItem value="3-months">3 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={generateJourneyWithAI}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3"
            >
              {isGenerating ? (
                <>
                  <Brain className="h-5 w-5 mr-2 animate-spin" />
                  Gerando Jornada com IA...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Gerar Jornada com IA
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        // Jornada gerada
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-6 w-6" />
                Jornada Gerada: {journeyData.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{journeyData.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {journeyData.objectives.map((objective, index) => (
                  <Badge key={index} variant="outline" className="border-green-300 text-green-700">
                    <Target className="h-3 w-3 mr-1" />
                    {objective}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {generatedJourney.reduce((total, step) => total + step.estimatedTime, 0)} min total
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {generatedJourney.length} etapas
                  </span>
                </div>
                <Button onClick={saveJourney} className="bg-green-600 hover:bg-green-700">
                  <Award className="h-4 w-4 mr-2" />
                  Salvar Jornada
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Etapas da jornada */}
          <div className="space-y-4">
            {generatedJourney.map((step, index) => (
              <Card key={step.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {index + 1}
                      </div>
                      {step.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-blue-300 text-blue-700">
                        {step.cases.length} casos
                      </Badge>
                      <Badge variant="outline" className="border-orange-300 text-orange-700">
                        {step.estimatedTime} min
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{step.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Progress value={step.completed ? 100 : 0} className="w-32" />
                      <span className="text-sm text-gray-600">
                        {step.completed ? "Concluído" : "Pendente"}
                      </span>
                    </div>
                    <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Iniciar Etapa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
