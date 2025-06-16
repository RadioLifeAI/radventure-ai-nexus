
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Zap, AlertTriangle, TrendingUp } from "lucide-react";
import { SystemMetrics } from "./monitoring/SystemMetrics";
import { SystemLogs } from "./monitoring/SystemLogs";

export function SystemMonitoring() {
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
          <SystemMetrics metrics={systemMetrics} />
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
          <SystemLogs logs={systemLogs || []} />
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
