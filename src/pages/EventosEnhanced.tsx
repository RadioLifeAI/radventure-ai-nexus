
import React, { useState } from "react";
import { useActiveEvents } from "@/hooks/useActiveEvents";
import { useNavigate } from "react-router-dom";
import { HeaderNav } from "@/components/HeaderNav";
import { EventFilterBar } from "@/components/eventos/EventFilterBar";
import { UpcomingEventsSlider } from "@/components/eventos/UpcomingEventsSlider";
import { EventsGrid } from "@/components/eventos/EventsGrid";
import { EventsDashboardRealTime } from "@/components/eventos/EventsDashboardRealTime";
import { EventsAdvancedVisualization } from "@/components/eventos/EventsAdvancedVisualization";
import { EventsGamificationHub } from "@/components/eventos/EventsGamificationHub";
import { EventsNotificationSystem } from "@/components/eventos/EventsNotificationSystem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  BarChart3,
  Trophy,
  Bell,
  Calendar,
  Sparkles,
  Users,
  Target,
  TrendingUp
} from "lucide-react";

export default function EventosEnhanced() {
  const { events, loading } = useActiveEvents();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("dashboard");

  // Em destaque: próximos 2 eventos
  const highlights = events.slice(0, 2);
  const activeEvents = events.filter(e => e.status === 'ACTIVE').length;
  const totalParticipants = events.reduce((sum, event) => sum + (event.max_participants || 0), 0);

  const handleEnterEvent = (eventId: string) => {
    navigate(`/evento/${eventId}`);
  };

  const quickStats = [
    {
      label: "Eventos Ativos",
      value: activeEvents,
      icon: Zap,
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      label: "Total de Eventos",
      value: events.length,
      icon: Calendar,
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      label: "Participantes",
      value: totalParticipants,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      label: "Prêmios Totais",
      value: `${events.reduce((sum, event) => sum + event.prize_radcoins, 0)} RC`,
      icon: Trophy,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
      <HeaderNav />
      <main className="flex-1 flex flex-col px-2 md:px-16 pt-4 pb-10">
        {/* Header revolucionário */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-extrabold text-4xl mb-2 text-white animate-fade-in bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Eventos Gamificados 🚀
            </h1>
            <p className="mb-4 text-cyan-100 text-lg animate-fade-in">
              Experiência revolucionária de aprendizado com IA, rankings em tempo real e conquistas épicas!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <EventsNotificationSystem />
            <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
              <Sparkles className="h-4 w-4 mr-2" />
              Criar Evento
            </Button>
          </div>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-cyan-200">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Slider de eventos em destaque */}
        <UpcomingEventsSlider highlights={highlights} />

        {/* Tabs avançadas */}
        <div className="mt-6">
          <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 bg-white/10 backdrop-blur-sm border border-white/20">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-white/20">
                <BarChart3 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="visualization" className="data-[state=active]:bg-white/20">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Visualizações</span>
              </TabsTrigger>
              <TabsTrigger value="gamification" className="data-[state=active]:bg-white/20">
                <Trophy className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Gamificação</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-white/20">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Todos</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white/20">
                <Target className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <EventsDashboardRealTime />
            </TabsContent>

            <TabsContent value="visualization">
              <EventsAdvancedVisualization events={events} onEnterEvent={handleEnterEvent} />
            </TabsContent>

            <TabsContent value="gamification">
              <EventsGamificationHub />
            </TabsContent>

            <TabsContent value="events">
              <div className="space-y-6">
                <EventFilterBar />
                {loading ? (
                  <div className="text-cyan-400 mt-6 animate-fade-in">Carregando eventos...</div>
                ) : (
                  <EventsGrid events={events} onEnterEvent={handleEnterEvent} />
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Analytics Avançado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Performance por especialidade */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-3">Performance por Especialidade</h4>
                        <div className="space-y-3">
                          {['Neurologia', 'Cardiologia', 'Radiologia'].map((specialty, index) => (
                            <div key={specialty} className="flex items-center justify-between">
                              <span className="text-cyan-100">{specialty}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-white/20 rounded-full">
                                  <div 
                                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                                    style={{ width: `${(3 - index) * 30}%` }}
                                  ></div>
                                </div>
                                <span className="text-white text-sm">{(3 - index) * 30}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-3">Tendências Semanais</h4>
                        <div className="space-y-3">
                          {['Participação', 'Pontuação Média', 'Novos Usuários'].map((metric, index) => (
                            <div key={metric} className="flex items-center justify-between">
                              <span className="text-cyan-100">{metric}</span>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-400" />
                                <span className="text-green-400 text-sm">+{(index + 1) * 5}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
