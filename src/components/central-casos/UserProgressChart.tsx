
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp } from "lucide-react";

interface UserProgressChartProps {
  userStats: {
    totalCases: number;
    correctCases: number;
    totalPoints: number;
    accuracy: number;
    history: any[];
  } | null;
}

export function UserProgressChart({ userStats }: UserProgressChartProps) {
  if (!userStats || userStats.history.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-8 text-center">
            <TrendingUp className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Sem dados de progresso
            </h3>
            <p className="text-cyan-200">
              Resolva alguns casos para ver suas estatísticas de progresso aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dailyProgress = generateDailyProgress(userStats.history);
  const weeklyProgress = generateWeeklyProgress(userStats.history);

  return (
    <div className="space-y-6">
      {/* Progresso diário */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            Progresso dos Últimos 7 Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="day" 
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
              />
              <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="cases" 
                stroke="#06b6d4" 
                strokeWidth={3}
                dot={{ fill: '#06b6d4', strokeWidth: 2, r: 6 }}
                name="Casos Resolvidos"
              />
              <Line 
                type="monotone" 
                dataKey="points" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                name="Pontos Ganhos"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Progresso semanal */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Progresso Semanal - Taxa de Acerto</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="week" 
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.6)" 
                fontSize={12}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#fff' }}
                formatter={(value) => [`${value}%`, 'Taxa de Acerto']}
              />
              <Bar 
                dataKey="accuracy" 
                fill="url(#accuracyGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function generateDailyProgress(history: any[]) {
  const last7Days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dayHistory = history.filter(record => {
      const recordDate = new Date(record.answered_at);
      return recordDate.toDateString() === date.toDateString();
    });
    
    last7Days.push({
      day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
      cases: dayHistory.length,
      points: dayHistory.reduce((sum, record) => sum + (record.points || 0), 0),
      accuracy: dayHistory.length > 0 
        ? Math.round((dayHistory.filter(r => r.is_correct).length / dayHistory.length) * 100)
        : 0
    });
  }
  
  return last7Days;
}

function generateWeeklyProgress(history: any[]) {
  const weeks = [];
  const today = new Date();
  
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 7 * i));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekHistory = history.filter(record => {
      const recordDate = new Date(record.answered_at);
      return recordDate >= weekStart && recordDate <= weekEnd;
    });
    
    const accuracy = weekHistory.length > 0 
      ? Math.round((weekHistory.filter(r => r.is_correct).length / weekHistory.length) * 100)
      : 0;
    
    weeks.push({
      week: `Sem ${4 - i}`,
      accuracy,
      cases: weekHistory.length
    });
  }
  
  return weeks;
}
