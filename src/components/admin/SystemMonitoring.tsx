
import React from "react";
import { SystemMetrics } from "./monitoring/SystemMetrics";
import { SystemLogs } from "./monitoring/SystemLogs";
import { SystemMonitoringHeader } from "./monitoring/SystemMonitoringHeader";

// Mock data para desenvolvimento
const mockMetrics = {
  cpuUsage: 45.2,
  memoryUsage: 67.8,
  diskUsage: 34.1,
  responseTime: 125,
  uptime: "99.9%",
  activeConnections: 234
};

const mockLogs = [
  { id: '1', timestamp: new Date().toISOString(), level: 'INFO', message: 'Sistema iniciado com sucesso', source: 'SYSTEM' },
  { id: '2', timestamp: new Date().toISOString(), level: 'WARN', message: 'Alto uso de CPU detectado', source: 'MONITOR' },
  { id: '3', timestamp: new Date().toISOString(), level: 'ERROR', message: 'Falha na conexão com banco de dados', source: 'DATABASE' }
];

export function SystemMonitoring() {
  return (
    <div className="space-y-6">
      <SystemMonitoringHeader 
        systemStatus="healthy"
        uptime={mockMetrics.uptime}
        activeUsers={mockMetrics.activeConnections}
      />
      
      <div className="grid gap-6">
        <SystemMetrics metrics={mockMetrics} />
        <SystemLogs logs={mockLogs} />
      </div>
    </div>
  );
}
