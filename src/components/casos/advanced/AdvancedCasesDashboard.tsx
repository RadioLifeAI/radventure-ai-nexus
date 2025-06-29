
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Target,
  TrendingUp,
  Calendar,
  Map,
  Grid3x3,
  Clock,
  Zap,
  Trophy,
  Star,
  Flame,
  Users,
  BookOpen,
  Activity
} from "lucide-react";
import { IntelligentKnowledgeDashboard } from "./IntelligentKnowledgeDashboard";
import { AdvancedVisualizationModes } from "./AdvancedVisualizationModes";
import { AIPersonalizationPanel } from "./AIPersonalizationPanel";
import { GamificationHub } from "./GamificationHub";
import { useCasesData } from "@/hooks/useCasesData";
import { useIsMobile } from "@/hooks/use-mobile";

export function AdvancedCasesDashboard() {
  const { casesStats, userProgress, isLoading } = useCasesData();
  const [activeMode, setActiveMode] = useState<string>("dashboard");
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-pulse">
        <div className="h-24 sm:h-32 bg-white/20 rounded-xl shadow-md"></div>
        <div className="h-64 sm:h-96 bg-white/20 rounded-xl shadow-md"></div>
      </div>
    );
  }

  const modes = [
    {
      id: "dashboard",
      label: isMobile ? "Dashboard" : "Dashboard Inteligente",
      icon: Activity,
      description: "Análise completa do seu progresso"
    },
    {
      id: "timeline",
      label: isMobile ? "Timeline" : "Timeline View",
      icon: Clock,
      description: "Visualização cronológica"
    },
    {
      id: "knowledge-map",
      label: isMobile ? "Mapa" : "Mapa do Conhecimento",
      icon: Map,
      description: "Conexões entre casos"
    },
    {
      id: "kanban",
      label: isMobile ? "Kanban" : "Kanban Board",
      icon: Grid3x3,
      description: "Organização por status"
    },
    {
      id: "ai-companion",
      label: isMobile ? "IA" : "IA Personalizada",
      icon: Brain,
      description: "Assistente inteligente"
    },
    {
      id: "gamification",
      label: isMobile ? "Conquistas" : "Hub Gamificado",
      icon: Trophy,
      description: "Conquistas e desafios"
    }
  ];

  const quickStats = [
    {
      label: "Streak Atual",
      value: Math.floor(Math.random() * 20) + 5,
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-100"
    },
    {
      label: isMobile ? "Casos" : "Casos Esta Semana",
      value: Math.floor(Math.random() * 15) + 3,
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-100"
    },
    {
      label: isMobile ? "Precisão" : "Precisão Média",
      value: `${userProgress?.accuracy || 0}%`,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-100"
    },
    {
      label: isMobile ? "Nível" : "Nível Atual",
      value: Math.floor((userProgress?.totalPoints || 0) / 100) + 1,
      icon: Star,
      color: "text-purple-500",
      bgColor: "bg-purple-100"
    }
  ];

  const renderActiveMode = () => {
    switch (activeMode) {
      case "dashboard":
        return <IntelligentKnowledgeDashboard userProgress={userProgress} casesStats={casesStats} />;
      case "timeline":
      case "knowledge-map":
      case "kanban":
        return <AdvancedVisualizationModes mode={activeMode} />;
      case "ai-companion":
        return <AIPersonalizationPanel userProgress={userProgress} />;
      case "gamification":
        return <GamificationHub userProgress={userProgress} />;
      default:
        return <IntelligentKnowledgeDashboard userProgress={userProgress} casesStats={casesStats} />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header com estatísticas rápidas - Otimizado para Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all shadow-md">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-cyan-700 truncate">{stat.label}</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor} flex-shrink-0`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seletor de modos de visualização - Otimizado para Mobile */}
      <Card className="bg-white/20 backdrop-blur-sm border-white/30 shadow-md">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-gray-900 flex items-center gap-2 text-base sm:text-lg">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
            {isMobile ? "Modos de Visualização" : "Modos de Visualização Avançados"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            // Layout compacto para mobile - Grid vertical
            <div className="grid grid-cols-2 gap-2">
              {modes.map((mode) => (
                <Button
                  key={mode.id}
                  variant={activeMode === mode.id ? "default" : "outline"}
                  className={`flex flex-col h-auto p-3 text-xs ${
                    activeMode === mode.id 
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-none shadow-md" 
                      : "bg-white/20 border-white/40 text-gray-900 hover:bg-white/30"
                  }`}
                  onClick={() => setActiveMode(mode.id)}
                >
                  <mode.icon className="h-5 w-5 mb-1" />
                  <span className="font-medium text-center leading-tight">{mode.label}</span>
                </Button>
              ))}
            </div>
          ) : (
            // Layout original para desktop/tablet
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {modes.map((mode) => (
                <Button
                  key={mode.id}
                  variant={activeMode === mode.id ? "default" : "outline"}
                  className={`flex flex-col h-auto p-4 ${
                    activeMode === mode.id 
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-none shadow-md" 
                      : "bg-white/20 border-white/40 text-gray-900 hover:bg-white/30"
                  }`}
                  onClick={() => setActiveMode(mode.id)}
                >
                  <mode.icon className="h-6 w-6 mb-2" />
                  <span className="text-xs font-medium text-center">{mode.label}</span>
                  <span className="text-xs opacity-70 text-center mt-1">{mode.description}</span>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conteúdo do modo ativo */}
      <div className="min-h-[400px] sm:min-h-[600px]">
        {renderActiveMode()}
      </div>
    </div>
  );
}
