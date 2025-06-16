import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Sparkles, Crown } from "lucide-react";
import { KPICards } from "./analytics/KPICards";
import { ChartsSection } from "./analytics/ChartsSection";
import { EngagementMetrics } from "./analytics/EngagementMetrics";

export function DashboardAnalytics() {
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Queries para diferentes métricas
  const { data: userStats } = useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('type, academic_stage, created_at, total_points, radcoin_balance');
      
      if (error) throw error;
      
      const totalUsers = data?.length || 0;
      const activeUsers = data?.filter(u => new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length || 0;
      const totalPoints = data?.reduce((sum, u) => sum + (u.total_points || 0), 0) || 0;
      const totalRadcoins = data?.reduce((sum, u) => sum + (u.radcoin_balance || 0), 0) || 0;
      
      return { totalUsers, activeUsers, totalPoints, totalRadcoins, userData: data };
    },
  });

  const { data: caseStats } = useQuery({
    queryKey: ['admin-case-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_cases')
        .select('specialty, difficulty_level, created_at, points');
      
      if (error) throw error;
      
      const totalCases = data?.length || 0;
      const specialtyDistribution = data?.reduce((acc: any, case_: any) => {
        acc[case_.specialty] = (acc[case_.specialty] || 0) + 1;
        return acc;
      }, {}) || {};
      
      return { totalCases, specialtyDistribution, caseData: data };
    },
  });

  const { data: eventStats } = useQuery({
    queryKey: ['admin-event-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('status, scheduled_start, prize_radcoins, created_at');
      
      if (error) throw error;
      
      const totalEvents = data?.length || 0;
      const activeEvents = data?.filter(e => e.status === 'ACTIVE').length || 0;
      const totalPrizes = data?.reduce((sum, e) => sum + (e.prize_radcoins || 0), 0) || 0;
      
      return { totalEvents, activeEvents, totalPrizes, eventData: data };
    },
  });

  return (
    <div className="space-y-6">
      {/* Header Gamificado */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="text-yellow-300" />
              Analytics Dashboard
              <Crown className="text-yellow-300" />
            </h1>
            <p className="text-blue-100 mt-2">Dados em tempo real da plataforma médica</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">🏆 Nível Master</div>
            <div className="text-blue-200">Admin Analytics Pro</div>
          </div>
        </div>
      </div>

      {/* KPIs Cards */}
      <KPICards userStats={userStats} caseStats={caseStats} eventStats={eventStats} />

      {/* Tabs para diferentes visualizações */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="cases">Casos</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ChartsSection caseStats={caseStats} />
          <EngagementMetrics />
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Análise Detalhada de Usuários</CardTitle>
              <CardDescription>Insights sobre comportamento e segmentação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Distribuição por Estágio Acadêmico</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { stage: 'Estudante', count: 120 },
                      { stage: 'Interno', count: 85 },
                      { stage: 'Residente', count: 95 },
                      { stage: 'Especialista', count: 50 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stage" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Usuários Mais Ativos</h4>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((rank) => (
                      <div key={rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">#{rank}</Badge>
                          <div>
                            <div className="font-medium">Dr. Exemplo {rank}</div>
                            <div className="text-sm text-gray-600">Cardiologia</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{(1000 - rank * 100)} pts</div>
                          <div className="text-xs text-gray-500">{50 - rank * 5} casos</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cases">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Casos Médicos</CardTitle>
              <CardDescription>Performance e qualidade do conteúdo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Análise detalhada de casos será implementada aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Analytics de Eventos</CardTitle>
              <CardDescription>Participação e engajamento em eventos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Analytics de eventos será implementado aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
