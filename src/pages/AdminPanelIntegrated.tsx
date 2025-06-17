
import React from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Routes, Route } from "react-router-dom";
import CasosMedicos from "./admin/CasosMedicos";
import GestaoCasos from "./admin/GestaoCasos";
import CreateEvent from "./admin/CreateEvent";
import EventsManagement from "./admin/EventsManagement";
import { DashboardAnalyticsIntegrated } from "@/components/admin/DashboardAnalyticsIntegrated";
import { UserManagement } from "@/components/admin/UserManagement";
import { SubscriptionManagementIntegrated } from "@/components/admin/SubscriptionManagementIntegrated";
import { AITutorManagement } from "@/components/admin/AITutorManagement";
import { AchievementManagement } from "@/components/admin/AchievementManagement";
import { SystemMonitoringIntegrated } from "@/components/admin/SystemMonitoringIntegrated";
import { RewardManagementIntegrated } from "@/components/admin/RewardManagementIntegrated";
import { AdvancedSettings } from "@/components/admin/AdvancedSettings";
import { APIKeyManagement } from "@/components/admin/APIKeyManagement";
import { StripeManagement } from "@/components/admin/StripeManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Crown, Sparkles, Shield, Zap, Database } from "lucide-react";

// Componente de página em construção
function UnderConstruction({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-gray-500 py-12">
          <Settings className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold mb-2">Removido Temporariamente</h3>
          <p>Esta funcionalidade foi removida durante a limpeza do banco de dados</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPanelIntegrated() {
  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <AdminSidebar />
      <main className="flex-1 ml-[235px] min-h-screen">
        {/* Header Gamificado Integrado */}
        <header className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white shadow-2xl relative z-10">
          <div className="flex items-center justify-between px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm">
                <Database className="h-6 w-6 text-yellow-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  Sistema Limpo e Otimizado
                  <Sparkles className="h-6 w-6 text-yellow-300" />
                </h1>
                <p className="text-green-100 text-sm">Banco de dados reorganizado - Funcionalidades essenciais ativas</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                <Shield className="h-4 w-4 text-green-300" />
                <span className="text-sm font-medium">Sistema Estável</span>
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

        {/* Conteúdo Principal */}
        <section className="p-8 relative z-0">
          <Routes>
            {/* Rotas funcionais mantidas */}
            <Route path="analytics" element={<DashboardAnalyticsIntegrated />} />
            <Route path="monitoramento" element={<SystemMonitoringIntegrated />} />
            <Route path="recompensas" element={<RewardManagementIntegrated />} />
            <Route path="assinaturas" element={<SubscriptionManagementIntegrated />} />
            <Route path="usuarios" element={<UserManagement />} />
            <Route path="tutor-ia" element={<AITutorManagement />} />
            <Route path="conquistas" element={<AchievementManagement />} />
            <Route path="casos-medicos" element={<CasosMedicos />} />
            <Route path="gestao-casos" element={<GestaoCasos />} />
            <Route path="create-event" element={<CreateEvent />} />
            <Route path="events" element={<EventsManagement />} />
            <Route path="chaves-api" element={<APIKeyManagement />} />
            <Route path="config-stripe" element={<StripeManagement />} />
            
            {/* Rotas temporariamente simplificadas */}
            <Route path="configuracoes" element={<AdvancedSettings />} />
            <Route path="textos-ui" element={<UnderConstruction title="Textos da UI" />} />
            <Route path="config-assinatura" element={<UnderConstruction title="Config. Assinatura" />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}
