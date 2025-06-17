
import React from "react";
import { SystemMetrics } from "./monitoring/SystemMetrics";
import { SystemLogs } from "./monitoring/SystemLogs";
import { SystemMonitoringHeader } from "./monitoring/SystemMonitoringHeader";

export function SystemMonitoring() {
  return (
    <div className="space-y-6">
      <SystemMonitoringHeader 
        systemStatus="healthy"
        uptime="99.9%"
        activeUsers={0}
      />
      
      <div className="grid gap-6">
        <SystemMetrics />
        <SystemLogs />
      </div>
    </div>
  );
}
