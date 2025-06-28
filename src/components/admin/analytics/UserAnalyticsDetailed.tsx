
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

export function UserAnalyticsDetailed() {
  const { data: userGrowthData } = useQuery({
    queryKey: ['user-growth-detailed'],
    queryFn: async () => {
      console.log('📈 Buscando dados reais de crescimento de usuários...');
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('created_at, academic_stage, type')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Crescimento por semana dos últimos 12 semanas
      const weeks = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (11 - i) * 7);
        return date;
      });
      
      const growthData = weeks.map(weekStart => {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        const weekUsers = profiles?.filter(p => {
          const userDate = new Date(p.created_at);
          return userDate >= weekStart && userDate < weekEnd;
        }).length || 0;
        
        return {
          semana: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
          novos_usuarios: weekUsers
        };
      });
      
      console.log('✅ Dados de crescimento calculados:', growthData.length, 'semanas');
      return growthData;
    },
    refetchInterval: 60000
  });

  const { data: academicStageData } = useQuery({
    queryKey: ['academic-stage-distribution'],
    queryFn: async () => {
      console.log('🎓 Buscando distribuição real por estágio acadêmico...');
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('academic_stage');
      
      if (error) throw error;
      
      const distribution = profiles?.reduce((acc: any, profile) => {
        const stage = profile.academic_stage || 'Não definido';
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
      }, {}) || {};
      
      const result = Object.entries(distribution).map(([name, value]) => ({
        name,
        value: value as number
      }));
      
      console.log('✅ Distribuição calculada:', result.length, 'categorias');
      return result;
    },
    refetchInterval: 60000
  });

  const { data: userActivityData } = useQuery({
    queryKey: ['user-activity-detailed'],
    queryFn: async () => {
      console.log('📊 Buscando atividade real de usuários...');
      
      const { data: history, error } = await supabase
        .from('user_case_history')
        .select('user_id, answered_at, is_correct')
        .order('answered_at', { ascending: true });
      
      if (error) throw error;
      
      // Atividade por dia dos últimos 14 dias
      const days = Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (13 - i));
        return date.toISOString().split('T')[0];
      });
      
      const activityData = days.map(date => {
        const dayActivity = history?.filter(h => h.answered_at.startsWith(date)) || [];
        const uniqueUsers = new Set(dayActivity.map(h => h.user_id)).size;
        const totalAttempts = dayActivity.length;
        const correctAnswers = dayActivity.filter(h => h.is_correct).length;
        
        return {
          data: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          usuarios_ativos: uniqueUsers,
          tentativas: totalAttempts,
          acertos: correctAnswers
        };
      });
      
      console.log('✅ Atividade calculada:', activityData.length, 'dias');
      return activityData;
    },
    refetchInterval: 60000
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Crescimento Semanal - Dados Reais */}
      <Card>
        <CardHeader>
          <CardTitle>Crescimento de Usuários (12 semanas) - Dados Reais</CardTitle>
          <CardDescription>Novos registros por semana baseado em dados do Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userGrowthData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semana" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="novos_usuarios" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribuição por Estágio Acadêmico - Dados Reais */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Estágio Acadêmico - Dados Reais</CardTitle>
          <CardDescription>Perfil dos usuários registrados no banco</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={academicStageData || []}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {(academicStageData || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Atividade Diária de Usuários - Dados Reais */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Atividade de Usuários (14 dias) - Dados Reais</CardTitle>
          <CardDescription>Usuários ativos e tentativas de casos diárias do banco de dados</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userActivityData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="usuarios_ativos" stroke="#8884d8" strokeWidth={2} name="Usuários Ativos" />
              <Line yAxisId="right" type="monotone" dataKey="tentativas" stroke="#82ca9d" strokeWidth={2} name="Tentativas" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
