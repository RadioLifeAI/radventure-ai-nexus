
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricCard, StatsGrid, DashboardCard } from '@/components/ui/advanced-card';
import { useAnalytics } from '@/lib/analytics/AnalyticsProvider';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Target,
  BarChart3,
  Brain,
  Zap,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface KPIData {
  totalEvents: number;
  activeEvents: number;
  totalParticipants: number;
  avgEngagement: number;
  totalRevenue: number;
  conversionRate: number;
  userGrowth: number;
  eventSuccessRate: number;
}

const MOCK_KPI_DATA: KPIData = {
  totalEvents: 156,
  activeEvents: 12,
  totalParticipants: 2847,
  avgEngagement: 78.5,
  totalRevenue: 45600,
  conversionRate: 12.3,
  userGrowth: 23.1,
  eventSuccessRate: 89.4
};

const MOCK_ENGAGEMENT_DATA = [
  { name: 'Jan', participants: 400, events: 24, revenue: 2400 },
  { name: 'Feb', participants: 300, events: 18, revenue: 1800 },
  { name: 'Mar', participants: 500, events: 32, revenue: 3200 },
  { name: 'Apr', participants: 780, events: 45, revenue: 4500 },
  { name: 'May', participants: 590, events: 38, revenue: 3800 },
  { name: 'Jun', participants: 680, events: 42, revenue: 4200 }
];

const MOCK_EVENT_TYPES = [
  { name: 'Quiz Rápido', value: 35, color: '#8884d8' },
  { name: 'Estudo de Caso', value: 28, color: '#82ca9d' },
  { name: 'Simulação', value: 22, color: '#ffc658' },
  { name: 'Workshop', value: 15, color: '#ff7300' }
];

export function ExecutiveDashboard() {
  const { getKPIs, track } = useAnalytics();
  const [kpiData, setKpiData] = useState<KPIData>(MOCK_KPI_DATA);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refreshData = async () => {
    setLoading(true);
    try {
      const data = await getKPIs();
      setKpiData(data || MOCK_KPI_DATA);
      setLastUpdated(new Date());
      track('dashboard_refresh');
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    track('executive_dashboard_view');
    refreshData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Executivo</h1>
          <p className="text-gray-600 mt-1">
            Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <StatsGrid columns={4}>
        <MetricCard
          title="Total de Eventos"
          value={kpiData.totalEvents}
          change={15.2}
          changeType="increase"
          icon="calendar"
          trend="up"
          description="Eventos criados este mês"
        />
        <MetricCard
          title="Participantes Ativos"
          value={kpiData.totalParticipants.toLocaleString()}
          change={kpiData.userGrowth}
          changeType="increase"
          icon="users"
          trend="up"
          description="Crescimento mensal"
        />
        <MetricCard
          title="Taxa de Engajamento"
          value={`${kpiData.avgEngagement}%`}
          change={5.1}
          changeType="increase"
          icon="activity"
          trend="up"
          description="Média dos últimos 30 dias"
        />
        <MetricCard
          title="Receita Total"
          value={`R$ ${(kpiData.totalRevenue / 1000).toFixed(0)}k`}
          change={18.7}
          changeType="increase"
          icon="dollar"
          trend="up"
          description="RadCoins convertidos"
        />
      </StatsGrid>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="ai">IA & Automação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardCard
              title="Crescimento de Participação"
              description="Participantes e eventos por mês"
              badge="Tempo Real"
              badgeVariant="default"
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={MOCK_ENGAGEMENT_DATA}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="participants" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="events" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </DashboardCard>

            <DashboardCard
              title="Distribuição por Tipo de Evento"
              description="Popularidade dos diferentes formatos"
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={MOCK_EVENT_TYPES}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {MOCK_EVENT_TYPES.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </DashboardCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DashboardCard
              title="Eventos em Destaque"
              description="Métricas dos eventos mais populares"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Quiz Cardiologia Avançada</p>
                    <p className="text-sm text-gray-600">156 participantes</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Casos Clínicos Neurologia</p>
                    <p className="text-sm text-gray-600">142 participantes</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Agendado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Radiologia Intervencionista</p>
                    <p className="text-sm text-gray-600">89 participantes</p>
                  </div>
                  <Badge className="bg-gray-100 text-gray-700">Finalizado</Badge>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard
              title="Alertas do Sistema"
              description="Notificações importantes"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">Alta taxa de abandono</p>
                    <p className="text-xs text-gray-600">Evento "Quiz Anatomia"</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Meta alcançada</p>
                    <p className="text-xs text-gray-600">1000+ participações</p>
                  </div>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard
              title="Performance IA"
              description="Eficácia das automações"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sugestões de IA aceitas</span>
                  <span className="font-semibold">87%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Otimizações aplicadas</span>
                  <span className="font-semibold">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Economia de tempo</span>
                  <span className="font-semibold">45h</span>
                </div>
              </div>
            </DashboardCard>
          </div>
        </TabsContent>

        <TabsContent value="events">
          <DashboardCard
            title="Analytics de Eventos"
            description="Métricas detalhadas por evento"
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={MOCK_ENGAGEMENT_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="events" fill="#8884d8" />
                <Bar dataKey="participants" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </DashboardCard>
        </TabsContent>

        <TabsContent value="users">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardCard
              title="Segmentação de Usuários"
              description="Por estágio acadêmico"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Residentes</span>
                  <span className="font-semibold">45%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Especialistas</span>
                  <span className="font-semibold">32%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Estudantes</span>
                  <span className="font-semibold">23%</span>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard
              title="Retenção de Usuários"
              description="Taxa de retorno por período"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>7 dias</span>
                  <span className="font-semibold text-green-600">89%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>30 dias</span>
                  <span className="font-semibold text-blue-600">67%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>90 dias</span>
                  <span className="font-semibold text-yellow-600">45%</span>
                </div>
              </div>
            </DashboardCard>
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardCard
              title="Uso de IA por Feature"
              description="Adoção das funcionalidades de IA"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Auto-preenchimento</span>
                  <span className="font-semibold">156 usos</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Sugestões inteligentes</span>
                  <span className="font-semibold">89 usos</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Otimizador de horários</span>
                  <span className="font-semibold">67 usos</span>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard
              title="ROI da Automação"
              description="Retorno do investimento em IA"
            >
              <div className="space-y-4">
                <MetricCard
                  title="Tempo Economizado"
                  value="45h"
                  description="Este mês"
                  icon="clock"
                />
                <MetricCard
                  title="Qualidade Média"
                  value="94%"
                  description="Score de eventos criados com IA"
                  icon="target"
                />
              </div>
            </DashboardCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
