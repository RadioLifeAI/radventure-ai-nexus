
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import {
  TrendingUp,
  Users,
  Trophy,
  Calendar,
  Target,
  Clock,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react";

interface Event {
  id: string;
  name: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string;
  prize_radcoins: number;
  max_participants?: number;
  number_of_cases?: number;
}

interface Props {
  events: Event[];
}

export function EventsAnalyticsView({ events }: Props) {
  // Análise por Status
  const statusAnalysis = () => {
    const statusCounts = events.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      label: {
        DRAFT: "Rascunho",
        SCHEDULED: "Agendado",
        ACTIVE: "Ativo",
        FINISHED: "Finalizado",
        CANCELLED: "Cancelado"
      }[status] || status
    }));
  };

  // Análise por Mês
  const monthlyAnalysis = () => {
    const monthCounts = events.reduce((acc, event) => {
      const month = new Date(event.scheduled_start).toLocaleDateString('pt-BR', { 
        month: 'short', 
        year: 'numeric' 
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthCounts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  };

  // Análise de Prêmios
  const prizeAnalysis = () => {
    const prizeRanges = {
      "0-500": 0,
      "501-1000": 0,
      "1001-2000": 0,
      "2001-5000": 0,
      "5000+": 0
    };

    events.forEach(event => {
      const prize = event.prize_radcoins;
      if (prize <= 500) prizeRanges["0-500"]++;
      else if (prize <= 1000) prizeRanges["501-1000"]++;
      else if (prize <= 2000) prizeRanges["1001-2000"]++;
      else if (prize <= 5000) prizeRanges["2001-5000"]++;
      else prizeRanges["5000+"]++;
    });

    return Object.entries(prizeRanges).map(([range, count]) => ({
      range,
      count
    }));
  };

  // KPIs Gerais
  const kpis = {
    totalEvents: events.length,
    activeEvents: events.filter(e => e.status === "ACTIVE").length,
    scheduledEvents: events.filter(e => e.status === "SCHEDULED").length,
    totalPrizePool: events.reduce((sum, e) => sum + e.prize_radcoins, 0),
    averagePrize: events.length > 0 ? Math.round(events.reduce((sum, e) => sum + e.prize_radcoins, 0) / events.length) : 0,
    totalParticipantSlots: events.reduce((sum, e) => sum + (e.max_participants || 0), 0),
    averageParticipants: events.filter(e => e.max_participants).length > 0 
      ? Math.round(events.filter(e => e.max_participants).reduce((sum, e) => sum + (e.max_participants || 0), 0) / events.filter(e => e.max_participants).length)
      : 0
  };

  const statusData = statusAnalysis();
  const monthlyData = monthlyAnalysis();
  const prizeData = prizeAnalysis();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">Nenhum dado para análise</div>
        <div className="text-gray-500 text-sm">Crie alguns eventos para ver analytics</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Eventos</p>
                <p className="text-2xl font-bold text-blue-600">{kpis.totalEvents}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eventos Ativos</p>
                <p className="text-2xl font-bold text-green-600">{kpis.activeEvents}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pool Total de Prêmios</p>
                <p className="text-2xl font-bold text-yellow-600">{kpis.totalPrizePool.toLocaleString()}</p>
                <p className="text-xs text-gray-500">RadCoins</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vagas Totais</p>
                <p className="text-2xl font-bold text-purple-600">{kpis.totalParticipantSlots}</p>
                <p className="text-xs text-gray-500">Participantes</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Eventos por Mês */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Eventos por Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Análise de Prêmios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Distribuição de Faixas de Prêmios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prizeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} eventos`, 'Quantidade']}
                labelFormatter={(label) => `Faixa: ${label} RadCoins`}
              />
              <Bar dataKey="count" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Métricas Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Prêmio Médio</h3>
            <p className="text-3xl font-bold text-yellow-600">{kpis.averagePrize}</p>
            <p className="text-sm text-gray-500">RadCoins por evento</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Participantes Médios</h3>
            <p className="text-3xl font-bold text-purple-600">{kpis.averageParticipants}</p>
            <p className="text-sm text-gray-500">Por evento</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Taxa de Agendamento</h3>
            <p className="text-3xl font-bold text-blue-600">
              {events.length > 0 ? Math.round((kpis.scheduledEvents / events.length) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-500">Eventos programados</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
