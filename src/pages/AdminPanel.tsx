
import React from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Routes, Route, Navigate } from "react-router-dom";
import CasosMedicos from "./admin/CasosMedicos";
import GestaoCasos from "./admin/GestaoCasos";
import CreateEvent from "./admin/CreateEvent";
import EventsManagement from "./admin/EventsManagement";
import { DashboardAnalyticsIntegrated } from "@/components/admin/DashboardAnalyticsIntegrated";
import { UserManagement } from "@/components/admin/UserManagement";
import { UserManagementAdvanced } from "@/components/admin/users/UserManagementAdvanced";
import { SecurityControlPanel } from "@/components/admin/users/SecurityControlPanel";
import { AdminRoleAuditLog } from "@/components/admin/users/AdminRoleAuditLog";
import { SubscriptionManagementIntegrated } from "@/components/admin/SubscriptionManagementIntegrated";
import { AITutorManagement } from "@/components/admin/AITutorManagement";
import { AchievementManagement } from "@/components/admin/AchievementManagement";
import { SystemMonitoringIntegrated } from "@/components/admin/SystemMonitoringIntegrated";
import { RewardManagement } from "@/components/admin/RewardManagement";
import { APIKeyManagement } from "@/components/admin/APIKeyManagement";
import { StripeManagement } from "@/components/admin/StripeManagement";
import { NotificationManagement } from "@/components/admin/NotificationManagement";
import { ReportsManagement } from "@/components/admin/ReportsManagement";
import { Crown, Sparkles, Shield, Zap } from "lucide-react";

export default function AdminPanel() {
  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <AdminSidebar />
      <main className="flex-1 ml-[235px] min-h-screen">
        {/* Header Administrativo Claro e Profissional */}
        <header className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg relative z-10">
          <div className="flex items-center justify-between px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm">
                <Crown className="h-6 w-6 text-yellow-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  Painel de Administração
                  <Sparkles className="h-6 w-6 text-yellow-300" />
                </h1>
                <p className="text-blue-100 text-sm">Gestão completa da plataforma médica</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                <Shield className="h-4 w-4 text-green-300" />
                <span className="text-sm font-medium">Sistema Online</span>
              </div>
              <a 
                href="/dashboard" 
                className="bg-white/20 border border-white/30 px-4 py-2 rounded-lg font-semibold text-white hover:bg-white/30 transition-all backdrop-blur-sm flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Dashboard Principal
              </a>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal com Background Claro Consistente */}
        <section className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-[calc(100vh-88px)]">
          <Routes>
            {/* Rota padrão do admin - redireciona para analytics */}
            <Route index element={<Navigate to="analytics" replace />} />
            
            {/* Rotas implementadas - todas funcionais */}
            <Route path="analytics" element={<DashboardAnalyticsIntegrated />} />
            <Route path="usuarios" element={<UserManagement />} />
            <Route path="usuarios-avancado" element={<UserManagementAdvanced />} />
            <Route path="seguranca" element={<SecurityControlPanel />} />
            <Route path="auditoria" element={<AdminRoleAuditLog />} />
            <Route path="assinaturas" element={<SubscriptionManagementIntegrated />} />
            <Route path="tutor-ia" element={<AITutorManagement />} />
            <Route path="conquistas" element={<AchievementManagement />} />
            <Route path="notificacoes" element={<NotificationManagement />} />
            <Route path="reports" element={<ReportsManagement />} />
            <Route path="monitoramento" element={<SystemMonitoringIntegrated />} />
            <Route path="recompensas" element={<RewardManagement />} />
            <Route path="chaves-api" element={<APIKeyManagement />} />
            <Route path="config-stripe" element={<StripeManagement />} />
            
            {/* Rotas de casos médicos - layout claro garantido */}
            <Route path="casos-medicos" element={<CasosMedicos />} />
            <Route path="gestao-casos" element={<GestaoCasos />} />
            <Route path="create-event" element={<CreateEvent />} />
            <Route path="events" element={<EventsManagement />} />
            
            {/* Rota de configurações */}
            <Route path="configuracoes" element={
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Configurações</h2>
                <p className="text-gray-600">Esta seção está em desenvolvimento.</p>
              </div>
            } />
          </Routes>
        </section>
      </main>
    </div>
  );
}
