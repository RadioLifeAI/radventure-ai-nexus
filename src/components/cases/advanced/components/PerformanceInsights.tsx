
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Target, Clock, Award, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { RealUserStats } from "@/hooks/useRealUserStats";

interface Props {
  stats: RealUserStats;
}

export function PerformanceInsights({ stats }: Props) {
  // Gerar insights baseados nos dados reais disponíveis
  const generateInsights = () => {
    const insights = [];
    
    // Insight de precisão
    if (stats.accuracy >= 90) {
      insights.push({
        type: 'strength',
        title: 'Excelente Precisão',
        description: `Mantendo ${stats.accuracy}% de acertos - performance excepcional!`,
        trend: 'up',
        value: stats.accuracy
      });
    } else if (stats.accuracy >= 70) {
      insights.push({
        type: 'improvement',
        title: 'Boa Precisão',
        description: `${stats.accuracy}% de acertos - continue assim para melhorar ainda mais!`,
        trend: 'stable',
        value: stats.accuracy
      });
    } else {
      insights.push({
        type: 'improvement',
        title: 'Foco na Precisão',
        description: `${stats.accuracy}% de acertos - revisite os casos para melhorar!`,
        trend: 'down',
        value: stats.accuracy
      });
    }
    
    // Insight de atividade
    if (stats.currentStreak >= 7) {
      insights.push({
        type: 'streak',
        title: `Streak Incrível!`,
        description: `${stats.currentStreak} dias consecutivos de estudos!`,
        trend: 'up',
        value: stats.currentStreak
      });
    }
    
    // Insight de pontos
    if (stats.totalPoints >= 1000) {
      insights.push({
        type: 'milestone',
        title: 'Marco de Pontos',
        description: `${stats.totalPoints.toLocaleString()} pontos conquistados!`,
        trend: 'up',
        value: stats.totalPoints
      });
    }
    
    // Insight de revisões
    if (stats.reviewCases > 0) {
      insights.push({
        type: 'improvement',
        title: 'Estudos de Revisão',
        description: `${stats.reviewCases} casos revisados para reforçar o aprendizado`,
        trend: 'stable',
        value: stats.reviewCases
      });
    }
    
    return insights;
  };

  const performanceInsights = generateInsights();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-400" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-400" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'strength': return 'text-green-400';
      case 'improvement': return 'text-orange-400'; 
      case 'streak': return 'text-blue-400';
      case 'milestone': return 'text-purple-400';
      default: return 'text-cyan-200';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength': return TrendingUp;
      case 'improvement': return Target;
      case 'streak': return Clock;
      case 'milestone': return Award;
      default: return Brain;
    }
  };

  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="h-5 w-5 text-purple-400" />
          Insights de Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {performanceInsights.map((insight, index) => {
            const IconComponent = getInsightIcon(insight.type);
            return (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="p-2 rounded-full bg-white/10 border border-white/20">
                  <IconComponent className={`h-4 w-4 ${getInsightColor(insight.type)}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white">{insight.title}</h4>
                    {insight.trend && getTrendIcon(insight.trend)}
                    {insight.value && (
                      <Badge variant="outline" className="text-xs border-cyan-400/30 text-cyan-200">
                        {insight.value}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-cyan-200 mt-1">{insight.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
