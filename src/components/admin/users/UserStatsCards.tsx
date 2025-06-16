
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, Crown, UserX } from "lucide-react";

interface UserStatsCardsProps {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
}

export function UserStatsCards({ totalUsers, activeUsers, adminUsers }: UserStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
          <p className="text-xs text-gray-600">Últimos 30 dias</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Administradores</CardTitle>
          <Crown className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{adminUsers}</div>
          <p className="text-xs text-gray-600">Com privilégios especiais</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
          <UserX className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">68%</div>
          <p className="text-xs text-gray-600">Free para Premium</p>
        </CardContent>
      </Card>
    </div>
  );
}
