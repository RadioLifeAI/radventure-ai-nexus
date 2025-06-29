
import React, { useState } from "react";
import { useActiveEvents } from "@/hooks/useActiveEvents";
import { useEventFilters } from "@/hooks/useEventFilters";
import { useEventMetrics } from "@/hooks/useEventMetrics";
import { useNavigate } from "react-router-dom";
import { HeaderNav } from "@/components/HeaderNav";
import { EventFilterBarFunctional } from "@/components/eventos/EventFilterBarFunctional";
import { UpcomingEventsSlider } from "@/components/eventos/UpcomingEventsSlider";
import { EventsGrid } from "@/components/eventos/EventsGrid";
import { EventsDashboardRealTime } from "@/components/eventos/EventsDashboardRealTime";
import { EventsAdvancedVisualization } from "@/components/eventos/EventsAdvancedVisualization";
import { EventsNotificationSystem } from "@/components/eventos/EventsNotificationSystem";
import { EventMetricsCards } from "@/components/eventos/EventMetricsCards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
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
  const { metrics, loading: metricsLoading } = useEventMetrics();
  const { 
    filters, 
    applyFilters, 
    updateFilter, 
    updateArrayFilter, 
    clearFilters, 
    hasActiveFilters 
  } = useEventFilters();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("dashboard");

  // Aplicar filtros aos eventos
  const filteredEvents = applyFilters(events);

  // Em destaque: próximos 2 eventos filtrados
  const highlights = filteredEvents.slice(0, 2);

  const handleEnterEvent = (eventId: string) => {
    navigate(`/app/evento/${eventId}`);
  };

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
            <Button 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              onClick={() => navigate("/app/conquistas")}
            >
              <Trophy className="h-4 w-4 mr-2" />
              Conquistas
            </Button>
            {user && (
              <Button 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                onClick={() => navigate("/admin/events/create")}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Criar Evento
              </Button>
            )}
            {!user && (
              <Button 
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-900"
                onClick={() => navigate("/login")}
              >
                Fazer Login
              </Button>
            )}
          </div>
        </div>

        {/* Métricas em tempo real */}
        <EventMetricsCards metrics={metrics} loading={metricsLoading} />

        {/* Slider de eventos em destaque */}
        <UpcomingEventsSlider highlights={highlights} />

        {/* Tabs simplificadas - removendo gamificação */}
        <div className="mt-6">
          <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 bg-white/10 backdrop-blur-sm border border-white/20">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-white/20">
                <BarChart3 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="visualization" className="data-[state=active]:bg-white/20">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Visualizações</span>
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
              <EventsAdvancedVisualization events={filteredEvents} onEnterEvent={handleEnterEvent} />
            </TabsContent>

            <TabsContent value="events">
              <div className="space-y-6">
                <EventFilterBarFunctional
                  filters={filters}
                  onUpdateFilter={updateFilter}
                  onUpdateArrayFilter={updateArrayFilter}
                  onClearFilters={clearFilters}
                  hasActiveFilters={hasActiveFilters}
                  totalEvents={events.length}
                  filteredEvents={filteredEvents.length}
                />
                
                {loading ? (
                  <div className="text-cyan-400 mt-6 animate-fade-in">Carregando eventos...</div>
                ) : (
                  <EventsGrid events={filteredEvents} onEnterEvent={handleEnterEvent} />
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

                    {/* Estatísticas de autenticação */}
                    {user ? (
                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-3">Seu Desempenho</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-cyan-400">{metrics.userRegistrations}</div>
                            <div className="text-sm text-cyan-200">Eventos Inscritos</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">{metrics.userCompletedEvents}</div>
                            <div className="text-sm text-cyan-200">Eventos Concluídos</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-400">
                              {metrics.userCompletedEvents > 0 
                                ? Math.round((metrics.userCompletedEvents / metrics.userRegistrations) * 100) 
                                : 0}%
                            </div>
                            <div className="text-sm text-cyan-200">Taxa de Conclusão</div>
                          </div>
                        </div>
                        
                        {/* Link para página de conquistas */}
                        <div className="mt-4 text-center">
                          <Button 
                            onClick={() => navigate("/app/conquistas")}
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                          >
                            <Trophy className="h-4 w-4 mr-2" />
                            Ver Minhas Conquistas
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <h4 className="font-medium text-white mb-3">Faça Login para Ver Suas Estatísticas</h4>
                        <Button onClick={() => navigate("/login")} className="bg-cyan-600 hover:bg-cyan-700">
                          Fazer Login
                        </Button>
                      </div>
                    )}
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
