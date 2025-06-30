
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flag, Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface ReportsStatsProps {
  stats: {
    total: number;
    pending: number;
    resolved: number;
    in_progress: number;
  };
}

export function ReportsStats({ stats }: ReportsStatsProps) {
  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-900">Total Reports</CardTitle>
          <Flag className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          <p className="text-xs text-blue-700">Todos os reports enviados</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md bg-gradient-to-br from-yellow-50 to-yellow-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-900">Pendentes</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
          <p className="text-xs text-yellow-700">Aguardando análise</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-900">Em Progresso</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">{stats.in_progress}</div>
          <p className="text-xs text-orange-700">Sendo analisados</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-900">Resolvidos</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{stats.resolved}</div>
          <p className="text-xs text-green-700">Taxa: {resolutionRate}%</p>
        </CardContent>
      </Card>
    </div>
  );
}
