
import React from "react";
import { KPICards } from "./analytics/KPICards";
import { ChartsSection } from "./analytics/ChartsSection";
import { EngagementMetrics } from "./analytics/EngagementMetrics";
import { DashboardAnalyticsHeader } from "./analytics/DashboardAnalyticsHeader";

export function DashboardAnalytics() {
  return (
    <div className="space-y-6">
      <DashboardAnalyticsHeader 
        totalUsers={0}
        activeEvents={0}
        totalCases={0}
      />
      
      <div className="grid gap-6">
        <KPICards />
        <ChartsSection />
        <EngagementMetrics />
      </div>
    </div>
  );
}
