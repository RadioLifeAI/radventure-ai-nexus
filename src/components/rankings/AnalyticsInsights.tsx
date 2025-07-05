
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Award, BarChart3, Loader2 } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRealAnalytics } from "@/hooks/useRealAnalytics";

export function AnalyticsInsights() {
  const { profile } = useUserProfile();
  const { analytics, loading } = useRealAnalytics();

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
            <span className="ml-2 text-cyan-200">Carregando analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          <div className="text-center text-cyan-200">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-cyan-400/50" />
            <p>Participe de eventos para ver suas estatísticas!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50 border-green-200';
      case 'down': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingUp className="h-4 w-4 rotate-180" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 animate-fade-in mb-4 sm:mb-6">
      <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-lg text-white">
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
          Insights & Analytics
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Performance Trend */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Badge className={`${getTrendColor(analytics.performanceTrend)} text-xs sm:text-sm w-fit`}>
                {getTrendIcon(analytics.performanceTrend)}
                <span className="ml-1">
                  {analytics.performanceTrend === 'up' ? 'Crescendo' : 
                   analytics.performanceTrend === 'down' ? 'Caindo' : 'Estável'}
                </span>
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-cyan-200">
              Sua performance está {analytics.performanceTrend === 'up' ? 'melhorando' : 'estável'} 
              {analytics.progressThisWeek > 0 && ` com +${analytics.progressThisWeek} pontos esta semana`}
            </p>
          </div>

          {/* Specialty Insights */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-400" />
              <span className="text-xs sm:text-sm font-semibold text-cyan-300">Especialidades</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-cyan-300">Melhor:</span>
                <Badge variant="outline" className="text-green-400 border-green-600/30 bg-green-500/10 text-xs truncate max-w-[120px] sm:max-w-none">
                  {analytics.bestSpecialty}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-cyan-300">Foco:</span>
                <Badge variant="outline" className="text-orange-400 border-orange-600/30 bg-orange-500/10 text-xs truncate max-w-[120px] sm:max-w-none">
                  {analytics.weakestSpecialty}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white/5 backdrop-blur-sm p-2 sm:p-3 rounded-lg text-center border border-white/10">
            <div className="text-base sm:text-lg font-bold text-cyan-400">
              {analytics.rankImprovement > 0 ? `+${analytics.rankImprovement}` : analytics.rankImprovement || 0}
            </div>
            <div className="text-xs text-cyan-300">Melhoria de ranking</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm p-2 sm:p-3 rounded-lg text-center border border-white/10">
            <div className="text-base sm:text-lg font-bold text-cyan-400">
              {analytics.averageScore || 0}
            </div>
            <div className="text-xs text-cyan-300">Score médio</div>
          </div>
        </div>

        {/* Performance Highlights */}
        <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white/5 backdrop-blur-sm p-2 sm:p-3 rounded-lg text-center border border-white/10">
            <div className="text-sm sm:text-base font-bold text-yellow-400">
              {analytics.totalRadCoinsEarned.toLocaleString()} RC
            </div>
            <div className="text-xs text-cyan-300">RadCoins ganhos</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm p-2 sm:p-3 rounded-lg text-center border border-white/10">
            <div className="text-sm sm:text-base font-bold text-purple-400">
              #{analytics.bestRank || 'N/A'}
            </div>
            <div className="text-xs text-cyan-300">Melhor posição</div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="mt-3 sm:mt-4 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-cyan-600/20">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-cyan-300">Recomendação</span>
          </div>
          <p className="text-xs sm:text-sm text-cyan-200 leading-relaxed">
            {analytics.weakestSpecialty && analytics.weakestSpecialty !== 'Nenhuma' ? (
              `Foque em casos de ${analytics.weakestSpecialty} para melhorar seu ranking geral. `
            ) : (
              'Continue praticando regularmente para melhorar suas estatísticas! '
            )}
            Participe de mais eventos para ganhar experiência!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
