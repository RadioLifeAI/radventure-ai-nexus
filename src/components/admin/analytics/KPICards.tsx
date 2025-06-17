
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Brain, Trophy, DollarSign, TrendingUp, Sparkles, Activity, Zap } from "lucide-react";

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
      bgGradient: "from-blue-50 to-indigo-100",
      borderColor: "border-blue-200",
      iconBg: "bg-blue-500",
      changeColor: "text-green-600",
      description: "Usuários registrados"
    },
    {
      title: "Casos Ativos",
      value: caseStats?.totalCases || 0,
      change: "+8%",
      icon: Brain,
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-100",
      borderColor: "border-green-200",
      iconBg: "bg-green-500",
      changeColor: "text-green-600",
      description: "Casos disponíveis"
    },
    {
      title: "Eventos Ativos",
      value: eventStats?.activeEvents || 0,
      change: "+15%",
      icon: Trophy,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-pink-100",
      borderColor: "border-purple-200",
      iconBg: "bg-purple-500",
      changeColor: "text-green-600",
      description: "Eventos em andamento"
    },
    {
      title: "RadCoins Circulantes",
      value: userStats?.totalRadcoins || 0,
      change: "+22%",
      icon: DollarSign,
      gradient: "from-yellow-500 to-amber-600",
      bgGradient: "from-yellow-50 to-amber-100",
      borderColor: "border-yellow-200",
      iconBg: "bg-yellow-500",
      changeColor: "text-green-600",
      description: "Moedas em circulação"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiCards.map((kpi, index) => (
        <Card key={index} className={`relative overflow-hidden border-2 ${kpi.borderColor} bg-gradient-to-br ${kpi.bgGradient} shadow-xl hover:shadow-2xl transition-all duration-300 group animate-fade-in hover:scale-105`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              {kpi.title}
            </CardTitle>
            <div className={`p-3 rounded-xl ${kpi.iconBg} text-white shadow-lg group-hover:scale-110 transition-transform`}>
              <kpi.icon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <div className="text-3xl font-bold text-gray-900">{kpi.value.toLocaleString()}</div>
              <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1 shadow-sm">
                <TrendingUp className="h-3 w-3" />
                {kpi.change}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-gray-500" />
              <p className="text-xs text-gray-600 font-medium">{kpi.description}</p>
            </div>
            
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-gray-500" />
              <p className="text-xs text-gray-500">vs mês anterior</p>
            </div>
            
            {/* Animated bottom bar */}
            <div className={`absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r ${kpi.gradient} opacity-30 group-hover:opacity-60 transition-opacity`} />
            
            {/* Floating sparkle effect */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Zap className="h-4 w-4 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
