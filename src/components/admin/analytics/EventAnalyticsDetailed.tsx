
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

export function EventAnalyticsDetailed() {
  const { data: eventStatusData } = useQuery({
    queryKey: ['event-status-distribution'],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from('events')
        .select('status');
      
      if (error) throw error;
      
      const distribution = events?.reduce((acc: any, event) => {
        const status = event.status || 'Não definido';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}) || {};
      
      return Object.entries(distribution).map(([status, count]) => ({
        status,
        eventos: count as number
      }));
    },
    refetchInterval: 60000
  });

  const { data: participationTrend } = useQuery({
    queryKey: ['event-participation-trend'],
    queryFn: async () => {
      const { data: registrations, error } = await supabase
        .from('event_registrations')
        .select(`
          registered_at,
          events!inner (
            name,
            scheduled_start
          )
        `)
        .order('registered_at', { ascending: true });
      
      if (error) throw error;
      
      // Registros por semana das últimas 8 semanas
      const weeks = Array.from({ length: 8 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (7 - i) * 7);
        return date;
      });
      
      const trendData = weeks.map(weekStart => {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        const weekRegistrations = registrations?.filter(r => {
          const regDate = new Date(r.registered_at);
          return regDate >= weekStart && regDate < weekEnd;
        }).length || 0;
        
        return {
          semana: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
          inscricoes: weekRegistrations
        };
      });
      
      return trendData;
    },
    refetchInterval: 60000
  });

  const { data: prizeDistribution } = useQuery({
    queryKey: ['event-prize-distribution'],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from('events')
        .select('prize_radcoins, name');
      
      if (error) throw error;
      
      const prizeRanges = {
        '0-500': 0,
        '501-1000': 0,
        '1001-2000': 0,
        '2000+': 0
      };
      
      events?.forEach(event => {
        const prize = event.prize_radcoins || 0;
        if (prize <= 500) prizeRanges['0-500']++;
        else if (prize <= 1000) prizeRanges['501-1000']++;
        else if (prize <= 2000) prizeRanges['1001-2000']++;
        else prizeRanges['2000+']++;
      });
      
      return Object.entries(prizeRanges).map(([range, count]) => ({
        faixa_premio: `${range} RC`,
        eventos: count
      }));
    },
    refetchInterval: 60000
  });

  const { data: eventPerformance } = useQuery({
    queryKey: ['event-performance'],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from('events')
        .select(`
          id,
          name,
          max_participants,
          event_registrations (count)
        `);
      
      if (error) throw error;
      
      return events?.map(event => ({
        evento: event.name.length > 15 ? event.name.substring(0, 15) + '...' : event.name,
        participantes: event.event_registrations?.[0]?.count || 0,
        limite: event.max_participants || 0,
        taxa_ocupacao: event.max_participants ? 
          Math.round(((event.event_registrations?.[0]?.count || 0) / event.max_participants) * 100) : 0
      }))
      .sort((a, b) => b.participantes - a.participantes)
      .slice(0, 10) || [];
    },
    refetchInterval: 60000
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status dos Eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Status</CardTitle>
          <CardDescription>Status atual dos eventos</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={eventStatusData || []}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="eventos"
                label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
              >
                {(eventStatusData || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tendência de Inscrições */}
      <Card>
        <CardHeader>
          <CardTitle>Tendência de Inscrições (8 semanas)</CardTitle>
          <CardDescription>Inscrições em eventos por semana</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={participationTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semana" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="inscricoes" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribuição de Prêmios */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Prêmios</CardTitle>
          <CardDescription>Eventos por faixa de RadCoins</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prizeDistribution || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="faixa_premio" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="eventos" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance dos Eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Eventos por Participação</CardTitle>
          <CardDescription>Eventos com maior número de participantes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eventPerformance || []} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="evento" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="participantes" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
