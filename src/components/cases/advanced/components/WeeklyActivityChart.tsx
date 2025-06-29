
import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { RealUserStats } from "@/hooks/useRealUserStats";

interface Props {
  stats: RealUserStats;
}

export function WeeklyActivityChart({ stats }: Props) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={stats.weeklyActivity}>
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
