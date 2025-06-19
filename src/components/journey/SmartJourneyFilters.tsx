
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Search, 
  Filter, 
  Sparkles, 
  Target, 
  Clock,
  TrendingUp,
  Users,
  Zap,
  BookOpen,
  Stethoscope,
  Activity
} from "lucide-react";
import { useFormDataSource } from "@/hooks/useFormDataSource";

interface SmartJourneyFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  onAIRecommendation: () => void;
  isLoadingAI?: boolean;
  casesFound: number;
}

export function SmartJourneyFilters({
  filters,
  onFiltersChange,
  onAIRecommendation,
  isLoadingAI = false,
  casesFound = 0
}: SmartJourneyFiltersProps) {
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState("");
  const [activeTab, setActiveTab] = useState("semantic");
  const { specialties, modalities, difficulties } = useFormDataSource();

  const handleNaturalLanguageSearch = () => {
    if (naturalLanguageQuery.trim()) {
      onFiltersChange({
        ...filters,
        searchTerm: naturalLanguageQuery,
        aiQuery: naturalLanguageQuery
      });
    }
  };

  const quickFilters = [
    { 
      label: "Casos Urgentes", 
      icon: Activity, 
      color: "bg-red-500", 
      filters: { urgency: "high", context: "emergency" }
    },
    { 
      label: "Casos Raros", 
      icon: Target, 
      color: "bg-purple-500", 
      filters: { rarity: "rare", educationalValue: "high" }
    },
    { 
      label: "Graduação", 
      icon: BookOpen, 
      color: "bg-blue-500", 
      filters: { targetAudience: "graduation", difficulty: "1" }
    },
    { 
      label: "Residência", 
      icon: Stethoscope, 
      color: "bg-green-500", 
      filters: { targetAudience: "residency", difficulty: "3" }
    },
    { 
      label: "Alto Valor Educacional", 
      icon: TrendingUp, 
      color: "bg-orange-500", 
      filters: { educationalValue: "high" }
    },
    { 
      label: "Casos Rápidos", 
      icon: Zap, 
      color: "bg-yellow-500", 
      filters: { estimatedTime: "fast" }
    }
  ];

  // Opções reais baseadas nos campos do banco
  const contextOptions = [
    { value: "emergency", label: "Emergência", icon: Activity },
    { value: "ambulatory", label: "Ambulatório", icon: Users },
    { value: "icu", label: "UTI", icon: Target },
    { value: "ward", label: "Enfermaria", icon: BookOpen }
  ];

  const rarityOptions = [
    { value: "common", label: "Comum", color: "bg-green-100 text-green-800" },
    { value: "uncommon", label: "Incomum", color: "bg-yellow-100 text-yellow-800" },
    { value: "rare", label: "Raro", color: "bg-orange-100 text-orange-800" },
    { value: "very_rare", label: "Muito Raro", color: "bg-red-100 text-red-800" }
  ];

  const audienceOptions = [
    { value: "graduation", label: "Graduação", description: "Estudantes de medicina" },
    { value: "r1", label: "R1", description: "1º ano residência" },
    { value: "r2", label: "R2", description: "2º ano residência" },
    { value: "r3", label: "R3+", description: "3º ano+ residência" },
    { value: "specialist", label: "Especialização", description: "Pós-graduação" }
  ];

  const educationalValueOptions = [
    { value: "high", label: "Alto", color: "bg-green-500" },
    { value: "medium", label: "Médio", color: "bg-yellow-500" },
    { value: "low", label: "Baixo", color: "bg-gray-500" }
  ];

  const timeOptions = [
    { value: "fast", label: "<10min", icon: Zap },
    { value: "medium", label: "10-20min", icon: Clock },
    { value: "long", label: ">20min", icon: Target }
  ];

  return (
    <Card className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-purple-600" />
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Filtros Inteligentes de Jornada
          </span>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            {casesFound} casos encontrados
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Busca por Linguagem Natural */}
        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-purple-800">Busca Inteligente por IA</span>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: casos de pneumonia em idosos com dificuldade moderada"
              value={naturalLanguageQuery}
              onChange={(e) => setNaturalLanguageQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNaturalLanguageSearch()}
              className="border-purple-200 focus:border-purple-400"
            />
            <Button 
              onClick={handleNaturalLanguageSearch}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-purple-600 mt-2">
            Use linguagem natural para encontrar casos específicos
          </p>
        </div>

        {/* Filtros Rápidos */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-800">Filtros Rápidos</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {quickFilters.map((quick) => {
              const Icon = quick.icon;
              return (
                <Button
                  key={quick.label}
                  variant="outline"
                  size="sm"
                  onClick={() => onFiltersChange({ ...filters, ...quick.filters })}
                  className="justify-start gap-2 h-auto py-2"
                >
                  <div className={`p-1 rounded ${quick.color}`}>
                    <Icon className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-xs">{quick.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Tabs de Filtros Avançados */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="semantic">Semântico</TabsTrigger>
            <TabsTrigger value="context">Contexto</TabsTrigger>
            <TabsTrigger value="audience">Público</TabsTrigger>
            <TabsTrigger value="advanced">Avançado</TabsTrigger>
          </TabsList>

          <TabsContent value="semantic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Especialidades */}
              <div className="bg-white rounded-lg p-3 border">
                <label className="font-medium text-gray-700 mb-2 block">Especialidades</label>
                <div className="flex flex-wrap gap-1">
                  {specialties.slice(0, 6).map((spec) => (
                    <Badge
                      key={spec.id}
                      variant={filters.specialty === spec.name ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => onFiltersChange({ 
                        ...filters, 
                        specialty: filters.specialty === spec.name ? "" : spec.name 
                      })}
                    >
                      {spec.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Modalidades */}
              <div className="bg-white rounded-lg p-3 border">
                <label className="font-medium text-gray-700 mb-2 block">Modalidades</label>
                <div className="flex flex-wrap gap-1">
                  {modalities.slice(0, 4).map((mod) => (
                    <Badge
                      key={mod.value}
                      variant={filters.modality === mod.value ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => onFiltersChange({ 
                        ...filters, 
                        modality: filters.modality === mod.value ? "" : mod.value 
                      })}
                    >
                      {mod.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="context" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contexto Clínico */}
              <div className="bg-white rounded-lg p-3 border">
                <label className="font-medium text-gray-700 mb-2 block">Contexto Clínico</label>
                <div className="space-y-2">
                  {contextOptions.map((context) => {
                    const Icon = context.icon;
                    return (
                      <Button
                        key={context.value}
                        variant={filters.context === context.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => onFiltersChange({ 
                          ...filters, 
                          context: filters.context === context.value ? "" : context.value 
                        })}
                        className="w-full justify-start gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {context.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Raridade */}
              <div className="bg-white rounded-lg p-3 border">
                <label className="font-medium text-gray-700 mb-2 block">Raridade do Caso</label>
                <div className="space-y-2">
                  {rarityOptions.map((rarity) => (
                    <Badge
                      key={rarity.value}
                      variant="outline"
                      className={`cursor-pointer w-full justify-center py-2 ${
                        filters.rarity === rarity.value ? rarity.color : "hover:bg-gray-50"
                      }`}
                      onClick={() => onFiltersChange({ 
                        ...filters, 
                        rarity: filters.rarity === rarity.value ? "" : rarity.value 
                      })}
                    >
                      {rarity.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audience" className="space-y-4">
            <div className="bg-white rounded-lg p-3 border">
              <label className="font-medium text-gray-700 mb-3 block">Público-alvo</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {audienceOptions.map((audience) => (
                  <div
                    key={audience.value}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      filters.targetAudience === audience.value
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                    onClick={() => onFiltersChange({ 
                      ...filters, 
                      targetAudience: filters.targetAudience === audience.value ? "" : audience.value 
                    })}
                  >
                    <div className="font-medium text-gray-900">{audience.label}</div>
                    <div className="text-sm text-gray-600">{audience.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Valor Educacional */}
              <div className="bg-white rounded-lg p-3 border">
                <label className="font-medium text-gray-700 mb-2 block">Valor Educacional</label>
                <div className="flex gap-2">
                  {educationalValueOptions.map((edu) => (
                    <Badge
                      key={edu.value}
                      variant={filters.educationalValue === edu.value ? "default" : "outline"}
                      className={`cursor-pointer ${filters.educationalValue === edu.value ? edu.color : ""}`}
                      onClick={() => onFiltersChange({ 
                        ...filters, 
                        educationalValue: filters.educationalValue === edu.value ? "" : edu.value 
                      })}
                    >
                      {edu.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tempo Estimado */}
              <div className="bg-white rounded-lg p-3 border">
                <label className="font-medium text-gray-700 mb-2 block">Tempo Estimado</label>
                <div className="flex gap-2">
                  {timeOptions.map((time) => {
                    const Icon = time.icon;
                    return (
                      <Badge
                        key={time.value}
                        variant={filters.estimatedTime === time.value ? "default" : "outline"}
                        className="cursor-pointer gap-1"
                        onClick={() => onFiltersChange({ 
                          ...filters, 
                          estimatedTime: filters.estimatedTime === time.value ? "" : time.value 
                        })}
                      >
                        <Icon className="h-3 w-3" />
                        {time.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Botão de Recomendação IA */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold mb-1">Recomendações Personalizadas</h4>
              <p className="text-sm text-purple-100">
                Deixe nossa IA criar filtros baseados no seu perfil e objetivos
              </p>
            </div>
            <Button
              onClick={onAIRecommendation}
              disabled={isLoadingAI}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              {isLoadingAI ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Recomendar
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
