
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Star, DollarSign, TrendingDown } from "lucide-react";

interface SubscriptionStatsIntegratedProps {
  stats: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    churnRate: number;
  } | undefined;
}

export function SubscriptionStatsIntegrated({ stats }: SubscriptionStatsIntegratedProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">Total de Assinaturas</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{stats?.totalSubscriptions || 0}</div>
          <p className="text-xs text-blue-600">Todas as assinaturas</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-green-700">Assinaturas Ativas</CardTitle>
          <Star className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{stats?.activeSubscriptions || 0}</div>
          <p className="text-xs text-green-600">Atualmente ativas</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-yellow-700">Receita Mensal</CardTitle>
          <DollarSign className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-900">
            {formatCurrency(stats?.monthlyRevenue || 0)}
          </div>
          <p className="text-xs text-yellow-600">Receita recorrente</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-red-700">Taxa de Churn</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-900">
            {(stats?.churnRate || 0).toFixed(1)}%
          </div>
          <p className="text-xs text-red-600">Cancelamentos mensais</p>
        </CardContent>
      </Card>
    </div>
  );
}
