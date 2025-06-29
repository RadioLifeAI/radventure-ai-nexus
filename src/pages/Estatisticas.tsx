
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
      <div className="min-h-screen bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6]">
        <HeaderNav />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-cyan-100">Carregando suas estatísticas...</p>
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
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-400/30"
    },
    {
      title: "Precisão",
      value: `${stats.accuracy}%`,
      icon: Target,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-400/30"
    },
    {
      title: "Pontos Totais",
      value: stats.totalPoints.toLocaleString(),
      icon: Zap,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
      borderColor: "border-yellow-400/30"
    },
    {
      title: "Sequência Atual",
      value: stats.currentStreak,
      icon: Award,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-400/30"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      
      <main className="px-4 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="text-cyan-200 hover:text-white hover:bg-white/10 mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-cyan-400" />
                Suas Estatísticas
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                  Dados Reais
                </Badge>
              </h1>
              <p className="text-cyan-100 mt-2">
                Análise completa do seu desempenho e progresso
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate('/app/jornada/criar')}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
              >
                <Brain className="h-4 w-4 mr-2" />
                Criar Jornada IA
              </Button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewStats.map((stat, index) => (
              <Card key={index} className={`${stat.bgColor} border ${stat.borderColor} bg-white/10 backdrop-blur-sm`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-cyan-100">
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
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <PerformanceInsights stats={stats} />
          </div>

          {/* Atividade Semanal */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5 text-cyan-400" />
                Atividade dos Últimos 7 Dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyActivityChart stats={stats} />
            </CardContent>
          </Card>

          {/* Performance por Especialidade */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Performance por Especialidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SpecialtyPerformance stats={stats} />
            </CardContent>
          </Card>

          {/* Conquistas Recentes */}
          {stats.recentAchievements.length > 0 && (
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Award className="h-5 w-5 text-yellow-400" />
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
