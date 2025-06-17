
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Trophy, Coins, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RewardTabs() {
  return (
    <Tabs defaultValue="rewards" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6">
        <TabsTrigger value="rewards" className="flex items-center gap-2">
          <Gift className="h-4 w-4" />
          Recompensas
        </TabsTrigger>
        <TabsTrigger value="achievements" className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Conquistas
        </TabsTrigger>
        <TabsTrigger value="radcoins" className="flex items-center gap-2">
          <Coins className="h-4 w-4" />
          RadCoins
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Analytics
        </TabsTrigger>
      </TabsList>

      <TabsContent value="rewards" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Gestão de Recompensas</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Sistema de recompensas gamificado em desenvolvimento</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="achievements" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Conquistas</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Sistema de conquistas e badges em desenvolvimento</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="radcoins" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>RadCoins</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Gestão de economia virtual RadCoins em desenvolvimento</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Analytics de Recompensas</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Métricas e análises do sistema de recompensas em desenvolvimento</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
