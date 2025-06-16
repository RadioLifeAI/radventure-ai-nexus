
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, Server, HardDrive, Database, AlertTriangle, TrendingUp, CheckCircle } from "lucide-react";

interface SystemMetricsProps {
  metrics: any;
}

export function SystemMetrics({ metrics }: SystemMetricsProps) {
  const getStatusColor = (value: number, thresholds: { warning: number, danger: number }) => {
    if (value >= thresholds.danger) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getStatusColor(metrics?.responseTime || 0, { warning: 200, danger: 500 })}`}>
            {metrics?.responseTime}ms
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
            {metrics?.activeUsers?.toLocaleString()}
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
          <div className={`text-2xl font-bold ${getStatusColor(metrics?.cpuUsage || 0, { warning: 70, danger: 90 })}`}>
            {metrics?.cpuUsage}%
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
          <div className={`text-2xl font-bold ${getStatusColor(metrics?.memoryUsage || 0, { warning: 80, danger: 95 })}`}>
            {metrics?.memoryUsage}%
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
            {metrics?.databaseConnections}
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
          <div className={`text-2xl font-bold ${getStatusColor(metrics?.errorRate || 0, { warning: 1, danger: 5 })}`}>
            {metrics?.errorRate}%
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
            {metrics?.throughput}
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
  );
}
