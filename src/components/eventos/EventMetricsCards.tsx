
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Calendar,
  Users,
  Trophy,
  TrendingUp,
  Target,
  Award,
  Clock
} from "lucide-react";
import { EventMetrics } from "@/hooks/useEventMetrics";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  metrics: EventMetrics;
  loading: boolean;
}

export function EventMetricsCards({ metrics, loading }: Props) {
  const { user } = useAuth();

  const globalMetrics = [
    {
      label: "Eventos Ativos",
      value: metrics.activeEvents,
      icon: Zap,
      color: "text-green-500",
      bgColor: "bg-green-50",
      change: "+12%"
    },
    {
      label: "Total de Eventos",
      value: metrics.totalEvents,
      icon: Calendar,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      change: "+5%"
    },
    {
      label: "Participantes Ativos",
      value: metrics.totalParticipants,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      change: "+23%"
    },
    {
      label: "Pool de Prêmios",
      value: `${metrics.totalPrizePool.toLocaleString()} RC`,
      icon: Trophy,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      change: "+18%"
    }
  ];

  const userMetrics = user ? [
    {
      label: "Suas Inscrições",
      value: metrics.userRegistrations,
      icon: Target,
      color: "text-cyan-500",
      bgColor: "bg-cyan-50"
    },
    {
      label: "Eventos Concluídos",
      value: metrics.userCompletedEvents,
      icon: Award,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50"
    },
    {
      label: "Agendados",
      value: metrics.scheduledEvents,
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-50"
    },
    {
      label: "Média Participantes",
      value: metrics.avgParticipantsPerEvent,
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50"
    }
  ] : [];

  const allMetrics = user ? [...globalMetrics.slice(0, 4), ...userMetrics] : globalMetrics;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 animate-pulse">
            <CardContent className="p-3 sm:p-4">
              <div className="h-12 sm:h-16 bg-white/10 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
      {/* Métricas Globais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        {globalMetrics.map((metric, index) => (
          <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all touch-target">
            <CardContent className="p-2 sm:p-3 lg:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-1 sm:mb-2">
                <div className={`p-1.5 sm:p-2 rounded-lg ${metric.bgColor} mb-2 sm:mb-0`}>
                  <metric.icon className={`h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 ${metric.color}`} />
                </div>
                <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-600/30 px-1.5 py-0.5">
                  {metric.change}
                </Badge>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-cyan-200 truncate">{metric.label}</p>
                <p className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold text-white truncate" title={metric.value.toString()}>
                  {metric.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Métricas do Usuário */}
      {user && userMetrics.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          {userMetrics.map((metric, index) => (
            <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all touch-target">
              <CardContent className="p-2 sm:p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-cyan-300 truncate">{metric.label}</p>
                    <p className="text-sm sm:text-lg lg:text-xl font-bold text-white truncate" title={metric.value.toString()}>
                      {metric.value}
                    </p>
                  </div>
                  <div className={`p-1.5 sm:p-2 rounded-lg ${metric.bgColor} ml-2 flex-shrink-0`}>
                    <metric.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
