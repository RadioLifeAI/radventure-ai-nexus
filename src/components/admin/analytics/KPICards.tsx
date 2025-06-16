
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Brain, Trophy, DollarSign } from "lucide-react";

interface KPICardsProps {
  userStats: any;
  caseStats: any;
  eventStats: any;
}

export function KPICards({ userStats, caseStats, eventStats }: KPICardsProps) {
  const kpiCards = [
    {
      title: "Usuários Totais",
      value: userStats?.totalUsers || 0,
      change: "+12%",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      title: "Casos Ativos",
      value: caseStats?.totalCases || 0,
      change: "+8%",
      icon: Brain,
      color: "bg-green-500"
    },
    {
      title: "Eventos Ativos",
      value: eventStats?.activeEvents || 0,
      change: "+15%",
      icon: Trophy,
      color: "bg-purple-500"
    },
    {
      title: "RadCoins Circulantes",
      value: userStats?.totalRadcoins || 0,
      change: "+22%",
      icon: DollarSign,
      color: "bg-yellow-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiCards.map((kpi, index) => (
        <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {kpi.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${kpi.color} text-white`}>
              <kpi.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{kpi.value.toLocaleString()}</div>
            <p className="text-xs text-green-600 font-medium">
              {kpi.change} vs mês anterior
            </p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 group-hover:opacity-40 transition-opacity" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
