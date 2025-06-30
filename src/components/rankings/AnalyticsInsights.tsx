
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Award, BarChart3 } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

interface AnalyticsData {
  performanceTrend: 'up' | 'down' | 'stable';
  bestSpecialty: string;
  weakestSpecialty: string;
  progressThisWeek: number;
  rankImprovement: number;
}

export function AnalyticsInsights() {
  const { profile } = useUserProfile();

  // Mock analytics data - em produção, viria de hook específico
  const analytics: AnalyticsData = {
    performanceTrend: 'up',
    bestSpecialty: 'Radiologia Torácica',
    weakestSpecialty: 'Neuroimagem',
    progressThisWeek: 15,
    rankImprovement: 3
  };

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
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 shadow-lg animate-fade-in mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          Insights & Analytics
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Performance Trend */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={`${getTrendColor(analytics.performanceTrend)}`}>
                {getTrendIcon(analytics.performanceTrend)}
                <span className="ml-1">
                  {analytics.performanceTrend === 'up' ? 'Crescendo' : 
                   analytics.performanceTrend === 'down' ? 'Caindo' : 'Estável'}
                </span>
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              Sua performance está {analytics.performanceTrend === 'up' ? 'melhorando' : 'estável'} 
              {analytics.progressThisWeek > 0 && ` com +${analytics.progressThisWeek} pontos esta semana`}
            </p>
          </div>

          {/* Specialty Insights */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-700">Especialidades</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Melhor:</span>
                <Badge variant="outline" className="text-green-600 border-green-300">
                  {analytics.bestSpecialty}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Foco:</span>
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  {analytics.weakestSpecialty}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-white/60 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-purple-700">
              {analytics.rankImprovement > 0 ? `+${analytics.rankImprovement}` : analytics.rankImprovement}
            </div>
            <div className="text-xs text-gray-600">Posições esta semana</div>
          </div>
          
          <div className="bg-white/60 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-indigo-700">
              {profile?.total_points ? Math.round(profile.total_points / 30) : 0}
            </div>
            <div className="text-xs text-gray-600">Média diária (30d)</div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-700">Recomendação</span>
          </div>
          <p className="text-sm text-indigo-800">
            {analytics.weakestSpecialty && (
              `Foque em casos de ${analytics.weakestSpecialty} para melhorar seu ranking geral. `
            )}
            Continue praticando regularmente para manter sua sequência ativa!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
