
import React from "react";
import { Monitor, Sparkles, Activity, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SystemMonitoringHeaderProps {
  systemStatus?: "healthy" | "warning" | "error";
  uptime?: string;
  activeUsers?: number;
}

export function SystemMonitoringHeader({ 
  systemStatus = "healthy", 
  uptime = "99.9%", 
  activeUsers = 0 
}: SystemMonitoringHeaderProps) {
  const getStatusColor = () => {
    switch(systemStatus) {
      case "healthy": return "bg-green-500/80";
      case "warning": return "bg-yellow-500/80";
      case "error": return "bg-red-500/80";
      default: return "bg-gray-500/80";
    }
  };

  const getStatusText = () => {
    switch(systemStatus) {
      case "healthy": return "Sistema Saudável";
      case "warning": return "Atenção Requerida";
      case "error": return "Erro Detectado";
      default: return "Status Desconhecido";
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 text-white mb-6">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative px-8 py-12">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
            <Monitor className="h-8 w-8 text-yellow-300" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              Monitoramento do Sistema
              <Sparkles className="h-8 w-8 text-yellow-300" />
            </h1>
            <p className="text-slate-100 text-lg">
              Status, métricas e logs do sistema em tempo real
            </p>
            <div className="flex items-center gap-4 mt-3">
              <Badge className={`${getStatusColor()} text-white px-3 py-1`}>
                <Shield className="h-4 w-4 mr-1" />
                {getStatusText()}
              </Badge>
              <Badge className="bg-gray-500/80 text-white px-3 py-1">
                <Activity className="h-4 w-4 mr-1" />
                {uptime} uptime
              </Badge>
              <Badge className="bg-zinc-500/80 text-white px-3 py-1">
                <Monitor className="h-4 w-4 mr-1" />
                {activeUsers} usuários ativos
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
