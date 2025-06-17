import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, HardDrive, Activity, Clock, Zap, CheckCircle, AlertTriangle } from "lucide-react";

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
      title: "CPU Usage",
      value: metrics.cpuUsage,
      unit: "%",
      icon: Cpu,
      color: getStatusColor(metrics.cpuUsage, { warning: 70, critical: 90 }),
      thresholds: { warning: 70, critical: 90 }
    },
    {
      title: "Memória",
      value: metrics.memoryUsage,
      unit: "%",
      icon: Activity,
      color: getStatusColor(metrics.memoryUsage, { warning: 80, critical: 95 }),
      thresholds: { warning: 80, critical: 95 }
    },
    {
      title: "Disco",
      value: metrics.diskUsage,
      unit: "%",
      icon: HardDrive,
      color: getStatusColor(metrics.diskUsage, { warning: 80, critical: 90 }),
      thresholds: { warning: 80, critical: 90 }
    },
    {
      title: "Tempo Resposta",
      value: metrics.responseTime,
      unit: "ms",
      icon: Clock,
      color: getStatusColor(metrics.responseTime, { warning: 200, critical: 500 }),
      thresholds: { warning: 200, critical: 500 },
      extraInfo: `Conexões: ${metrics.activeConnections}`
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "green":
        return {
          gradient: "from-green-500 to-green-600",
          bgGradient: "from-green-50 to-emerald-50",
          border: "border-green-200",
          progressBg: "bg-green-200",
          progressFill: "bg-green-500",
          badge: "bg-green-100 text-green-700 border-green-200"
        };
      case "yellow":
        return {
          gradient: "from-yellow-500 to-yellow-600",
          bgGradient: "from-yellow-50 to-amber-50",
          border: "border-yellow-200",
          progressBg: "bg-yellow-200",
          progressFill: "bg-yellow-500",
          badge: "bg-yellow-100 text-yellow-700 border-yellow-200"
        };
      case "red":
        return {
          gradient: "from-red-500 to-red-600",
          bgGradient: "from-red-50 to-rose-50",
          border: "border-red-200",
          progressBg: "bg-red-200",
          progressFill: "bg-red-500",
          badge: "bg-red-100 text-red-700 border-red-200"
        };
      default:
        return {
          gradient: "from-gray-500 to-gray-600",
          bgGradient: "from-gray-50 to-slate-50",
          border: "border-gray-200",
          progressBg: "bg-gray-200",
          progressFill: "bg-gray-500",
          badge: "bg-gray-100 text-gray-700 border-gray-200"
        };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric, index) => {
        const colors = getColorClasses(metric.color);
        const progressValue = metric.unit === "%" ? metric.value : Math.min((metric.value / 1000) * 100, 100);
        
        return (
          <Card key={index} className={`border-2 ${colors.border} bg-gradient-to-br ${colors.bgGradient} shadow-lg hover:shadow-xl transition-all duration-300 group animate-fade-in`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${colors.gradient} text-white shadow-md`}>
                <metric.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl font-bold text-gray-900">
                  {metric.value}{metric.unit}
                </div>
                <Badge className={colors.badge}>
                  {metric.color === "green" && <CheckCircle className="h-3 w-3 mr-1" />}
                  {metric.color === "yellow" && <Zap className="h-3 w-3 mr-1" />}
                  {metric.color === "red" && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {metric.color === "green" ? "OK" : metric.color === "yellow" ? "Warning" : "Critical"}
                </Badge>
              </div>
              
              <div className={`w-full ${colors.progressBg} rounded-full h-2 mb-2 overflow-hidden`}>
                <div 
                  className={`${colors.progressFill} h-2 rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${progressValue}%` }}
                />
              </div>
              
              {metric.extraInfo && (
                <p className="text-xs text-gray-600">{metric.extraInfo}</p>
              )}
              
              <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${colors.gradient} opacity-20 group-hover:opacity-40 transition-opacity`} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
