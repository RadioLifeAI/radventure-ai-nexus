
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, FileText, Calendar } from "lucide-react";
import { KPICards } from "./KPICards";
import { ChartsSection } from "./ChartsSection";
import { EngagementMetrics } from "./EngagementMetrics";

interface AnalyticsTabsProps {
  userStats: any;
  caseStats: any;
  eventStats: any;
}

export function AnalyticsTabs({ userStats, caseStats, eventStats }: AnalyticsTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Visão Geral
        </TabsTrigger>
        <TabsTrigger value="cases" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Casos
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Usuários
        </TabsTrigger>
        <TabsTrigger value="events" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Eventos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <KPICards 
          userStats={userStats}
          caseStats={caseStats}
          eventStats={eventStats}
        />
        <ChartsSection caseStats={caseStats} />
        <EngagementMetrics />
      </TabsContent>

      <TabsContent value="cases" className="space-y-6">
        <div className="grid gap-6">
          <ChartsSection caseStats={caseStats} />
          <KPICards 
            userStats={userStats}
            caseStats={caseStats}
            eventStats={eventStats}
          />
        </div>
      </TabsContent>

      <TabsContent value="users" className="space-y-6">
        <div className="grid gap-6">
          <KPICards 
            userStats={userStats}
            caseStats={caseStats}
            eventStats={eventStats}
          />
          <EngagementMetrics />
        </div>
      </TabsContent>

      <TabsContent value="events" className="space-y-6">
        <div className="grid gap-6">
          <KPICards 
            userStats={userStats}
            caseStats={caseStats}
            eventStats={eventStats}
          />
          <EngagementMetrics />
        </div>
      </TabsContent>
    </Tabs>
  );
}
