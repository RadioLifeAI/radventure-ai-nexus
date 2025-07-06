import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Users, Target, TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface AnalyticsData {
  total_questions: number;
  approved_questions: number;
  pending_questions: number;
  published_questions: number;
  avg_confidence: number;
  total_responses: number;
  correct_responses: number;
  accuracy_rate: number;
  weekly_generated: number;
  monthly_generated: number;
  pool_health: 'excellent' | 'good' | 'warning' | 'critical';
}

export function ChallengeAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const daysAgo = parseInt(dateRange);
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - daysAgo);
      
      const { data, error } = await supabase.rpc('get_challenge_analytics_unified', {
        p_historical: true,
        p_date_from: fromDate.toISOString().split('T')[0],
        p_date_to: new Date().toISOString().split('T')[0]
      });

      if (error) throw error;
      setAnalytics(data as unknown as AnalyticsData || null);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-center p-8 text-gray-500">Dados não disponíveis</div>;
  }

  const getPoolHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPoolHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />;
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Período de Análise */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Analytics dos Desafios</h3>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status do Pool */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Status do Pool de Questões
            <Badge className={`${getPoolHealthColor(analytics.pool_health)} px-2 py-1`}>
              {getPoolHealthIcon(analytics.pool_health)}
              {analytics.pool_health.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.approved_questions}</div>
              <p className="text-sm text-muted-foreground">Aprovadas</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{analytics.pending_questions}</div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analytics.published_questions}</div>
              <p className="text-sm text-muted-foreground">Publicadas</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(analytics.avg_confidence * 100)}%</div>
              <p className="text-sm text-muted-foreground">Confiança Média</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Questões</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_questions}</div>
            <p className="text-xs text-muted-foreground">No período selecionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Respostas Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_responses}</div>
            <p className="text-xs text-muted-foreground">Usuários responderam</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Acerto</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.accuracy_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.correct_responses} de {analytics.total_responses} corretas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geração Semanal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.weekly_generated}</div>
            <p className="text-xs text-muted-foreground">Questões esta semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas de Produção */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Produção</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Geração de Questões</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Esta semana:</span>
                  <span className="font-medium">{analytics.weekly_generated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Este mês:</span>
                  <span className="font-medium">{analytics.monthly_generated}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Qualidade do Pool</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant="outline" className={getPoolHealthColor(analytics.pool_health)}>
                    {analytics.pool_health.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Confiança média:</span>
                  <span className="font-medium">{Math.round(analytics.avg_confidence * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo de Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Performance Global</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold">Taxa de Aprovação</div>
              <div className="text-2xl font-bold text-green-600">
                {analytics.total_questions > 0 
                  ? ((analytics.approved_questions / analytics.total_questions) * 100).toFixed(1)
                  : '0'
                }%
              </div>
              <p className="text-xs text-muted-foreground">Questões aprovadas</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">Taxa de Acerto Geral</div>
              <div className="text-2xl font-bold text-blue-600">
                {analytics.accuracy_rate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Usuários acertam</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">Engajamento</div>
              <div className="text-2xl font-bold text-purple-600">
                {analytics.total_responses}
              </div>
              <p className="text-xs text-muted-foreground">Respostas totais</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}