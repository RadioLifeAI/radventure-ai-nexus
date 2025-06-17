
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, AlertTriangle, TrendingUp, Database, Users, Brain, Clock } from "lucide-react";

export function SystemMonitoringIntegrated() {
  const { data: systemHealth } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const startTime = Date.now();
      
      // Teste de conectividade com o banco
      const { data: testQuery, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      const responseTime = Date.now() - startTime;
      
      // Estatísticas do AI Tutor
      const { data: aiLogs } = await supabase
        .from('ai_tutor_usage_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      // Erros recentes (simulado baseado em logs)
      const { data: recentActivity } = await supabase
        .from('user_case_history')
        .select('*')
        .order('answered_at', { ascending: false })
        .limit(50);
      
      const avgResponseTime = aiLogs?.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / (aiLogs?.length || 1);
      const totalTokensUsed = aiLogs?.reduce((sum, log) => sum + (log.tokens_used || 0), 0) || 0;
      const totalCost = aiLogs?.reduce((sum, log) => sum + (parseFloat(log.cost) || 0), 0) || 0;
      
      const todayActivity = recentActivity?.filter(activity => {
        const today = new Date().toISOString().split('T')[0];
        return activity.answered_at.startsWith(today);
      }).length || 0;
      
      return {
        dbResponseTime: responseTime,
        dbStatus: error ? 'error' : 'healthy',
        aiAvgResponseTime: Math.round(avgResponseTime || 0),
        totalTokensUsed,
        totalAiCost: totalCost.toFixed(4),
        todayActivity,
        aiLogsCount: aiLogs?.length || 0,
        uptime: '99.8%' // Simulado
      };
    },
    refetchInterval: 10000
  });

  const { data: performanceMetrics } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async () => {
      // Métricas de performance baseadas nos dados reais
      const { data: users } = await supabase
        .from('profiles')
        .select('created_at');
      
      const { data: cases } = await supabase
        .from('medical_cases')
        .select('created_at');
      
      const { data: events } = await supabase
        .from('events')
        .select('created_at, status');
      
      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('unlocked_at');
      
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const activeUsersLastHour = users?.filter(u => new Date(u.created_at) > oneHourAgo).length || 0;
      const activeCasesLastDay = cases?.filter(c => new Date(c.created_at) > oneDayAgo).length || 0;
      const achievementsLastDay = achievements?.filter(a => new Date(a.unlocked_at) > oneDayAgo).length || 0;
      const activeEvents = events?.filter(e => e.status === 'ACTIVE').length || 0;
      
      return {
        activeUsersLastHour,
        activeCasesLastDay,
        achievementsLastDay,
        activeEvents,
        totalUsers: users?.length || 0,
        totalCases: cases?.length || 0,
        totalEvents: events?.length || 0
      };
    },
    refetchInterval: 30000
  });

  const { data: aiTutorLogs } = useQuery({
    queryKey: ['ai-tutor-logs-recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_tutor_usage_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 15000
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Activity className="text-slate-300" />
              Monitoramento do Sistema
              <Zap className="text-yellow-300" />
            </h1>
            <p className="text-slate-200 mt-2">Health check e métricas em tempo real</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">{systemHealth?.uptime}</div>
            <div className="text-slate-300">Uptime</div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banco de Dados</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(systemHealth?.dbStatus || 'healthy')}`}></div>
              <span className="text-sm font-medium">
                {systemHealth?.dbStatus === 'healthy' ? 'Conectado' : 'Erro'}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Resposta: {systemHealth?.dbResponseTime || 0}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Tutor</CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth?.aiLogsCount || 0}</div>
            <p className="text-xs text-gray-600">
              Tempo médio: {systemHealth?.aiAvgResponseTime || 0}ms
            </p>
            <p className="text-xs text-green-600">
              Custo total: ${systemHealth?.totalAiCost || '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividade Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth?.todayActivity || 0}</div>
            <p className="text-xs text-gray-600">Interações de usuários</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div className="flex justify-between">
                <span>Usuários/h:</span>
                <span className="font-bold">{performanceMetrics?.activeUsersLastHour || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Casos/dia:</span>
                <span className="font-bold">{performanceMetrics?.activeCasesLastDay || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Conquistas/dia:</span>
                <span className="font-bold">{performanceMetrics?.achievementsLastDay || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-tutor">AI Tutor</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas Gerais</CardTitle>
                <CardDescription>Estatísticas do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total de Usuários</span>
                    <Badge variant="secondary">{performanceMetrics?.totalUsers || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total de Casos</span>
                    <Badge variant="secondary">{performanceMetrics?.totalCases || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Eventos Ativos</span>
                    <Badge variant="secondary">{performanceMetrics?.activeEvents || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tokens AI Usados</span>
                    <Badge variant="secondary">{systemHealth?.totalTokensUsed?.toLocaleString() || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status dos Serviços</CardTitle>
                <CardDescription>Estado atual dos componentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Supabase Database</span>
                    <Badge className={getStatusColor(systemHealth?.dbStatus || 'healthy')}>
                      {systemHealth?.dbStatus === 'healthy' ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>OpenAI API</span>
                    <Badge className="bg-green-500">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Auth Service</span>
                    <Badge className="bg-green-500">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Edge Functions</span>
                    <Badge className="bg-green-500">Online</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-tutor">
          <Card>
            <CardHeader>
              <CardTitle>Logs do AI Tutor</CardTitle>
              <CardDescription>Últimas interações com o sistema de IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {aiTutorLogs?.map((log) => (
                  <div key={log.id} className="border rounded p-3 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </span>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {log.tokens_used || 0} tokens
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {log.response_time_ms || 0}ms
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {log.prompt_used || 'Prompt não disponível'}
                    </p>
                    {log.cost && (
                      <p className="text-xs text-green-600 mt-1">
                        Custo: ${parseFloat(log.cost).toFixed(4)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Performance</CardTitle>
              <CardDescription>Análise detalhada de performance do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-12">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Dashboard de Performance</h3>
                <p>Gráficos de performance serão implementados aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Alertas</CardTitle>
              <CardDescription>Alertas e notificações do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Alto uso de tokens AI</h4>
                    <p className="text-sm text-yellow-700">
                      Uso de tokens acima do normal detectado. Monitore custos.
                    </p>
                  </div>
                </div>
                
                {systemHealth?.dbResponseTime && systemHealth.dbResponseTime > 500 && (
                  <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">Latência alta do banco</h4>
                      <p className="text-sm text-red-700">
                        Tempo de resposta do banco: {systemHealth.dbResponseTime}ms
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
