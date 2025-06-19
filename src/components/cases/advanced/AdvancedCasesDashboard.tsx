
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
  Timeline,
  Zap,
  Trophy,
  Star,
  Fire,
  Users,
  BookOpen,
  Activity
} from "lucide-react";
import { IntelligentKnowledgeDashboard } from "./IntelligentKnowledgeDashboard";
import { AdvancedVisualizationModes } from "./AdvancedVisualizationModes";
import { AIPersonalizationPanel } from "./AIPersonalizationPanel";
import { GamificationHub } from "./GamificationHub";
import { useCasesData } from "@/hooks/useCasesData";

export function AdvancedCasesDashboard() {
  const { casesStats, userProgress, isLoading } = useCasesData();
  const [activeMode, setActiveMode] = useState<string>("dashboard");

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-white/10 rounded-xl"></div>
        <div className="h-96 bg-white/10 rounded-xl"></div>
      </div>
    );
  }

  const modes = [
    {
      id: "dashboard",
      label: "Dashboard Inteligente",
      icon: Activity,
      description: "Análise completa do seu progresso"
    },
    {
      id: "timeline",
      label: "Timeline View",
      icon: Timeline,
      description: "Visualização cronológica"
    },
    {
      id: "knowledge-map",
      label: "Mapa do Conhecimento",
      icon: Map,
      description: "Conexões entre casos"
    },
    {
      id: "kanban",
      label: "Kanban Board",
      icon: Grid3x3,
      description: "Organização por status"
    },
    {
      id: "ai-companion",
      label: "IA Personalizada",
      icon: Brain,
      description: "Assistente inteligente"
    },
    {
      id: "gamification",
      label: "Hub Gamificado",
      icon: Trophy,
      description: "Conquistas e desafios"
    }
  ];

  const quickStats = [
    {
      label: "Streak Atual",
      value: userProgress?.currentStreak || 0,
      icon: Fire,
      color: "text-orange-500",
      bgColor: "bg-orange-100"
    },
    {
      label: "Casos Esta Semana",
      value: userProgress?.weeklyProgress || 0,
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-100"
    },
    {
      label: "Precisão Média",
      value: `${userProgress?.accuracy || 0}%`,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-100"
    },
    {
      label: "Nível Atual",
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
    <div className="space-y-6">
      {/* Header com estatísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-cyan-200">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seletor de modos de visualização */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Modos de Visualização Avançados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {modes.map((mode) => (
              <Button
                key={mode.id}
                variant={activeMode === mode.id ? "default" : "outline"}
                className={`flex flex-col h-auto p-4 ${
                  activeMode === mode.id 
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-none" 
                    : "bg-white/10 border-white/30 text-white hover:bg-white/20"
                }`}
                onClick={() => setActiveMode(mode.id)}
              >
                <mode.icon className="h-6 w-6 mb-2" />
                <span className="text-xs font-medium text-center">{mode.label}</span>
                <span className="text-xs opacity-70 text-center mt-1">{mode.description}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo do modo ativo */}
      <div className="min-h-[600px]">
        {renderActiveMode()}
      </div>
    </div>
  );
}
