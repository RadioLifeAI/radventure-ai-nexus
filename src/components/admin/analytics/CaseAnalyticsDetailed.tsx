
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export function CaseAnalyticsDetailed() {
  const { data: difficultyData } = useQuery({
    queryKey: ['case-difficulty-distribution'],
    queryFn: async () => {
      const { data: cases, error } = await supabase
        .from('medical_cases')
        .select('difficulty_level');
      
      if (error) throw error;
      
      const distribution = cases?.reduce((acc: any, case_) => {
        const level = case_.difficulty_level || 'Não definido';
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {}) || {};
      
      return Object.entries(distribution).map(([level, count]) => ({
        dificuldade: `Nível ${level}`,
        casos: count as number
      }));
    },
    refetchInterval: 60000
  });

  const { data: specialtyPerformance } = useQuery({
    queryKey: ['specialty-performance'],
    queryFn: async () => {
      const { data: history, error } = await supabase
        .from('user_case_history')
        .select(`
          is_correct,
          case_id,
          medical_cases!inner (
            specialty
          )
        `);
      
      if (error) throw error;
      
      const specialtyStats = history?.reduce((acc: any, attempt) => {
        const specialty = attempt.medical_cases?.specialty || 'Não definido';
        if (!acc[specialty]) {
          acc[specialty] = { total: 0, correct: 0 };
        }
        acc[specialty].total++;
        if (attempt.is_correct) {
          acc[specialty].correct++;
        }
        return acc;
      }, {}) || {};
      
      return Object.entries(specialtyStats).map(([specialty, stats]: [string, any]) => ({
        especialidade: specialty.length > 15 ? specialty.substring(0, 15) + '...' : specialty,
        taxa_acerto: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
        total_tentativas: stats.total
      }));
    },
    refetchInterval: 60000
  });

  const { data: casePopularity } = useQuery({
    queryKey: ['case-popularity'],
    queryFn: async () => {
      const { data: history, error } = await supabase
        .from('user_case_history')
        .select(`
          case_id,
          medical_cases!inner (
            title,
            specialty
          )
        `);
      
      if (error) throw error;
      
      const caseCount = history?.reduce((acc: any, attempt) => {
        const caseTitle = attempt.medical_cases?.title || 'Caso sem título';
        acc[caseTitle] = (acc[caseTitle] || 0) + 1;
        return acc;
      }, {}) || {};
      
      return Object.entries(caseCount)
        .map(([title, count]) => ({
          caso: title.length > 20 ? title.substring(0, 20) + '...' : title,
          tentativas: count as number
        }))
        .sort((a, b) => b.tentativas - a.tentativas)
        .slice(0, 10);
    },
    refetchInterval: 60000
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Distribuição por Dificuldade */}
      <Card>
        <CardHeader>
          <CardTitle>Casos por Nível de Dificuldade</CardTitle>
          <CardDescription>Distribuição dos casos cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={difficultyData || []}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="casos"
                label={({ dificuldade, percent }) => `${dificuldade} ${(percent * 100).toFixed(0)}%`}
              >
                {(difficultyData || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance por Especialidade */}
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Acerto por Especialidade</CardTitle>
          <CardDescription>Performance dos usuários por área médica</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={specialtyPerformance || []} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="especialidade" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="taxa_acerto" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Casos Mais Populares */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Top 10 Casos Mais Tentados</CardTitle>
          <CardDescription>Casos com maior número de tentativas dos usuários</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={casePopularity || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="caso" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tentativas" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
