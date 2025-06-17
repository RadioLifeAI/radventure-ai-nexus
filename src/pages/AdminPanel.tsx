
import React from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Routes, Route } from "react-router-dom";
import CasosMedicos from "./admin/CasosMedicos";
import GestaoCasos from "./admin/GestaoCasos";
import CreateEvent from "./admin/CreateEvent";
import EventsManagement from "./admin/EventsManagement";
import { DashboardAnalytics } from "@/components/admin/DashboardAnalytics";
import { UserManagement } from "@/components/admin/UserManagement";
import { SubscriptionManagement } from "@/components/admin/SubscriptionManagement";
import { AITutorManagement } from "@/components/admin/AITutorManagement";
import { AchievementManagement } from "@/components/admin/AchievementManagement";
import { SystemMonitoring } from "@/components/admin/SystemMonitoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

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
          <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
          <p>Esta seção será implementada em breve</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPanel() {
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 ml-[235px] min-h-screen">
        <header className="w-full flex items-center justify-between px-8 py-6 border-b bg-white shadow-sm min-h-[66px]">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">Painel de Administração</h1>
          <a href="/dashboard" className="bg-white border px-4 py-2 rounded-lg font-semibold text-gray-700 hover:bg-cyan-100 transition">← Voltar ao Dashboard</a>
        </header>
        <section className="p-8">
          <Routes>
            {/* Rotas integradas - todas funcionais */}
            <Route path="analytics" element={<DashboardAnalytics />} />
            <Route path="usuarios" element={<UserManagement />} />
            <Route path="assinaturas" element={<SubscriptionManagement />} />
            <Route path="tutor-ia" element={<AITutorManagement />} />
            <Route path="conquistas" element={<AchievementManagement />} />
            <Route path="monitoramento" element={<SystemMonitoring />} />
            
            {/* Rotas existentes mantidas */}
            <Route path="casos-medicos" element={<CasosMedicos />} />
            <Route path="gestao-casos" element={<GestaoCasos />} />
            <Route path="create-event" element={<CreateEvent />} />
            <Route path="events" element={<EventsManagement />} />
            
            {/* Rotas em desenvolvimento */}
            <Route path="recompensas" element={<UnderConstruction title="Recompensas" />} />
            <Route path="configuracoes" element={<UnderConstruction title="Configurações" />} />
            <Route path="textos-ui" element={<UnderConstruction title="Textos da UI" />} />
            <Route path="config-assinatura" element={<UnderConstruction title="Config. Assinatura" />} />
            <Route path="config-stripe" element={<UnderConstruction title="Config. Stripe" />} />
            <Route path="chaves-api" element={<UnderConstruction title="Chaves API" />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}
