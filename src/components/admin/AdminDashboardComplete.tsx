
import React from "react";
import { Routes, Route } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { DashboardAnalyticsIntegrated } from "./DashboardAnalyticsIntegrated";
import { RealDataDashboard } from "./RealDataDashboard";
import { UserManagement } from "./UserManagement";
import { RewardManagementIntegrated } from "./RewardManagementIntegrated";
import { SubscriptionManagementIntegrated } from "./SubscriptionManagementIntegrated";
import { SystemMonitoringIntegrated } from "./SystemMonitoringIntegrated";
import { SystemMonitoringAdvanced } from "./monitoring/SystemMonitoringAdvanced";
import { AITutorManagement } from "./AITutorManagement";
import { AchievementManagement } from "./AchievementManagement";
import { StripeManagement } from "./StripeManagement";
import { APIKeyManagement } from "./APIKeyManagement";
import { MockDataCleanupStatus } from "./MockDataCleanupStatus";

export function AdminDashboardComplete() {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<RealDataDashboard />} />
            <Route path="/analytics" element={<DashboardAnalyticsIntegrated />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/rewards" element={<RewardManagementIntegrated />} />
            <Route path="/subscriptions" element={<SubscriptionManagementIntegrated />} />
            <Route path="/monitoring" element={<SystemMonitoringIntegrated />} />
            <Route path="/monitoring-advanced" element={<SystemMonitoringAdvanced />} />
            <Route path="/ai-tutor" element={<AITutorManagement />} />
            <Route path="/achievements" element={<AchievementManagement />} />
            <Route path="/stripe" element={<StripeManagement />} />
            <Route path="/api-keys" element={<APIKeyManagement />} />
            <Route path="/cleanup-status" element={<MockDataCleanupStatus />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
