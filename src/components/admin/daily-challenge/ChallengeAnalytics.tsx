import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Users, Target, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AnalyticsData {
  total_questions: number;
  total_responses: number;
  correct_responses: number;
  engagement_rate: number;
  avg_response_time: number;
  daily_stats: Array<{
    date: string;
    responses: number;
    correct: number;
    accuracy: number;
  }>;
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
      
      const { data, error } = await supabase.rpc('get_challenge_analytics', {
        p_date_from: fromDate.toISOString().split('T')[0],
        p_date_to: new Date().toISOString().split('T')[0]
      });

      if (error) throw error;
      setAnalytics(data as AnalyticsData);
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

  const accuracyRate = analytics.total_responses > 0 
    ? ((analytics.correct_responses / analytics.total_responses) * 100).toFixed(1)
    : '0';

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

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Questões</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_questions}</div>
            <p className="text-xs text-muted-foreground">Questões publicadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Respostas Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_responses}</div>
            <p className="text-xs text-muted-foreground">No período selecionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Acerto</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accuracyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.correct_responses} de {analytics.total_responses} corretas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Engajamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.engagement_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">Usuários que participaram</p>
          </CardContent>
        </Card>
      </div>

      {/* Tempo Médio de Resposta */}
      {analytics.avg_response_time && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tempo Médio de Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-center">
              {Math.round(analytics.avg_response_time)} segundos
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Atividade Diária */}
      {analytics.daily_stats && analytics.daily_stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Atividade Diária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.daily_stats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: '2-digit' 
                    })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                    formatter={(value, name) => [
                      value,
                      name === 'responses' ? 'Respostas' :
                      name === 'correct' ? 'Corretas' : 'Taxa de Acerto (%)'
                    ]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="responses" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Respostas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="correct" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                    name="Corretas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Taxa de Acerto */}
      {analytics.daily_stats && analytics.daily_stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Acerto por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.daily_stats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: '2-digit' 
                    })}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                    formatter={(value) => [`${value}%`, 'Taxa de Acerto']}
                  />
                  <Bar 
                    dataKey="accuracy" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo de Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold">Melhor Taxa de Acerto</div>
              <div className="text-2xl font-bold text-green-600">
                {analytics.daily_stats && analytics.daily_stats.length > 0
                  ? Math.max(...analytics.daily_stats.map(d => d.accuracy)).toFixed(1)
                  : '0'
                }%
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">Pior Taxa de Acerto</div>
              <div className="text-2xl font-bold text-red-600">
                {analytics.daily_stats && analytics.daily_stats.length > 0
                  ? Math.min(...analytics.daily_stats.map(d => d.accuracy)).toFixed(1)
                  : '0'
                }%
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">Média Geral</div>
              <div className="text-2xl font-bold text-blue-600">
                {analytics.daily_stats && analytics.daily_stats.length > 0
                  ? (analytics.daily_stats.reduce((acc, d) => acc + d.accuracy, 0) / analytics.daily_stats.length).toFixed(1)
                  : '0'
                }%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}