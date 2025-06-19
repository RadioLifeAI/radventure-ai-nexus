
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Target,
  TrendingUp,
  Activity,
  Radar,
  Zap,
  BookOpen,
  Clock,
  Award
} from "lucide-react";

interface Props {
  userProgress: any;
  casesStats: any;
}

export function IntelligentKnowledgeDashboard({ userProgress, casesStats }: Props) {
  const competencyData = [
    { specialty: "Neurorradiologia", progress: 85, cases: 45, accuracy: 92 },
    { specialty: "Radiologia Torácica", progress: 72, cases: 38, accuracy: 88 },
    { specialty: "Radiologia Abdominal", progress: 91, cases: 52, accuracy: 95 },
    { specialty: "Musculoesquelética", progress: 68, cases: 29, accuracy: 85 },
    { specialty: "Radiologia Pediátrica", progress: 45, cases: 18, accuracy: 78 }
  ];

  const modalityProgress = [
    { modality: "TC", progress: 88, icon: "🧠" },
    { modality: "RM", progress: 76, icon: "🔍" },
    { modality: "RX", progress: 92, icon: "📸" },
    { modality: "US", progress: 64, icon: "🌊" },
    { modality: "PET", progress: 52, icon: "⚡" }
  ];

  const learningInsights = [
    {
      type: "strength",
      title: "Forte em TC Torácica",
      description: "95% de acerto nos últimos 20 casos",
      icon: TrendingUp,
      color: "text-green-500"
    },
    {
      type: "improvement",
      title: "Foco em RM Neurológica",
      description: "Área com maior potencial de crescimento",
      icon: Target,
      color: "text-orange-500"
    },
    {
      type: "achievement",
      title: "Streak de 15 dias!",
      description: "Parabéns pela consistência",
      icon: Award,
      color: "text-purple-500"
    }
  ];

  const getCompetencyColor = (progress: number) => {
    if (progress >= 90) return "from-green-500 to-emerald-600";
    if (progress >= 75) return "from-blue-500 to-cyan-600";
    if (progress >= 60) return "from-yellow-500 to-orange-600";
    return "from-red-500 to-pink-600";
  };

  return (
    <div className="space-y-6">
      {/* Knowledge Heatmap */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-cyan-400" />
            Mapa de Conhecimento - Radar de Competências
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {competencyData.map((comp, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">{comp.specialty}</span>
                  <Badge variant="outline" className="text-xs border-cyan-300 text-cyan-300">
                    {comp.cases} casos
                  </Badge>
                  <Badge variant="outline" className="text-xs border-green-300 text-green-300">
                    {comp.accuracy}% precisão
                  </Badge>
                </div>
                <span className="text-cyan-200 font-semibold">{comp.progress}%</span>
              </div>
              <div className="relative">
                <Progress value={comp.progress} className="h-3 bg-white/20" />
                <div 
                  className={`absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r ${getCompetencyColor(comp.progress)}`}
                  style={{ width: `${comp.progress}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progresso por Modalidade */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Radar className="h-5 w-5 text-purple-400" />
              Domínio por Modalidade de Imagem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {modalityProgress.map((modality, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="text-2xl">{modality.icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-medium">{modality.modality}</span>
                    <span className="text-cyan-200">{modality.progress}%</span>
                  </div>
                  <Progress value={modality.progress} className="h-2 bg-white/20" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Insights de Aprendizado */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Insights Inteligentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {learningInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                <insight.icon className={`h-5 w-5 ${insight.color} mt-0.5`} />
                <div>
                  <h4 className="text-white font-medium text-sm">{insight.title}</h4>
                  <p className="text-cyan-200 text-xs mt-1">{insight.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Performance Preditiva */}
      <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-purple-300/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-pink-400" />
            Analytics Preditivos - Próximos Passos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {Math.round((userProgress?.accuracy || 80) + 5)}%
              </div>
              <p className="text-pink-200 text-sm">Precisão Projetada</p>
              <p className="text-pink-300 text-xs">+5% esta semana</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {Math.round((userProgress?.totalPoints || 500) * 1.2)}
              </div>
              <p className="text-pink-200 text-sm">Pontos no Próximo Nível</p>
              <p className="text-pink-300 text-xs">12 casos para alcançar</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">7</div>
              <p className="text-pink-200 text-sm">Dias para Meta</p>
              <p className="text-pink-300 text-xs">Mantendo ritmo atual</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
