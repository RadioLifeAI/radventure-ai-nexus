
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, FileText, Calendar } from "lucide-react";
import { TabContentGamified } from "../layouts/TabContentGamified";
import { KPICards } from "./KPICards";
import { ChartsSection } from "./ChartsSection";
import { EngagementMetrics } from "./EngagementMetrics";
import { UserAnalyticsDetailed } from "./UserAnalyticsDetailed";
import { CaseAnalyticsDetailed } from "./CaseAnalyticsDetailed";
import { EventAnalyticsDetailed } from "./EventAnalyticsDetailed";

interface AnalyticsTabsIntegratedProps {
  userStats: any;
  caseStats: any;
  eventStats: any;
}

export function AnalyticsTabsIntegrated({ userStats, caseStats, eventStats }: AnalyticsTabsIntegratedProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-1 rounded-xl">
        <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
          <BarChart3 className="h-4 w-4" />
          Visão Geral
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
          <Users className="h-4 w-4" />
          Usuários
        </TabsTrigger>
        <TabsTrigger value="cases" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
          <FileText className="h-4 w-4" />
          Casos
        </TabsTrigger>
        <TabsTrigger value="events" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
          <Calendar className="h-4 w-4" />
          Eventos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <TabContentGamified
          title="Visão Geral do Sistema"
          description="Métricas principais e indicadores de performance"
          icon={BarChart3}
          category="analytics"
          badge="Dashboard Principal"
          stats={[
            { label: "Usuários", value: userStats?.totalUsers || 0 },
            { label: "Casos", value: caseStats?.totalCases || 0 },
            { label: "Eventos", value: eventStats?.totalEvents || 0 }
          ]}
        >
          <div className="space-y-6">
            <KPICards 
              userStats={userStats}
              caseStats={caseStats}
              eventStats={eventStats}
            />
            <ChartsSection caseStats={caseStats} />
            <EngagementMetrics />
          </div>
        </TabContentGamified>
      </TabsContent>

      <TabsContent value="users" className="space-y-6">
        <TabContentGamified
          title="Analytics de Usuários"
          description="Análise detalhada do comportamento e engajamento dos usuários"
          icon={Users}
          category="users"
          badge="Usuários"
          stats={[
            { label: "Total", value: userStats?.totalUsers || 0 },
            { label: "Novos (30d)", value: userStats?.newUsersThisMonth || 0 },
            { label: "RadCoins", value: userStats?.totalRadcoins || 0 }
          ]}
        >
          <UserAnalyticsDetailed />
        </TabContentGamified>
      </TabsContent>

      <TabsContent value="cases" className="space-y-6">
        <TabContentGamified
          title="Analytics de Casos Médicos"
          description="Análise detalhada do desempenho e engajamento dos casos"
          icon={FileText}
          category="cases"
          badge="Casos"
          stats={[
            { label: "Total", value: caseStats?.totalCases || 0 },
            { label: "Ativos", value: caseStats?.activeCases || 0 },
            { label: "Completos", value: caseStats?.completedCases || 0 }
          ]}
        >
          <CaseAnalyticsDetailed />
        </TabContentGamified>
      </TabsContent>

      <TabsContent value="events" className="space-y-6">
        <TabContentGamified
          title="Analytics de Eventos"
          description="Performance e engajamento em eventos gamificados"
          icon={Calendar}
          category="events"
          badge="Eventos"
          stats={[
            { label: "Total", value: eventStats?.totalEvents || 0 },
            { label: "Ativos", value: eventStats?.activeEvents || 0 },
            { label: "Participantes", value: eventStats?.participantsThisMonth || 0 }
          ]}
        >
          <EventAnalyticsDetailed />
        </TabContentGamified>
      </TabsContent>
    </Tabs>
  );
}
