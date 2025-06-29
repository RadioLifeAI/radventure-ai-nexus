
import React from "react";
import { Routes, Route } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminProtectedRoute } from "@/components/auth/AdminProtectedRoute";
import AdminDashboardAdvanced from "./admin/AdminDashboardAdvanced";
import { UserManagement } from "@/components/admin/UserManagement";
import { AchievementManagement } from "@/components/admin/AchievementManagement";
import CreateEvent from "./admin/CreateEvent";
import EventsManagement from "./admin/EventsManagement";
import GestaoCasos from "./admin/GestaoCasos";
import { SystemMonitoringIntegrated } from "@/components/admin/SystemMonitoringIntegrated";
import { SecurityDashboard } from "@/components/admin/security/SecurityDashboard";
import { SubscriptionManagementIntegrated } from "@/components/admin/SubscriptionManagementIntegrated";
import { NotificationManagement } from "@/components/admin/notifications/NotificationManagement";

export default function AdminPanel() {
  return (
    <AdminProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <Routes>
              <Route index element={<AdminDashboardAdvanced />} />
              <Route path="usuarios" element={<UserManagement />} />
              <Route path="casos" element={<GestaoCasos />} />
              <Route path="eventos" element={<EventsManagement />} />
              <Route path="eventos/criar" element={<CreateEvent />} />
              <Route path="conquistas" element={<AchievementManagement />} />
              <Route path="notificacoes" element={<NotificationManagement />} />
              <Route path="monitoramento" element={<SystemMonitoringIntegrated />} />
              <Route path="seguranca" element={<SecurityDashboard />} />
              <Route path="assinaturas" element={<SubscriptionManagementIntegrated />} />
              <Route path="configuracoes" element={<div>Configurações em desenvolvimento</div>} />
            </Routes>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
