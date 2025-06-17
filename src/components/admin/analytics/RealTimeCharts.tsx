
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export function RealTimeCharts() {
  const { data: userGrowthData } = useQuery({
    queryKey: ['user-growth-chart'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('created_at')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Agrupar por dia dos últimos 30 dias
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });
      
      const growthData = last30Days.map(date => {
        const usersUntilDate = profiles?.filter(p => p.created_at.split('T')[0] <= date).length || 0;
        const newUsersThisDay = profiles?.filter(p => p.created_at.split('T')[0] === date).length || 0;
        
        return {
          date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          total: usersUntilDate,
          novos: newUsersThisDay
        };
      });
      
      return growthData;
    },
    refetchInterval: 60000
  });

  const { data: specialtyDistribution } = useQuery({
    queryKey: ['specialty-distribution'],
    queryFn: async () => {
      const { data: cases, error } = await supabase
        .from('medical_cases')
        .select('specialty');
      
      if (error) throw error;
      
      const distribution = cases?.reduce((acc: any, case_: any) => {
        const specialty = case_.specialty || 'Não definida';
        acc[specialty] = (acc[specialty] || 0) + 1;
        return acc;
      }, {}) || {};
      
      return Object.entries(distribution).map(([name, value]) => ({
        name,
        value: value as number
      }));
    },
    refetchInterval: 60000
  });

  const { data: performanceData } = useQuery({
    queryKey: ['performance-chart'],
    queryFn: async () => {
      const { data: history, error } = await supabase
        .from('user_case_history')
        .select('answered_at, is_correct, case_id')
        .order('answered_at', { ascending: true });
      
      if (error) throw error;
      
      // Agrupar por dia dos últimos 14 dias
      const last14Days = Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (13 - i));
        return date.toISOString().split('T')[0];
      });
      
      const performanceData = last14Days.map(date => {
        const dayAttempts = history?.filter(h => h.answered_at.split('T')[0] === date) || [];
        const correct = dayAttempts.filter(h => h.is_correct).length;
        const total = dayAttempts.length;
        const accuracy = total > 0 ? (correct / total) * 100 : 0;
        
        return {
          date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          tentativas: total,
          acertos: correct,
          taxa_acerto: Math.round(accuracy)
        };
      });
      
      return performanceData;
    },
    refetchInterval: 60000
  });

  const { data: eventParticipation } = useQuery({
    queryKey: ['event-participation'],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from('events')
        .select('id, name, status')
        .limit(10)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const { data: registrations, error: regError } = await supabase
        .from('event_registrations')
        .select('event_id');
        
      if (regError) throw regError;
      
      const participationData = events?.map(event => {
        const eventRegistrations = registrations?.filter(r => r.event_id === event.id).length || 0;
        return {
          name: event.name.length > 15 ? event.name.substring(0, 15) + '...' : event.name,
          participantes: eventRegistrations,
          status: event.status
        };
      }) || [];
      
      return participationData;
    },
    refetchInterval: 60000
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Crescimento de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Crescimento de Usuários (30 dias)</CardTitle>
          <CardDescription>Novos usuários e total acumulado</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="right" dataKey="novos" fill="#8884d8" name="Novos usuários" />
              <Line yAxisId="left" type="monotone" dataKey="total" stroke="#82ca9d" strokeWidth={2} name="Total acumulado" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance de Casos */}
      <Card>
        <CardHeader>
          <CardTitle>Performance (14 dias)</CardTitle>
          <CardDescription>Tentativas e taxa de acerto diária</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="tentativas" fill="#8884d8" name="Tentativas" />
              <Line yAxisId="right" type="monotone" dataKey="taxa_acerto" stroke="#ff7300" strokeWidth={2} name="Taxa de acerto %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribuição por Especialidade */}
      <Card>
        <CardHeader>
          <CardTitle>Casos por Especialidade</CardTitle>
          <CardDescription>Distribuição dos casos médicos</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={specialtyDistribution || []}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {(specialtyDistribution || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Participação em Eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Participação em Eventos</CardTitle>
          <CardDescription>Últimos 10 eventos criados</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eventParticipation || []} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="participantes" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
