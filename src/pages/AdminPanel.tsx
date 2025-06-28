
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
import { Crown, Sparkles, Shield, Zap } from "lucide-react";

export default function AdminPanel() {
  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <AdminSidebar />
      <main className="flex-1 ml-[235px] min-h-screen">
        {/* Header Gamificado com cores consistentes */}
        <header className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white shadow-xl border-b border-white/20 relative z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full backdrop-blur-sm border border-white/30">
                <Crown className="h-5 w-5 text-yellow-300" />
              </div>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  Painel de Administração
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                </h1>
                <p className="text-blue-100 text-sm">Controle total da plataforma médica</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
                <Shield className="h-4 w-4 text-green-300" />
                <span className="text-sm font-medium">Sistema Online</span>
              </div>
              <a 
                href="/dashboard" 
                className="bg-white/15 border border-white/25 px-4 py-2 rounded-lg font-medium text-white hover:bg-white/25 transition-all duration-200 backdrop-blur-sm flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Dashboard
              </a>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal com padding otimizado */}
        <section className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-[calc(100vh-80px)] relative z-0">
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
            <Route path="monitoramento" element={<SystemMonitoringIntegrated />} />
            <Route path="recompensas" element={<RewardManagement />} />
            <Route path="chaves-api" element={<APIKeyManagement />} />
            <Route path="config-stripe" element={<StripeManagement />} />
            
            {/* Rotas existentes mantidas */}
            <Route path="casos-medicos" element={<CasosMedicos />} />
            <Route path="gestao-casos" element={<GestaoCasos />} />
            <Route path="create-event" element={<CreateEvent />} />
            <Route path="events" element={<EventsManagement />} />
            
            {/* Rotas temporárias para funcionalidades em desenvolvimento */}
            <Route path="configuracoes" element={
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
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
