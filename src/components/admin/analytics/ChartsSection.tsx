
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChartsSectionProps {
  caseStats: {
    totalCases: number;
    activeCases: number;
    completedCases: number;
  };
}

export function ChartsSection({ caseStats }: ChartsSectionProps) {
  const data = [
    { name: 'Total', value: caseStats.totalCases },
    { name: 'Ativos', value: caseStats.activeCases },
    { name: 'Completos', value: caseStats.completedCases }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas de Casos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
