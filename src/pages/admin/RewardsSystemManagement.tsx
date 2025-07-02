
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RewardSystemStatus } from "@/components/admin/rewards/RewardSystemStatus";
import { Settings, TrendingUp, Users, Coins } from "lucide-react";

export default function RewardsSystemManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
          <Coins className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sistema de Recompensas</h1>
          <p className="text-gray-600">Gestão completa da economia RadCoin e benefícios</p>
        </div>
      </div>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Status do Sistema
          </TabsTrigger>
          <TabsTrigger value="login" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Bônus de Login
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Assinaturas
          </TabsTrigger>
          <TabsTrigger value="economy" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Economia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <RewardSystemStatus />
        </TabsContent>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Bônus de Login</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bônus Base</label>
                    <input 
                      type="number" 
                      value={5} 
                      className="w-full px-3 py-2 border rounded-lg"
                      disabled
                    />
                    <p className="text-xs text-gray-500">RadCoins por login diário</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bônus de Streak</label>
                    <input 
                      type="number" 
                      value={15} 
                      className="w-full px-3 py-2 border rounded-lg"
                      disabled
                    />
                    <p className="text-xs text-gray-500">RadCoins extras por streak de 7+ dias</p>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800">Sistema Ativo</h3>
                  <p className="text-sm text-green-700">
                    O bônus de login diário está funcionando automaticamente.
                    Usuários recebem 5 RadCoins por dia + bônus de streak.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Benefícios de Assinatura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800">Sistema Integrado</h3>
                  <p className="text-sm text-blue-700">
                    Os benefícios de assinatura são aplicados automaticamente:
                  </p>
                  <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                    <li>RadCoins mensais conforme plano</li>
                    <li>Ajudas extras (eliminação, pular, IA tutor)</li>
                    <li>Selos de colaborador</li>
                    <li>Multiplicadores de XP</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="economy">
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral da Economia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold text-yellow-800">Economia Balanceada</h3>
                  <p className="text-sm text-yellow-700">
                    O sistema de RadCoins está funcionando de forma equilibrada:
                  </p>
                  <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                    <li>Entrada: Login diário, eventos, assinaturas</li>
                    <li>Saída: RadBot AI, loja de ajudas</li>
                    <li>Ciclo sustentável e educacionalmente benéfico</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
