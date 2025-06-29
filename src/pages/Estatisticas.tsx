
import React from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useRealUserStats } from "@/hooks/useRealUserStats";
import { 
  BarChart3, 
  ArrowLeft, 
  Trophy, 
  Target, 
  Zap, 
  Award,
  TrendingUp,
  Calendar,
  Brain
} from "lucide-react";
import { WeeklyActivityChart } from "@/components/cases/advanced/components/WeeklyActivityChart";
import { SpecialtyPerformance } from "@/components/cases/advanced/components/SpecialtyPerformance";
import { RecentAchievements } from "@/components/cases/advanced/components/RecentAchievements";
import { PerformanceInsights } from "@/components/cases/advanced/components/PerformanceInsights";

export default function Estatisticas() {
  const navigate = useNavigate();
  const { stats, isLoading } = useRealUserStats();

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <HeaderNav />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando suas estatísticas...</p>
          </div>
        </div>
      </div>
    );
  }

  const overviewStats = [
    {
      title: "Total de Casos",
      value: stats.totalCases,
      icon: Trophy,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Precisão",
      value: `${stats.accuracy}%`,
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Pontos Totais",
      value: stats.totalPoints.toLocaleString(),
      icon: Zap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    },
    {
      title: "Sequência Atual",
      value: stats.currentStreak,
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <HeaderNav />
      
      <main className="px-4 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900 mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                Suas Estatísticas
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Dados Reais
                </Badge>
              </h1>
              <p className="text-gray-600 mt-2">
                Análise completa do seu desempenho e progresso
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate('/app/criar-jornada')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Brain className="h-4 w-4 mr-2" />
                Criar Jornada IA
              </Button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewStats.map((stat, index) => (
              <Card key={index} className={`${stat.bgColor} border-2 ${stat.borderColor}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Insights de Performance */}
          <PerformanceInsights stats={stats} />

          {/* Atividade Semanal */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Atividade dos Últimos 7 Dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyActivityChart stats={stats} />
            </CardContent>
          </Card>

          {/* Performance por Especialidade */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Performance por Especialidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SpecialtyPerformance stats={stats} />
            </CardContent>
          </Card>

          {/* Conquistas Recentes */}
          {stats.recentAchievements.length > 0 && (
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Conquistas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecentAchievements stats={stats} />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
