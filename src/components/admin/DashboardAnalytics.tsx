
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { 
  Users, Brain, Trophy, TrendingUp, AlertCircle, DollarSign, 
  Target, Zap, Eye, Calendar, Sparkles, Crown
} from "lucide-react";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function DashboardAnalytics() {
  const { hasPermission } = useAdminPermissions();
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
    enabled: hasPermission('ANALYTICS', 'READ')
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
    enabled: hasPermission('CASES', 'READ')
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
    enabled: hasPermission('EVENTS', 'READ')
  });

  if (!hasPermission('ANALYTICS', 'READ')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Negado</h3>
          <p className="text-gray-600">Você não tem permissão para visualizar analytics.</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: "Usuários Totais",
      value: userStats?.totalUsers || 0,
      change: "+12%",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      title: "Casos Ativos",
      value: caseStats?.totalCases || 0,
      change: "+8%",
      icon: Brain,
      color: "bg-green-500"
    },
    {
      title: "Eventos Ativos",
      value: eventStats?.activeEvents || 0,
      change: "+15%",
      icon: Trophy,
      color: "bg-purple-500"
    },
    {
      title: "RadCoins Circulantes",
      value: userStats?.totalRadcoins || 0,
      change: "+22%",
      icon: DollarSign,
      color: "bg-yellow-500"
    }
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${kpi.color} text-white`}>
                <kpi.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{kpi.value.toLocaleString()}</div>
              <p className="text-xs text-green-600 font-medium">
                {kpi.change} vs mês anterior
              </p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 group-hover:opacity-40 transition-opacity" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs para diferentes visualizações */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="cases">Casos</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Crescimento de Usuários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Crescimento de Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { month: 'Jan', users: 120 },
                    { month: 'Fev', users: 150 },
                    { month: 'Mar', users: 180 },
                    { month: 'Abr', users: 220 },
                    { month: 'Mai', users: 280 },
                    { month: 'Jun', users: 350 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição de Especialidades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Especialidades Mais Populares
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(caseStats?.specialtyDistribution || {}).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(caseStats?.specialtyDistribution || {}).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Métricas de Engajamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Métricas de Engajamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-2">Taxa de Conclusão</div>
                  <Progress value={75} className="mb-2" />
                  <div className="text-xs text-gray-500">75% dos casos são concluídos</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">Tempo Médio por Caso</div>
                  <Progress value={60} className="mb-2" />
                  <div className="text-xs text-gray-500">3.2 minutos em média</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">Retenção Semanal</div>
                  <Progress value={85} className="mb-2" />
                  <div className="text-xs text-gray-500">85% retornam na semana</div>
                </div>
              </div>
            </CardContent>
          </Card>
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
              {/* Conteúdo de análise de casos */}
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
              {/* Conteúdo de análise de eventos */}
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
