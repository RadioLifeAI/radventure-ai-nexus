
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, HardDrive, Activity, Clock, Zap, CheckCircle, AlertTriangle, Shield, Target } from "lucide-react";

interface SystemMetricsProps {
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    responseTime: number;
    uptime: string;
    activeConnections: number;
  };
}

export function SystemMetrics({ metrics }: SystemMetricsProps) {
  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return "red";
    if (value >= thresholds.warning) return "yellow";
    return "green";
  };

  const metricCards = [
    {
      title: "Processamento CPU",
      value: metrics.cpuUsage,
      unit: "%",
      icon: Cpu,
      color: getStatusColor(metrics.cpuUsage, { warning: 70, critical: 90 }),
      thresholds: { warning: 70, critical: 90 },
      description: "Utilização do processador"
    },
    {
      title: "Memória RAM",
      value: metrics.memoryUsage,
      unit: "%",
      icon: Activity,
      color: getStatusColor(metrics.memoryUsage, { warning: 80, critical: 95 }),
      thresholds: { warning: 80, critical: 95 },
      description: "Uso da memória do sistema"
    },
    {
      title: "Armazenamento",
      value: metrics.diskUsage,
      unit: "%",
      icon: HardDrive,
      color: getStatusColor(metrics.diskUsage, { warning: 80, critical: 90 }),
      thresholds: { warning: 80, critical: 90 },
      description: "Espaço em disco utilizado"
    },
    {
      title: "Tempo de Resposta",
      value: metrics.responseTime,
      unit: "ms",
      icon: Clock,
      color: getStatusColor(metrics.responseTime, { warning: 200, critical: 500 }),
      thresholds: { warning: 200, critical: 500 },
      extraInfo: `${metrics.activeConnections} conexões ativas`,
      description: "Latência do sistema"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "green":
        return {
          gradient: "from-green-500 to-emerald-600",
          bgGradient: "from-green-50 to-emerald-100",
          border: "border-green-200",
          progressBg: "bg-green-200",
          progressFill: "bg-green-500",
          badge: "bg-green-100 text-green-700 border-green-200",
          iconBg: "bg-green-500"
        };
      case "yellow":
        return {
          gradient: "from-yellow-500 to-amber-600",
          bgGradient: "from-yellow-50 to-amber-100",
          border: "border-yellow-200",
          progressBg: "bg-yellow-200",
          progressFill: "bg-yellow-500",
          badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
          iconBg: "bg-yellow-500"
        };
      case "red":
        return {
          gradient: "from-red-500 to-rose-600",
          bgGradient: "from-red-50 to-rose-100",
          border: "border-red-200",
          progressBg: "bg-red-200",
          progressFill: "bg-red-500",
          badge: "bg-red-100 text-red-700 border-red-200",
          iconBg: "bg-red-500"
        };
      default:
        return {
          gradient: "from-gray-500 to-slate-600",
          bgGradient: "from-gray-50 to-slate-100",
          border: "border-gray-200",
          progressBg: "bg-gray-200",
          progressFill: "bg-gray-500",
          badge: "bg-gray-100 text-gray-700 border-gray-200",
          iconBg: "bg-gray-500"
        };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric, index) => {
        const colors = getColorClasses(metric.color);
        const progressValue = metric.unit === "%" ? metric.value : Math.min((metric.value / 1000) * 100, 100);
        
        return (
          <Card key={index} className={`border-2 ${colors.border} bg-gradient-to-br ${colors.bgGradient} shadow-xl hover:shadow-2xl transition-all duration-300 group animate-fade-in hover:scale-105`}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">
                {metric.title}
              </CardTitle>
              <div className={`p-3 rounded-xl ${colors.iconBg} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <metric.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold text-gray-900">
                  {metric.value}{metric.unit}
                </div>
                <Badge className={`${colors.badge} shadow-sm flex items-center gap-1`}>
                  {metric.color === "green" && <CheckCircle className="h-3 w-3" />}
                  {metric.color === "yellow" && <Zap className="h-3 w-3" />}
                  {metric.color === "red" && <AlertTriangle className="h-3 w-3" />}
                  {metric.color === "green" ? "Ótimo" : metric.color === "yellow" ? "Atenção" : "Crítico"}
                </Badge>
              </div>
              
              <div className={`w-full ${colors.progressBg} rounded-full h-3 mb-3 overflow-hidden shadow-inner`}>
                <div 
                  className={`${colors.progressFill} h-3 rounded-full transition-all duration-700 ease-out shadow-sm`}
                  style={{ width: `${progressValue}%` }}
                />
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-gray-500" />
                <p className="text-xs text-gray-600 font-medium">{metric.description}</p>
              </div>
              
              {metric.extraInfo && (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <p className="text-xs text-gray-600">{metric.extraInfo}</p>
                </div>
              )}
              
              {/* Animated bottom accent */}
              <div className={`absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r ${colors.gradient} opacity-30 group-hover:opacity-60 transition-opacity`} />
              
              {/* Status indicator */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className={`w-3 h-3 rounded-full ${colors.progressFill} animate-pulse`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
