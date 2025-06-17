
import React from "react";
import { AnalyticsTabs } from "./analytics/AnalyticsTabs";
import { DashboardAnalyticsHeader } from "./analytics/DashboardAnalyticsHeader";

// Mock data para desenvolvimento - em produção virá do backend
const mockUserStats = {
  totalUsers: 1250,
  totalRadcoins: 125000,
  newUsersThisMonth: 89
};

const mockCaseStats = {
  totalCases: 450,
  activeCases: 320,
  completedCases: 2890
};

const mockEventStats = {
  activeEvents: 12,
  totalEvents: 67,
  participantsThisMonth: 340
};

export function DashboardAnalytics() {
  return (
    <div className="space-y-6">
      <DashboardAnalyticsHeader 
        totalUsers={mockUserStats.totalUsers}
        activeEvents={mockEventStats.activeEvents}
        totalCases={mockCaseStats.totalCases}
      />
      
      <AnalyticsTabs 
        userStats={mockUserStats}
        caseStats={mockCaseStats}
        eventStats={mockEventStats}
      />
    </div>
  );
}
