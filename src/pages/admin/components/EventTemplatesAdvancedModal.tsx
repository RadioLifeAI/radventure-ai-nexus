
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Clock,
  Users,
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  Heart,
  Brain,
  Zap,
  Star,
  Save,
  Wand2
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  specialty: string;
  difficulty: number;
  estimatedDuration: number;
  targetAudience: string[];
  estimatedParticipants: number;
  prizeRadcoins: number;
  successRate: number;
  popularity: number;
  caseFilters: any;
  config: any;
  tags: string[];
  isRecommended?: boolean;
  isPremium?: boolean;
}

const ADVANCED_TEMPLATES: Template[] = [
  {
    id: "neuro-emergency",
    name: "Emergências Neurológicas Críticas",
    description: "Casos urgentes de neuroimagem para diagnóstico rápido em emergência",
    category: "emergency",
    specialty: "Neurologia",
    difficulty: 4,
    estimatedDuration: 45,
    targetAudience: ["Residentes R3+", "Especialistas", "Emergencistas"],
    estimatedParticipants: 75,
    prizeRadcoins: 2000,
    successRate: 78,
    popularity: 92,
    caseFilters: {
      specialty: ["Neurologia"],
      modality: ["Tomografia Computadorizada (TC)", "Ressonância Magnética (RM)"],
      difficulty: ["3", "4"],
      urgency: ["emergencial"]
    },
    config: {
      numberOfCases: 15,
      timePerCase: 3,
      autoStart: true,
      eliminationAllowed: true,
      aiHintsEnabled: true
    },
    tags: ["emergência", "neurologia", "crítico", "rápido"],
    isRecommended: true
  },
  {
    id: "cardio-basics",
    name: "Fundamentos de Cardioimagem",
    description: "Introdução estruturada à interpretação de imagens cardiovasculares",
    category: "educational",
    specialty: "Cardiologia",
    difficulty: 2,
    estimatedDuration: 30,
    targetAudience: ["Estudantes", "Residentes R1-R2"],
    estimatedParticipants: 120,
    prizeRadcoins: 800,
    successRate: 85,
    popularity: 88,
    caseFilters: {
      specialty: ["Cardiologia"],
      modality: ["Radiografia (RX)", "Ecocardiograma"],
      difficulty: ["1", "2"]
    },
    config: {
      numberOfCases: 12,
      timePerCase: 2.5,
      autoStart: true,
      eliminationAllowed: true,
      aiHintsEnabled: true
    },
    tags: ["básico", "cardiologia", "educacional"],
    isRecommended: false
  },
  {
    id: "onco-advanced",
    name: "Oncoimagem Avançada Multimodal",
    description: "Casos complexos de oncoimagem com múltiplas modalidades",
    category: "advanced",
    specialty: "Oncologia",
    difficulty: 5,
    estimatedDuration: 60,
    targetAudience: ["Especialistas", "Fellows", "Professores"],
    estimatedParticipants: 45,
    prizeRadcoins: 3000,
    successRate: 65,
    popularity: 76,
    caseFilters: {
      specialty: ["Oncologia"],
      modality: ["TC", "RM", "PET-CT"],
      difficulty: ["4", "5"]
    },
    config: {
      numberOfCases: 20,
      timePerCase: 3,
      autoStart: false,
      eliminationAllowed: false,
      aiHintsEnabled: true
    },
    tags: ["avançado", "oncologia", "multimodal", "complexo"],
    isPremium: true
  },
  {
    id: "pediatric-essentials",
    name: "Essenciais de Radiologia Pediátrica",
    description: "Casos fundamentais em radiologia pediátrica",
    category: "specialty",
    specialty: "Pediatria",
    difficulty: 3,
    estimatedDuration: 35,
    targetAudience: ["Residentes", "Especialistas", "Pediatras"],
    estimatedParticipants: 85,
    prizeRadcoins: 1200,
    successRate: 80,
    popularity: 84,
    caseFilters: {
      specialty: ["Pediatria"],
      patient_age: ["infantil", "pediátrico"],
      difficulty: ["2", "3"]
    },
    config: {
      numberOfCases: 14,
      timePerCase: 2.5,
      autoStart: true,
      eliminationAllowed: true,
      aiHintsEnabled: true
    },
    tags: ["pediatria", "essencial", "crianças"]
  }
];

interface Props {
  open: boolean;
  onClose: () => void;
  onApplyTemplate: (template: Template) => void;
  onCreateCustomTemplate: (templateData: any) => void;
  currentFilters?: any;
}

export function EventTemplatesAdvancedModal({ 
  open, 
  onClose, 
  onApplyTemplate, 
  onCreateCustomTemplate,
  currentFilters 
}: Props) {
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [customTemplate, setCustomTemplate] = useState({
    name: "",
    description: "",
    specialty: "",
    difficulty: 2,
    estimatedDuration: 30,
    targetAudience: "",
    prizeRadcoins: 1000
  });

  const categories = [
    { value: "all", label: "Todos os Templates", icon: Sparkles },
    { value: "emergency", label: "Emergência", icon: Zap },
    { value: "educational", label: "Educacional", icon: Brain },
    { value: "advanced", label: "Avançado", icon: Star },
    { value: "specialty", label: "Especialidade", icon: Heart }
  ];

  const filteredTemplates = ADVANCED_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch = searchTerm === "" || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return "bg-green-100 text-green-700";
    if (difficulty <= 3) return "bg-yellow-100 text-yellow-700";
    if (difficulty <= 4) return "bg-orange-100 text-orange-700";
    return "bg-red-100 text-red-700";
  };

  const getDifficultyLabel = (difficulty: number) => {
    const labels = {
      1: "Muito Fácil",
      2: "Fácil", 
      3: "Moderado",
      4: "Difícil",
      5: "Muito Difícil"
    };
    return labels[difficulty as keyof typeof labels] || "Moderado";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Templates Inteligentes de Eventos
          </DialogTitle>
          <p className="text-gray-600">
            Crie eventos rapidamente usando templates otimizados por IA baseados em dados de sucesso
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="browse">Explorar Templates</TabsTrigger>
              <TabsTrigger value="recommended">Recomendados para Você</TabsTrigger>
              <TabsTrigger value="custom">Criar Template</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-4">
              {/* Filtros e busca */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar templates por nome, descrição ou tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Grid de templates */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow relative">
                    {template.isRecommended && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-purple-100 text-purple-700">
                          <Star className="h-3 w-3 mr-1" />
                          Recomendado
                        </Badge>
                      </div>
                    )}
                    {template.isPremium && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-yellow-100 text-yellow-700">
                          <Trophy className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {template.description}
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Métricas principais */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-blue-500" />
                          {template.estimatedDuration}min
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-green-500" />
                          ~{template.estimatedParticipants}
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3 text-yellow-500" />
                          {template.prizeRadcoins} RC
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-purple-500" />
                          {template.successRate}% sucesso
                        </div>
                      </div>

                      {/* Dificuldade e especialidade */}
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(template.difficulty)}>
                          {getDifficultyLabel(template.difficulty)}
                        </Badge>
                        <Badge variant="outline">{template.specialty}</Badge>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Popularidade */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="flex-1 bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-purple-500 h-1 rounded-full" 
                            style={{ width: `${template.popularity}%` }}
                          />
                        </div>
                        <span>{template.popularity}% popular</span>
                      </div>

                      {/* Botão de aplicar */}
                      <Button 
                        onClick={() => onApplyTemplate(template)}
                        className="w-full"
                        size="sm"
                      >
                        <Wand2 className="h-3 w-3 mr-1" />
                        Usar Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recommended" className="space-y-4">
              <div className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                <h3 className="text-lg font-semibold mb-2">Recomendações Personalizadas</h3>
                <p className="text-gray-600 mb-4">
                  Baseado no seu histórico e preferências, sugerimos estes templates:
                </p>
                {/* Aqui renderizaríamos templates recomendados baseados no perfil do usuário */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ADVANCED_TEMPLATES.filter(t => t.isRecommended).map((template) => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <Button 
                          onClick={() => onApplyTemplate(template)}
                          size="sm"
                          className="w-full"
                        >
                          Usar Template Recomendado
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    Criar Template Personalizado
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Crie um template personalizado baseado em suas configurações
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nome do Template</label>
                      <Input
                        value={customTemplate.name}
                        onChange={(e) => setCustomTemplate({...customTemplate, name: e.target.value})}
                        placeholder="Ex: Radiologia Torácica Avançada"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Especialidade</label>
                      <Select 
                        value={customTemplate.specialty}
                        onValueChange={(value) => setCustomTemplate({...customTemplate, specialty: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Neurologia">Neurologia</SelectItem>
                          <SelectItem value="Cardiologia">Cardiologia</SelectItem>
                          <SelectItem value="Oncologia">Oncologia</SelectItem>
                          <SelectItem value="Pediatria">Pediatria</SelectItem>
                          <SelectItem value="Emergência">Emergência</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Descrição</label>
                    <Textarea
                      value={customTemplate.description}
                      onChange={(e) => setCustomTemplate({...customTemplate, description: e.target.value})}
                      placeholder="Descreva o objetivo e conteúdo do template..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Dificuldade (1-5)</label>
                      <Select 
                        value={customTemplate.difficulty.toString()}
                        onValueChange={(value) => setCustomTemplate({...customTemplate, difficulty: parseInt(value)})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Muito Fácil</SelectItem>
                          <SelectItem value="2">2 - Fácil</SelectItem>
                          <SelectItem value="3">3 - Moderado</SelectItem>
                          <SelectItem value="4">4 - Difícil</SelectItem>
                          <SelectItem value="5">5 - Muito Difícil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Duração (min)</label>
                      <Input
                        type="number"
                        value={customTemplate.estimatedDuration}
                        onChange={(e) => setCustomTemplate({...customTemplate, estimatedDuration: parseInt(e.target.value)})}
                        min={15}
                        max={120}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Prêmio (RadCoins)</label>
                      <Input
                        type="number"
                        value={customTemplate.prizeRadcoins}
                        onChange={(e) => setCustomTemplate({...customTemplate, prizeRadcoins: parseInt(e.target.value)})}
                        min={100}
                        step={100}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Público-alvo</label>
                    <Input
                      value={customTemplate.targetAudience}
                      onChange={(e) => setCustomTemplate({...customTemplate, targetAudience: e.target.value})}
                      placeholder="Ex: Residentes R2+, Especialistas"
                    />
                  </div>

                  <Button 
                    onClick={() => onCreateCustomTemplate(customTemplate)}
                    className="w-full"
                    disabled={!customTemplate.name || !customTemplate.specialty}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Template Personalizado
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="border-t pt-4 flex justify-between">
          <div className="text-sm text-gray-500">
            {filteredTemplates.length} templates disponíveis
          </div>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
