
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Clock,
  Trophy,
  TrendingUp,
  Eye,
  Zap,
  Calendar,
  Target,
  Flame,
  Star
} from "lucide-react";
import { useActiveEvents } from "@/hooks/useActiveEvents";

interface EventMetrics {
  activeParticipants: number;
  totalRegistrations: number;
  completionRate: number;
  averageScore: number;
  topPerformer: string;
  currentStreak: number;
}

export function EventsDashboardRealTime() {
  const { events, loading } = useActiveEvents();
  const [metrics, setMetrics] = useState<EventMetrics>({
    activeParticipants: 0,
    totalRegistrations: 0,
    completionRate: 0,
    averageScore: 0,
    topPerformer: "Carregando...",
    currentStreak: 0
  });

  useEffect(() => {
    // Simular métricas em tempo real
    const interval = setInterval(() => {
      setMetrics({
        activeParticipants: Math.floor(Math.random() * 150) + 50,
        totalRegistrations: Math.floor(Math.random() * 500) + 200,
        completionRate: Math.floor(Math.random() * 30) + 70,
        averageScore: Math.floor(Math.random() * 20) + 75,
        topPerformer: "Dr. Silva",
        currentStreak: Math.floor(Math.random() * 10) + 5
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const activeEvents = events.filter(e => e.status === 'ACTIVE').length;
  const upcomingEvents = events.filter(e => e.status === 'SCHEDULED').length;

  const realTimeStats = [
    {
      title: "Participantes Ativos",
      value: metrics.activeParticipants,
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-50",
      trend: "+12%"
    },
    {
      title: "Eventos Ao Vivo",
      value: activeEvents,
      icon: Zap,
      color: "text-red-500",
      bgColor: "bg-red-50",
      trend: "Em tempo real"
    },
    {
      title: "Taxa de Conclusão",
      value: `${metrics.completionRate}%`,
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      trend: "+5%"
    },
    {
      title: "Score Médio",
      value: `${metrics.averageScore}%`,
      icon: Trophy,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      trend: "+8%"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header com métricas em tempo real */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {realTimeStats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-l-4 border-l-cyan-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600 font-medium">{stat.trend}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              {/* Indicador de atualização em tempo real */}
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dashboard de Performance */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Flame className="h-5 w-5" />
            Performance em Tempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Top Performer</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{metrics.topPerformer}</p>
                  <p className="text-xs text-gray-500">Score: 98%</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Streak Atual</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{metrics.currentStreak} dias</p>
                  <p className="text-xs text-gray-500">Recorde: 15 dias</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Próximos</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{upcomingEvents} eventos</p>
                  <p className="text-xs text-gray-500">Esta semana</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="leaderboard">
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((position) => (
                  <div key={position} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Badge variant={position <= 3 ? "default" : "secondary"}>
                        #{position}
                      </Badge>
                      <div>
                        <p className="font-medium">Dr. Participante {position}</p>
                        <p className="text-xs text-gray-500">Neurologia</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{100 - position * 5}%</p>
                      <p className="text-xs text-gray-500">{1500 - position * 100} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium mb-3">Especialidades Populares</h4>
                  <div className="space-y-2">
                    {['Neurologia', 'Cardiologia', 'Radiologia'].map((specialty, index) => (
                      <div key={specialty} className="flex justify-between items-center">
                        <span className="text-sm">{specialty}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${(3 - index) * 30}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{(3 - index) * 30}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium mb-3">Horários de Pico</h4>
                  <div className="space-y-2">
                    {['19:00-21:00', '14:00-16:00', '09:00-11:00'].map((time, index) => (
                      <div key={time} className="flex justify-between items-center">
                        <span className="text-sm">{time}</span>
                        <Badge variant="outline">{100 - index * 20} usuários</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
