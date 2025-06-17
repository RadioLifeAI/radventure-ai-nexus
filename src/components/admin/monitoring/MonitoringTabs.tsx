
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Activity, AlertTriangle, Database } from "lucide-react";
import { SystemMetrics } from "./SystemMetrics";
import { SystemLogs } from "./SystemLogs";

interface MonitoringTabsProps {
  metrics: any;
  logs: any;
}

export function MonitoringTabs({ metrics, logs }: MonitoringTabsProps) {
  return (
    <Tabs defaultValue="metrics" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6">
        <TabsTrigger value="metrics" className="flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          Métricas
        </TabsTrigger>
        <TabsTrigger value="logs" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Logs
        </TabsTrigger>
        <TabsTrigger value="alerts" className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Alertas
        </TabsTrigger>
        <TabsTrigger value="database" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Database
        </TabsTrigger>
      </TabsList>

      <TabsContent value="metrics" className="space-y-6">
        <SystemMetrics metrics={metrics} />
      </TabsContent>

      <TabsContent value="logs" className="space-y-6">
        <SystemLogs logs={logs} />
      </TabsContent>

      <TabsContent value="alerts" className="space-y-6">
        <div className="grid gap-6">
          <SystemMetrics metrics={metrics} />
          <SystemLogs logs={logs} />
        </div>
      </TabsContent>

      <TabsContent value="database" className="space-y-6">
        <SystemMetrics metrics={metrics} />
      </TabsContent>
    </Tabs>
  );
}
