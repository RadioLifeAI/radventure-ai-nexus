
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Trophy, Coins, TrendingUp } from "lucide-react";
import { TabContentGamified } from "../layouts/TabContentGamified";

export function RewardTabs() {
  return (
    <Tabs defaultValue="rewards" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 p-1 rounded-xl">
        <TabsTrigger value="rewards" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
          <Gift className="h-4 w-4" />
          Recompensas
        </TabsTrigger>
        <TabsTrigger value="achievements" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
          <Trophy className="h-4 w-4" />
          Conquistas
        </TabsTrigger>
        <TabsTrigger value="radcoins" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
          <Coins className="h-4 w-4" />
          RadCoins
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
          <TrendingUp className="h-4 w-4" />
          Analytics
        </TabsTrigger>
      </TabsList>

      <TabsContent value="rewards" className="space-y-6">
        <TabContentGamified
          title="Gestão de Recompensas"
          description="Configure e gerencie o sistema de recompensas gamificado"
          icon={Gift}
          category="rewards"
          badge="Recompensas"
        >
          <div className="text-center py-8">
            <Gift className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
            <h3 className="text-lg font-semibold mb-2 text-yellow-800">Sistema de recompensas gamificado</h3>
            <p className="text-yellow-600">Funcionalidades avançadas em desenvolvimento</p>
          </div>
        </TabContentGamified>
      </TabsContent>

      <TabsContent value="achievements" className="space-y-6">
        <TabContentGamified
          title="Sistema de Conquistas"
          description="Gerencie badges, troféus e marcos de progresso"
          icon={Trophy}
          category="rewards"
          badge="Conquistas"
        >
          <div className="text-center py-8">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-amber-400" />
            <h3 className="text-lg font-semibold mb-2 text-amber-800">Sistema de conquistas e badges</h3>
            <p className="text-amber-600">Recursos de gamificação em desenvolvimento</p>
          </div>
        </TabContentGamified>
      </TabsContent>

      <TabsContent value="radcoins" className="space-y-6">
        <TabContentGamified
          title="Economia Virtual RadCoins"
          description="Gerencie a moeda virtual e transações do sistema"
          icon={Coins}
          category="rewards"
          badge="RadCoins"
        >
          <div className="text-center py-8">
            <Coins className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-semibold mb-2 text-yellow-800">Gestão de economia virtual RadCoins</h3>
            <p className="text-yellow-600">Sistema econômico em desenvolvimento</p>
          </div>
        </TabContentGamified>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <TabContentGamified
          title="Analytics de Recompensas"
          description="Métricas e análises do sistema de gamificação"
          icon={TrendingUp}
          category="rewards"
          badge="Analytics"
        >
          <div className="text-center py-8">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-orange-400" />
            <h3 className="text-lg font-semibold mb-2 text-orange-800">Métricas e análises do sistema de recompensas</h3>
            <p className="text-orange-600">Dashboard analítico em desenvolvimento</p>
          </div>
        </TabContentGamified>
      </TabsContent>
    </Tabs>
  );
}
