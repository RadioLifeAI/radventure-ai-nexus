
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Brain, Trophy, DollarSign, TrendingUp, Sparkles } from "lucide-react";

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
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200"
    },
    {
      title: "Casos Ativos",
      value: caseStats?.totalCases || 0,
      change: "+8%",
      icon: Brain,
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      borderColor: "border-green-200"
    },
    {
      title: "Eventos Ativos",
      value: eventStats?.activeEvents || 0,
      change: "+15%",
      icon: Trophy,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200"
    },
    {
      title: "RadCoins Circulantes",
      value: userStats?.totalRadcoins || 0,
      change: "+22%",
      icon: DollarSign,
      gradient: "from-yellow-500 to-yellow-600",
      bgGradient: "from-yellow-50 to-yellow-100",
      borderColor: "border-yellow-200"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiCards.map((kpi, index) => (
        <Card key={index} className={`relative overflow-hidden border-2 ${kpi.borderColor} bg-gradient-to-br ${kpi.bgGradient} shadow-lg hover:shadow-xl transition-all duration-300 group animate-fade-in`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {kpi.title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-gradient-to-r ${kpi.gradient} text-white shadow-md`}>
              <kpi.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900">{kpi.value.toLocaleString()}</div>
              <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {kpi.change}
              </Badge>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Sparkles className="h-3 w-3 text-gray-500" />
              <p className="text-xs text-gray-600">vs mês anterior</p>
            </div>
            <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${kpi.gradient} opacity-20 group-hover:opacity-40 transition-opacity`} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
