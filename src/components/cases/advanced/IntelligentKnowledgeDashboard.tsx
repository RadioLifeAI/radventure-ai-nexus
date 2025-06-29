
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Target,
  TrendingUp,
  Activity,
  Zap,
  BookOpen,
  Clock,
  Award,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { useRealUserStats } from "@/hooks/useRealUserStats";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

interface Props {
  userProgress: any;
  casesStats: any;
}

export function IntelligentKnowledgeDashboard({ userProgress, casesStats }: Props) {
  const { stats: realStats, isLoading } = useRealUserStats();

  if (isLoading || !realStats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-white/10 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-white/10 rounded-xl"></div>
          <div className="h-32 bg-white/10 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-400" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-400" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'strength': return 'text-green-500';
      case 'improvement': return 'text-orange-500'; 
      case 'streak': return 'text-blue-500';
      case 'milestone': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength': return TrendingUp;
      case 'improvement': return Target;
      case 'streak': return Clock;
      case 'milestone': return Award;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-200">Casos Resolvidos</p>
                <p className="text-2xl font-bold text-white">{realStats.totalCases}</p>
              </div>
              <BookOpen className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-200">Precisão</p>
                <p className="text-2xl font-bold text-white">{realStats.accuracy}%</p>
              </div>
              <Target className="h-8 w-8 text-green-400" />
            </div>
            <div className="mt-2">
              <Progress value={realStats.accuracy} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-200">Pontos Totais</p>
                <p className="text-2xl font-bold text-white">{realStats.totalPoints.toLocaleString()}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-200">Sequência Atual</p>
                <p className="text-2xl font-bold text-white">{realStats.currentStreak}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            Insights de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {realStats.performanceInsights.map((insight, index) => {
              const IconComponent = getInsightIcon(insight.type);
              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <div className={`p-2 rounded-full bg-white/10`}>
                    <IconComponent className={`h-4 w-4 ${getInsightColor(insight.type)}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">{insight.title}</h4>
                      {insight.trend && getTrendIcon(insight.trend)}
                      {insight.value && (
                        <Badge className="text-xs">
                          {insight.value}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-cyan-100 mt-1">{insight.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Atividade Semanal */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400" />
            Atividade dos Últimos 7 Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={realStats.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                  tick={{ fill: '#ffffff', fontSize: 12 }}
                />
                <YAxis tick={{ fill: '#ffffff', fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                  formatter={(value, name) => [value, name === 'cases' ? 'Casos' : 'Pontos']}
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cases" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="points" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance por Especialidade */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-green-400" />
            Performance por Especialidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {realStats.specialtyBreakdown.slice(0, 6).map((specialty, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">{specialty.specialty}</span>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={specialty.accuracy >= 80 ? "default" : specialty.accuracy >= 60 ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {specialty.accuracy}%
                    </Badge>
                    <span className="text-sm text-cyan-200">
                      {specialty.cases} casos
                    </span>
                  </div>
                </div>
                <Progress 
                  value={specialty.accuracy} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conquistas Recentes */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-400" />
            Conquistas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {realStats.recentAchievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-300/30">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{achievement.name}</h4>
                  <p className="text-sm text-yellow-100">{achievement.description}</p>
                  <p className="text-xs text-yellow-200 mt-1">
                    {new Date(achievement.earnedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
