
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-white/10 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Métricas Globais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {globalMetrics.map((metric, index) => (
          <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  {metric.change}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-cyan-200">{metric.label}</p>
                <p className="text-2xl font-bold text-white">{metric.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Métricas do Usuário */}
      {user && userMetrics.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {userMetrics.map((metric, index) => (
            <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-cyan-300">{metric.label}</p>
                    <p className="text-xl font-bold text-white">{metric.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <metric.icon className={`h-4 w-4 ${metric.color}`} />
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
