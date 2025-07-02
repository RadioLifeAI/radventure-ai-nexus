
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import AdminDashboard from "./admin/AdminDashboard";
import CaseManagement from "./admin/CaseManagement";
import EventManagement from "./admin/EventManagement";
import UserManagement from "./admin/UserManagement";
import SubscriptionManagement from "./admin/SubscriptionManagement";
import RadCoinStoreManagement from "./admin/RadCoinStoreManagement";
import SystemSettings from "./admin/SystemSettings";
import AdminReports from "./admin/AdminReports";

export default function AdminPanel() {
  const { isAdmin, isLoading } = useAdminAccess();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="cases" element={<CaseManagement />} />
            <Route path="events" element={<EventManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="subscriptions" element={<SubscriptionManagement />} />
            <Route path="radcoin-store" element={<RadCoinStoreManagement />} />
            <Route path="settings" element={<SystemSettings />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
