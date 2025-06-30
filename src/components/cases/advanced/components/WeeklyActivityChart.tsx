
import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { RealUserStats } from "@/hooks/useRealUserStats";

interface Props {
  stats: RealUserStats;
}

export function WeeklyActivityChart({ stats }: Props) {
  // Gerar dados de atividade semanal baseados na atividade recente
  const generateWeeklyActivity = () => {
    const weeklyData = [];
    const today = new Date();
    
    // Criar dados dos últimos 7 dias
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Filtrar atividade recente para o dia específico
      const dayActivity = stats.recentActivity.filter(activity => 
        activity.answeredAt.startsWith(dateStr)
      );
      
      weeklyData.push({
        date: dateStr,
        cases: dayActivity.length,
        points: dayActivity.reduce((sum, activity) => sum + activity.points, 0)
      });
    }
    
    return weeklyData;
  };

  const weeklyActivity = generateWeeklyActivity();

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={weeklyActivity}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' })}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Tooltip 
            labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
            formatter={(value, name) => [value, name === 'cases' ? 'Casos' : 'Pontos']}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="cases" 
            stroke="#2563eb" 
            strokeWidth={3}
            dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="points" 
            stroke="#059669" 
            strokeWidth={2}
            dot={{ fill: '#059669', strokeWidth: 2, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
