
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, Server, Database, Zap, AlertTriangle, 
  CheckCircle, Clock, TrendingUp, Users, HardDrive
} from "lucide-react";

export function SystemMonitoring() {
  // Temporariamente removido verificação de permissão principal
  // Componente agora acessível sem restrições para implementação

  // Query para métricas do sistema
  const { data: systemMetrics } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      // Simular métricas (em produção, viria de APIs de monitoramento)
      return {
        uptime: '99.8%',
        responseTime: 156,
        activeUsers: 1247,
        databaseConnections: 23,
        memoryUsage: 68,
        cpuUsage: 34,
        diskUsage: 42,
        errorRate: 0.1,
        throughput: 1250
      };
    },
    refetchInterval: 30000 // Atualiza a cada 30 segundos
  });

  // Query para logs de sistema
  const { data: systemLogs } = useQuery({
    queryKey: ['system-logs'],
    queryFn: async () => {
      // Em produção, viria de sistemas de log centralizados
      return [
        {
          id: '1',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          level: 'info',
          service: 'api-gateway',
          message: 'Request processed successfully',
          details: { responseTime: 120, userId: 'user123' }
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 1000 * 60 * 10),
          level: 'warning',
          service: 'ai-tutor',
          message: 'High response time detected',
          details: { responseTime: 2500, model: 'gpt-4o-mini' }
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          level: 'error',
          service: 'database',
          message: 'Connection timeout',
          details: { query: 'SELECT * FROM medical_cases', timeout: 5000 }
        }
      ];
    },
    refetchInterval: 10000 // Atualiza a cada 10 segundos
  });

  const getStatusColor = (value: number, thresholds: { warning: number, danger: number }) => {
    if (value >= thresholds.danger) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getLogLevelBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">Warning</Badge>;
      case 'info':
        return <Badge variant="secondary">Info</Badge>;
      default:
        return <Badge>{level}</Badge>;
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
            <div className="text-2xl font-bold text-green-400">{systemMetrics?.uptime}</div>
            <div className="text-slate-300">Uptime</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getStatusColor(systemMetrics?.responseTime || 0, { warning: 200, danger: 500 })}`}>
                  {systemMetrics?.responseTime}ms
                </div>
                <p className="text-xs text-gray-600">Média dos últimos 5min</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {systemMetrics?.activeUsers?.toLocaleString()}
                </div>
                <p className="text-xs text-gray-600">Online agora</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Uso de CPU</CardTitle>
                <Server className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getStatusColor(systemMetrics?.cpuUsage || 0, { warning: 70, danger: 90 })}`}>
                  {systemMetrics?.cpuUsage}%
                </div>
                <p className="text-xs text-gray-600">Média dos servidores</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Uso de Memória</CardTitle>
                <HardDrive className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getStatusColor(systemMetrics?.memoryUsage || 0, { warning: 80, danger: 95 })}`}>
                  {systemMetrics?.memoryUsage}%
                </div>
                <p className="text-xs text-gray-600">RAM utilizada</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Conexões DB</CardTitle>
                <Database className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {systemMetrics?.databaseConnections}
                </div>
                <p className="text-xs text-gray-600">Conexões ativas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getStatusColor(systemMetrics?.errorRate || 0, { warning: 1, danger: 5 })}`}>
                  {systemMetrics?.errorRate}%
                </div>
                <p className="text-xs text-gray-600">Últimas 24h</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Throughput</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {systemMetrics?.throughput}
                </div>
                <p className="text-xs text-gray-600">Requests/min</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  Saudável
                </div>
                <p className="text-xs text-gray-600">Todos os serviços</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Métricas de Performance
              </CardTitle>
              <CardDescription>
                Gráficos e análises detalhadas de performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-12">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Dashboard de Performance</h3>
                <p>Gráficos de CPU, memória, rede e latência serão exibidos aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Logs do Sistema
              </CardTitle>
              <CardDescription>
                Logs em tempo real de todos os serviços
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemLogs?.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getLogLevelBadge(log.level)}
                        <span className="font-medium">{log.service}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {log.timestamp.toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm">{log.message}</p>
                    {log.details && (
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Sistema de Alertas
              </CardTitle>
              <CardDescription>
                Configuração e histórico de alertas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-12">
                <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Sistema de Alertas</h3>
                <p>Configuração de thresholds e notificações será implementada aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
