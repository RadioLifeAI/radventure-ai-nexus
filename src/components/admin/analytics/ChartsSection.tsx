
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";

interface ChartsSectionProps {
  caseStats: {
    totalCases: number;
    activeCases: number;
    completedCases: number;
  };
}

export function ChartsSection({ caseStats }: ChartsSectionProps) {
  const data = [
    { name: 'Total', value: caseStats.totalCases, fill: '#3b82f6' },
    { name: 'Ativos', value: caseStats.activeCases, fill: '#10b981' },
    { name: 'Completos', value: caseStats.completedCases, fill: '#8b5cf6' }
  ];

  return (
    <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-cyan-100 to-blue-100 rounded-t-lg border-b border-cyan-200">
        <CardTitle className="flex items-center gap-3 text-cyan-900">
          <BarChart3 className="h-5 w-5 text-cyan-600" />
          Estatísticas de Casos
          <Badge className="bg-cyan-500 text-white">Analytics</Badge>
          <div className="ml-auto flex items-center gap-1 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">+12%</span>
          </div>
        </CardTitle>
        <p className="text-sm text-cyan-700 mt-1">
          Distribuição e performance dos casos médicos
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
            <XAxis 
              dataKey="name" 
              stroke="#0891b2"
              fontSize={12}
              fontWeight={500}
            />
            <YAxis 
              stroke="#0891b2"
              fontSize={12}
              fontWeight={500}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #0891b2',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Bar 
              dataKey="value" 
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-cyan-200">
          {data.map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-lg font-bold text-cyan-900">{item.value}</div>
              <div className="text-xs text-cyan-600">{item.name}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
