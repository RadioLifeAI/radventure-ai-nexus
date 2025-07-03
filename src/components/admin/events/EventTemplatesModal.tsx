import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Bookmark,
  Search,
  Filter,
  Copy,
  Star,
  Clock,
  Users,
  Trophy,
  Target,
  Sparkles,
  Brain,
  Stethoscope,
  Heart,
  Eye,
  Bone,
  Zap
} from "lucide-react";

interface EventTemplate {
  id: string;
  name: string;
  description: string;
  specialty: string;
  difficulty: "Básico" | "Intermediário" | "Avançado";
  duration: number;
  participants: number;
  cases: number;
  prize: number;
  tags: string[];
  isPopular: boolean;
  aiOptimized: boolean;
  usageCount: number;
  rating: number;
  config: {
    event_type: string;
    case_filters: any;
    prize_distribution: any[];
    auto_start: boolean;
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
  onUseTemplate: (template: EventTemplate) => void;
}

export function EventTemplatesModal({ open, onClose, onUseTemplate }: Props) {
  const [activeTab, setActiveTab] = useState("popular");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  // Templates pré-configurados
  const templates: EventTemplate[] = [
    {
      id: "1",
      name: "Quiz Cardiologia Básica",
      description: "Evento focado em casos fundamentais de cardiologia para estudantes e residentes",
      specialty: "Cardiologia",
      difficulty: "Básico",
      duration: 45,
      participants: 50,
      cases: 10,
      prize: 1000,
      tags: ["ECG", "Arritmias", "Insuficiência Cardíaca"],
      isPopular: true,
      aiOptimized: true,
      usageCount: 247,
      rating: 4.8,
      config: {
        event_type: "quiz_timed",
        case_filters: { specialty: "Cardiologia", difficulty_level: 1 },
        prize_distribution: [
          { position: 1, prize: 500 },
          { position: 2, prize: 300 },
          { position: 3, prize: 200 }
        ],
        auto_start: false
      }
    },
    {
      id: "2", 
      name: "Diagnóstico por Imagem Neurológica",
      description: "Casos complexos de neuroimagem para especialistas",
      specialty: "Neurologia",
      difficulty: "Avançado",
      duration: 90,
      participants: 30,
      cases: 15,
      prize: 2500,
      tags: ["TC", "RM", "AVC", "Tumores"],
      isPopular: true,
      aiOptimized: true,
      usageCount: 156,
      rating: 4.9,
      config: {
        event_type: "quiz_free",
        case_filters: { specialty: "Neurologia", modality: "TC" },
        prize_distribution: [
          { position: 1, prize: 1200 },
          { position: 2, prize: 800 },
          { position: 3, prize: 500 }
        ],
        auto_start: false
      }
    },
    {
      id: "3",
      name: "Dermatologia Pediátrica",
      description: "Lesões cutâneas em pacientes pediátricos",
      specialty: "Dermatologia", 
      difficulty: "Intermediário",
      duration: 60,
      participants: 40,
      cases: 12,
      prize: 1500,
      tags: ["Pediatria", "Lesões", "Diagnóstico"],
      isPopular: false,
      aiOptimized: false,
      usageCount: 89,
      rating: 4.6,
      config: {
        event_type: "quiz_timed",
        case_filters: { specialty: "Dermatologia", target_audience: ["Pediatria"] },
        prize_distribution: [
          { position: 1, prize: 750 },
          { position: 2, prize: 450 },
          { position: 3, prize: 300 }
        ],
        auto_start: false
      }
    },
    {
      id: "4",
      name: "Radiologia de Emergência",
      description: "Casos urgentes de radiologia para pronto-atendimento",
      specialty: "Radiologia",
      difficulty: "Intermediário", 
      duration: 75,
      participants: 60,
      cases: 20,
      prize: 2000,
      tags: ["Emergência", "Trauma", "Abdome Agudo"],
      isPopular: true,
      aiOptimized: true,
      usageCount: 203,
      rating: 4.7,
      config: {
        event_type: "quiz_timed",
        case_filters: { specialty: "Radiologia", exam_context: "emergencia" },
        prize_distribution: [
          { position: 1, prize: 1000 },
          { position: 2, prize: 600 },
          { position: 3, prize: 400 }
        ],
        auto_start: true
      }
    }
  ];

  const specialties = [
    { name: "Cardiologia", icon: Heart, color: "text-red-500" },
    { name: "Neurologia", icon: Brain, color: "text-purple-500" },
    { name: "Dermatologia", icon: Eye, color: "text-orange-500" },
    { name: "Radiologia", icon: Target, color: "text-blue-500" },
    { name: "Ortopedia", icon: Bone, color: "text-gray-500" }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSpecialty = !selectedSpecialty || template.specialty === selectedSpecialty;
    
    return matchesSearch && matchesSpecialty;
  });

  const getTabTemplates = (tab: string) => {
    switch (tab) {
      case "popular":
        return filteredTemplates.filter(t => t.isPopular);
      case "ai":
        return filteredTemplates.filter(t => t.aiOptimized);
      case "recent":
        return filteredTemplates.sort((a, b) => b.usageCount - a.usageCount);
      default:
        return filteredTemplates;
    }
  };

  const handleUseTemplate = (template: EventTemplate) => {
    onUseTemplate(template);
    toast({
      title: "✨ Template aplicado!",
      description: `Template "${template.name}" foi carregado com sucesso.`,
      className: "bg-green-50 border-green-200"
    });
    onClose();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Básico": return "bg-green-100 text-green-700";
      case "Intermediário": return "bg-yellow-100 text-yellow-700";
      case "Avançado": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getSpecialtyIcon = (specialty: string) => {
    const specialtyData = specialties.find(s => s.name === specialty);
    if (specialtyData) {
      const Icon = specialtyData.icon;
      return <Icon className={`h-5 w-5 ${specialtyData.color}`} />;
    }
    return <Stethoscope className="h-5 w-5 text-gray-500" />;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Bookmark className="h-5 w-5 text-blue-500" />
            Biblioteca de Templates
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Templates pré-configurados para acelerar a criação de eventos
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-2">
          {/* Filtros */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Todas as especialidades</option>
                  {specialties.map(specialty => (
                    <option key={specialty.name} value={specialty.name}>
                      {specialty.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="popular">
                <Star className="h-4 w-4 mr-1" />
                Populares
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Sparkles className="h-4 w-4 mr-1" />
                IA Otimizado
              </TabsTrigger>
              <TabsTrigger value="recent">
                <Clock className="h-4 w-4 mr-1" />
                Mais Usados
              </TabsTrigger>
              <TabsTrigger value="all">
                <Filter className="h-4 w-4 mr-1" />
                Todos
              </TabsTrigger>
            </TabsList>

            {["popular", "ai", "recent", "all"].map(tab => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getTabTemplates(tab).map((template) => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow duration-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getSpecialtyIcon(template.specialty)}
                            <div>
                              <CardTitle className="text-lg">{template.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getDifficultyColor(template.difficulty)}>
                                  {template.difficulty}
                                </Badge>
                                {template.aiOptimized && (
                                  <Badge className="bg-blue-100 text-blue-700">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    IA
                                  </Badge>
                                )}
                                {template.isPopular && (
                                  <Badge className="bg-yellow-100 text-yellow-700">
                                    <Star className="h-3 w-3 mr-1" />
                                    Popular
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <div className="flex items-center gap-1 text-yellow-500 mb-1">
                              <Star className="h-3 w-3 fill-current" />
                              {template.rating}
                            </div>
                            <div className="text-gray-500">{template.usageCount} usos</div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600">{template.description}</p>
                        
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div>
                            <Clock className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                            <div className="text-xs text-gray-600">{template.duration}min</div>
                          </div>
                          <div>
                            <Users className="h-4 w-4 text-green-500 mx-auto mb-1" />
                            <div className="text-xs text-gray-600">{template.participants}</div>
                          </div>
                          <div>
                            <Target className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                            <div className="text-xs text-gray-600">{template.cases}</div>
                          </div>
                          <div>
                            <Trophy className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
                            <div className="text-xs text-gray-600">{template.prize}</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {template.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {template.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                        
                        <Button 
                          onClick={() => handleUseTemplate(template)}
                          className="w-full"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Usar Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {getTabTemplates(tab).length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Bookmark className="h-12 w-12 mx-auto mb-2" />
                    <p>Nenhum template encontrado</p>
                    <p className="text-sm">Tente ajustar os filtros de busca</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="border-t pt-4 flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline">
              <Zap className="h-4 w-4 mr-1" />
              IA Personalizada
            </Button>
            <Button>
              <Sparkles className="h-4 w-4 mr-1" />
              Criar Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}