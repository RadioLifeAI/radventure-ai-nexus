
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import AdminDashboardAdvanced from "./admin/AdminDashboardAdvanced";
import CasosMedicos from "./admin/CasosMedicos";
import GestaoCasos from "./admin/GestaoCasos";
import CreateEvent from "./admin/CreateEvent";
import EventsManagement from "./admin/EventsManagement";
import SubscriptionManagement from "./admin/SubscriptionManagement";
import RadCoinStoreManagement from "./admin/RadCoinStoreManagement";

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
            <Route index element={<AdminDashboardAdvanced />} />
            <Route path="analytics" element={<AdminDashboardAdvanced />} />
            <Route path="create-event" element={<CreateEvent />} />
            <Route path="casos-medicos" element={<CasosMedicos />} />
            <Route path="gestao-casos" element={<GestaoCasos />} />
            <Route path="usuarios" element={<AdminDashboardAdvanced />} />
            <Route path="assinaturas" element={<SubscriptionManagement />} />
            <Route path="tutor-ia" element={<AdminDashboardAdvanced />} />
            <Route path="conquistas" element={<AdminDashboardAdvanced />} />
            <Route path="notificacoes" element={<AdminDashboardAdvanced />} />
            <Route path="monitoramento" element={<AdminDashboardAdvanced />} />
            <Route path="recompensas" element={<AdminDashboardAdvanced />} />
            <Route path="radcoin-loja" element={<RadCoinStoreManagement />} />
            <Route path="configuracoes" element={<AdminDashboardAdvanced />} />
            <Route path="chaves-api" element={<AdminDashboardAdvanced />} />
            <Route path="config-stripe" element={<AdminDashboardAdvanced />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
