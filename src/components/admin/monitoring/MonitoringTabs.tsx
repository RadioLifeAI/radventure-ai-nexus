
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Activity, AlertTriangle, Database } from "lucide-react";
import { TabContentGamified } from "../layouts/TabContentGamified";
import { SystemMetrics } from "./SystemMetrics";
import { SystemLogs } from "./SystemLogs";

interface MonitoringTabsProps {
  metrics: any;
  logs: any;
}

export function MonitoringTabs({ metrics, logs }: MonitoringTabsProps) {
  return (
    <Tabs defaultValue="metrics" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6 bg-gradient-to-r from-red-50 to-orange-50 p-1 rounded-xl">
        <TabsTrigger value="metrics" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
          <Monitor className="h-4 w-4" />
          Métricas
        </TabsTrigger>
        <TabsTrigger value="logs" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
          <Activity className="h-4 w-4" />
          Logs
        </TabsTrigger>
        <TabsTrigger value="alerts" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
          <AlertTriangle className="h-4 w-4" />
          Alertas
        </TabsTrigger>
        <TabsTrigger value="database" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
          <Database className="h-4 w-4" />
          Database
        </TabsTrigger>
      </TabsList>

      <TabsContent value="metrics" className="space-y-6">
        <TabContentGamified
          title="Métricas do Sistema"
          description="Monitoramento em tempo real de recursos e performance"
          icon={Monitor}
          category="monitoring"
          badge="Real-time"
          stats={[
            { label: "CPU", value: `${metrics.cpuUsage}%` },
            { label: "Memória", value: `${metrics.memoryUsage}%` },
            { label: "Uptime", value: metrics.uptime }
          ]}
        >
          <SystemMetrics metrics={metrics} />
        </TabContentGamified>
      </TabsContent>

      <TabsContent value="logs" className="space-y-6">
        <TabContentGamified
          title="Logs do Sistema"
          description="Registro detalhado de eventos e atividades"
          icon={Activity}
          category="monitoring"
          badge="Live Logs"
          stats={[
            { label: "Total", value: logs.length },
            { label: "Errors", value: logs.filter((l: any) => l.level === 'ERROR').length },
            { label: "Warnings", value: logs.filter((l: any) => l.level === 'WARN').length }
          ]}
        >
          <SystemLogs logs={logs} />
        </TabContentGamified>
      </TabsContent>

      <TabsContent value="alerts" className="space-y-6">
        <TabContentGamified
          title="Sistema de Alertas"
          description="Alertas e notificações críticas do sistema"
          icon={AlertTriangle}
          category="monitoring"
          badge="Active Alerts"
        >
          <div className="grid gap-6">
            <SystemMetrics metrics={metrics} />
            <SystemLogs logs={logs} />
          </div>
        </TabContentGamified>
      </TabsContent>

      <TabsContent value="database" className="space-y-6">
        <TabContentGamified
          title="Monitoramento de Database"
          description="Performance e saúde do banco de dados"
          icon={Database}
          category="monitoring"
          badge="DB Health"
          stats={[
            { label: "Conexões", value: metrics.activeConnections },
            { label: "Response", value: `${metrics.responseTime}ms` },
            { label: "Disk", value: `${metrics.diskUsage}%` }
          ]}
        >
          <SystemMetrics metrics={metrics} />
        </TabContentGamified>
      </TabsContent>
    </Tabs>
  );
}
