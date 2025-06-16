
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Star, DollarSign, TrendingUp } from "lucide-react";

interface SubscriptionStatsProps {
  stats: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    churnRate: number;
  } | undefined;
}

export function SubscriptionStats({ stats }: SubscriptionStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total de Assinaturas</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats?.totalSubscriptions || 0}</div>
          <p className="text-xs text-gray-600">Todas as assinaturas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
          <Star className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats?.activeSubscriptions || 0}</div>
          <p className="text-xs text-gray-600">Atualmente ativas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
          <DollarSign className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            R$ {(stats?.monthlyRevenue || 0).toFixed(2)}
          </div>
          <p className="text-xs text-gray-600">Receita recorrente</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Churn</CardTitle>
          <TrendingUp className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {(stats?.churnRate || 0).toFixed(1)}%
          </div>
          <p className="text-xs text-gray-600">Cancelamentos mensais</p>
        </CardContent>
      </Card>
    </div>
  );
}
