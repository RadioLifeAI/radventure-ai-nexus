
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AchievementManagementHeader } from "./achievement/AchievementManagementHeader";
import { Trophy, Medal, Star, Target } from "lucide-react";

export function AchievementManagement() {
  return (
    <div className="space-y-6">
      <AchievementManagementHeader 
        totalAchievements={0}
        activeAchievements={0}
        unlockedToday={0}
      />
      
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">Total de Conquistas</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">0</div>
              <p className="text-xs text-yellow-600">conquistas criadas</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Conquistas Ativas</CardTitle>
              <Medal className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">0</div>
              <p className="text-xs text-orange-600">disponíveis para usuários</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Desbloqueadas Hoje</CardTitle>
              <Star className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">0</div>
              <p className="text-xs text-red-600">conquistas hoje</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Taxa de Conclusão</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">0%</div>
              <p className="text-xs text-purple-600">média de conquistas</p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-yellow-50/30">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <Trophy className="h-5 w-5" />
              Sistema de Conquistas
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Configure e gerencie conquistas gamificadas para motivar os usuários
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center text-gray-500 py-12">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Sistema de Conquistas</h3>
              <p>Configure conquistas e recompensas para engajar os usuários</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
