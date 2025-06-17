
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, Calendar, Award, TrendingUp, Activity } from "lucide-react";

export function RealTimeKPICards() {
  const { data: kpiData, isLoading } = useQuery({
    queryKey: ["real-time-kpi"],
    queryFn: async () => {
      // Buscar dados das tabelas principais que existem
      const [
        { count: totalUsers },
        { count: totalCases },
        { count: totalEvents },
        { count: totalAchievements }
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("medical_cases").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("achievement_system").select("*", { count: "exact", head: true })
      ]);

      // Buscar usuários ativos (últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: activeUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("updated_at", sevenDaysAgo.toISOString());

      // Buscar eventos ativos
      const { count: activeEvents } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("status", "ACTIVE");

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalCases: totalCases || 0,
        totalEvents: totalEvents || 0,
        activeEvents: activeEvents || 0,
        totalAchievements: totalAchievements || 0,
        engagementRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
      };
    },
    refetchInterval: 30000 // Atualiza a cada 30 segundos
  });

  const kpiCards = [
    {
      title: "Total de Usuários",
      value: kpiData?.totalUsers || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Usuários cadastrados"
    },
    {
      title: "Usuários Ativos",
      value: kpiData?.activeUsers || 0,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Últimos 7 dias"
    },
    {
      title: "Casos Médicos",
      value: kpiData?.totalCases || 0,
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Total disponível"
    },
    {
      title: "Eventos Totais",
      value: kpiData?.totalEvents || 0,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Eventos criados"
    },
    {
      title: "Eventos Ativos",
      value: kpiData?.activeEvents || 0,
      icon: TrendingUp,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Em andamento"
    },
    {
      title: "Conquistas",
      value: kpiData?.totalAchievements || 0,
      icon: Award,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      description: "Sistema de recompensas"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpiCards.map((kpi, index) => (
        <Card key={index} className={`${kpi.bgColor} border-0 shadow-sm hover:shadow-md transition-shadow`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                <p className={`text-3xl font-bold ${kpi.color}`}>
                  {kpi.value.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{kpi.description}</p>
              </div>
              <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
