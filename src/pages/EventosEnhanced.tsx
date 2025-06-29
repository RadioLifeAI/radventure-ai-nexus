
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
import { EventsGamificationHub } from "@/components/eventos/EventsGamificationHub";
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 via-slate-100 to-blue-100 text-gray-900">
      <HeaderNav />
      <main className="flex-1 flex flex-col px-2 md:px-16 pt-4 pb-10">
        {/* Header revolucionário */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-extrabold text-4xl mb-2 animate-fade-in bg-gradient-to-r from-cyan-700 to-purple-700 bg-clip-text text-transparent">
              Eventos Gamificados 🚀
            </h1>
            <p className="mb-4 text-gray-800 text-lg animate-fade-in">
              Experiência revolucionária de aprendizado com IA, rankings em tempo real e conquistas épicas!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <EventsNotificationSystem />
            {user && (
              <Button 
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 shadow-md"
                onClick={() => navigate("/admin/events/create")}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Criar Evento
              </Button>
            )}
            {!user && (
              <Button 
                variant="outline"
                className="text-gray-900 border-gray-400 hover:bg-gray-100 hover:text-gray-900 bg-white shadow-md"
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

        {/* Tabs avançadas */}
        <div className="mt-6">
          <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 bg-white/95 backdrop-blur-md border border-gray-300 shadow-lg">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md text-gray-700">
                <BarChart3 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="visualization" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md text-gray-700">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Visualizações</span>
              </TabsTrigger>
              <TabsTrigger value="gamification" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md text-gray-700">
                <Trophy className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Gamificação</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md text-gray-700">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Todos</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md text-gray-700">
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

            <TabsContent value="gamification">
              <EventsGamificationHub />
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
                  <div className="text-blue-700 mt-6 animate-fade-in">Carregando eventos...</div>
                ) : (
                  <EventsGrid events={filteredEvents} onEnterEvent={handleEnterEvent} />
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <Card className="bg-white border-gray-300 shadow-md">
                <CardHeader>
                  <CardTitle className="text-gray-900">Analytics Avançado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Performance por especialidade */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-300 shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-3">Performance por Especialidade</h4>
                        <div className="space-y-3">
                          {['Neurologia', 'Cardiologia', 'Radiologia'].map((specialty, index) => (
                            <div key={specialty} className="flex items-center justify-between">
                              <span className="text-gray-700">{specialty}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-gray-300 rounded-full">
                                  <div 
                                    className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full"
                                    style={{ width: `${(3 - index) * 30}%` }}
                                  ></div>
                                </div>
                                <span className="text-gray-900 text-sm font-medium">{(3 - index) * 30}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-300 shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-3">Tendências Semanais</h4>
                        <div className="space-y-3">
                          {['Participação', 'Pontuação Média', 'Novos Usuários'].map((metric, index) => (
                            <div key={metric} className="flex items-center justify-between">
                              <span className="text-gray-700">{metric}</span>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span className="text-green-700 text-sm font-medium">+{(index + 1) * 5}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Estatísticas de autenticação */}
                    {user ? (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-300 shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-3">Seu Desempenho</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-cyan-700">{metrics.userRegistrations}</div>
                            <div className="text-sm text-gray-700">Eventos Inscritos</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-700">{metrics.userCompletedEvents}</div>
                            <div className="text-sm text-gray-700">Eventos Concluídos</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-700">
                              {metrics.userCompletedEvents > 0 
                                ? Math.round((metrics.userCompletedEvents / metrics.userRegistrations) * 100) 
                                : 0}%
                            </div>
                            <div className="text-sm text-gray-700">Taxa de Conclusão</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-300 shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-3">Faça Login para Ver Suas Estatísticas</h4>
                        <Button onClick={() => navigate("/login")} className="bg-cyan-700 hover:bg-cyan-800 shadow-md">
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
