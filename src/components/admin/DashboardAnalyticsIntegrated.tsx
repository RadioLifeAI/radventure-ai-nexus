
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Crown, Users, FileText, Calendar, Trophy } from "lucide-react";
import { RealTimeKPICards } from "./analytics/RealTimeKPICards";
import { RealTimeCharts } from "./analytics/RealTimeCharts";

export function DashboardAnalyticsIntegrated() {
  const [selectedMetric, setSelectedMetric] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header Gamificado */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="text-yellow-300" />
              Analytics Dashboard
              <Crown className="text-yellow-300" />
            </h1>
            <p className="text-blue-100 mt-2">Dados em tempo real da plataforma médica</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">🏆 Nível Master</div>
            <div className="text-blue-200">Admin Analytics Pro</div>
          </div>
        </div>
      </div>

      {/* KPIs Cards com dados reais */}
      <RealTimeKPICards />

      {/* Tabs para diferentes visualizações */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="cases">Casos</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <RealTimeCharts />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* Conteúdo específico de usuários será implementado aqui */}
          <div className="text-center text-gray-500 py-8">
            Análise detalhada de usuários em desenvolvimento
          </div>
        </TabsContent>

        <TabsContent value="cases" className="space-y-6">
          {/* Conteúdo específico de casos será implementado aqui */}
          <div className="text-center text-gray-500 py-8">
            Análise detalhada de casos em desenvolvimento
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          {/* Conteúdo específico de eventos será implementado aqui */}
          <div className="text-center text-gray-500 py-8">
            Analytics de eventos em desenvolvimento
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
