
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RewardManagementHeader } from "./reward/RewardManagementHeader";
import { Gift, Coins, Target, TrendingUp } from "lucide-react";

export function RewardManagement() {
  return (
    <div className="space-y-6">
      <RewardManagementHeader 
        totalRewards={0}
        activeRewards={0}
        distributedToday={0}
      />
      
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-50 to-rose-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-pink-800">Total RadCoins</CardTitle>
              <Coins className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-900">0</div>
              <p className="text-xs text-pink-600">em circulação</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-50 to-red-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-rose-800">Recompensas Ativas</CardTitle>
              <Gift className="h-4 w-4 text-rose-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-900">0</div>
              <p className="text-xs text-rose-600">disponíveis</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Distribuídas Hoje</CardTitle>
              <Target className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">0</div>
              <p className="text-xs text-red-600">recompensas hoje</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Engajamento</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">0%</div>
              <p className="text-xs text-purple-600">participação mensal</p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-pink-50/30">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-pink-900">
              <Gift className="h-5 w-5" />
              Sistema de Recompensas
            </CardTitle>
            <CardDescription className="text-pink-700">
              Configure recompensas, RadCoins e incentivos para usuários
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center text-gray-500 py-12">
              <Gift className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Sistema de Recompensas</h3>
              <p>Configure recompensas e o sistema de RadCoins para motivar usuários</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
