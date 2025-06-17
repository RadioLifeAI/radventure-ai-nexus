
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3, TrendingUp, Activity, Target, Zap } from "lucide-react";

interface ChartsSectionProps {
  caseStats: {
    totalCases: number;
    activeCases: number;
    completedCases: number;
  };
}

export function ChartsSection({ caseStats }: ChartsSectionProps) {
  const data = [
    { 
      name: 'Total', 
      value: caseStats.totalCases, 
      fill: '#3b82f6',
      description: 'Casos totais cadastrados'
    },
    { 
      name: 'Ativos', 
      value: caseStats.activeCases, 
      fill: '#10b981',
      description: 'Casos disponíveis para uso'
    },
    { 
      name: 'Completos', 
      value: caseStats.completedCases, 
      fill: '#8b5cf6',
      description: 'Casos finalizados'
    }
  ];

  const totalCases = caseStats.totalCases;
  const completionRate = totalCases > 0 ? ((caseStats.completedCases / totalCases) * 100).toFixed(1) : '0';

  return (
    <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-100 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in group">
      <CardHeader className="bg-gradient-to-r from-cyan-100 to-blue-200 rounded-t-lg border-b-2 border-cyan-200 pb-4">
        <CardTitle className="flex items-center gap-3 text-cyan-900">
          <div className="p-2 bg-cyan-500 rounded-lg text-white shadow-lg group-hover:scale-110 transition-transform">
            <BarChart3 className="h-6 w-6" />
          </div>
          Estatísticas de Casos Médicos
          <Badge className="bg-cyan-500 text-white shadow-sm">Analytics</Badge>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-bold">+12%</span>
            </div>
            <div className="flex items-center gap-1 text-cyan-600 bg-cyan-100 px-2 py-1 rounded-full">
              <Target className="h-4 w-4" />
              <span className="text-sm font-bold">{completionRate}%</span>
            </div>
          </div>
        </CardTitle>
        <p className="text-sm text-cyan-700 mt-2 flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Distribuição e performance dos casos médicos da plataforma
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" strokeWidth={1} />
            <XAxis 
              dataKey="name" 
              stroke="#0891b2"
              fontSize={13}
              fontWeight={600}
              tick={{ fill: '#0891b2' }}
            />
            <YAxis 
              stroke="#0891b2"
              fontSize={13}
              fontWeight={600}
              tick={{ fill: '#0891b2' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#f0f9ff',
                border: '2px solid #0891b2',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '500',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}
              labelStyle={{ color: '#0891b2', fontWeight: 'bold' }}
            />
            <Bar 
              dataKey="value" 
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t-2 border-cyan-200">
          {data.map((item, index) => (
            <div key={index} className="text-center p-4 bg-white/50 rounded-xl border border-cyan-200 hover:bg-white/80 transition-all group/stat">
              <div className="text-2xl font-bold text-cyan-900 mb-1 group-hover/stat:scale-110 transition-transform">
                {item.value}
              </div>
              <div className="text-sm font-semibold text-cyan-700 mb-1">{item.name}</div>
              <div className="text-xs text-cyan-600">{item.description}</div>
              <div className="mt-2 opacity-0 group-hover/stat:opacity-100 transition-opacity">
                <Zap className="h-4 w-4 text-yellow-500 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
