
import React from 'react';
import './App.css';

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Public pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

// App Layout and pages (user routes)
import AppLayout from "@/layouts/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Casos from "@/pages/Casos";
import CentralCasos from "@/pages/CentralCasos";
import CasoUsuarioView from "@/pages/CasoUsuarioView";
import Rankings from "@/pages/Rankings";
import RankingEventos from "@/pages/RankingEventos";
import Eventos from "@/pages/Eventos";
import Estatisticas from "@/pages/Estatisticas";

// Admin Layout and pages
import AdminLayout from "@/layouts/AdminLayout";
import AdminDashboardAdvanced from "@/pages/admin/AdminDashboardAdvanced";
import CasosMedicos from "@/pages/admin/CasosMedicos";
import GestaoCasos from "@/pages/admin/GestaoCasos";
import EventsManagement from "@/pages/admin/EventsManagement";
import CreateEvent from "@/pages/admin/CreateEvent";
import FakeCasesPreview from "@/pages/admin/FakeCasesPreview";

// Placeholder pages for admin routes (to be implemented)
import PlaceholderPage from "@/pages/admin/PlaceholderPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <div className="App w-full">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              
              {/* App routes (User) - with layout wrapper */}
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="casos" element={<Casos />} />
                <Route path="central-casos" element={<CentralCasos />} />
                <Route path="caso/:id" element={<CasoUsuarioView />} />
                <Route path="rankings" element={<Rankings />} />
                <Route path="ranking-eventos" element={<RankingEventos />} />
                <Route path="eventos" element={<Eventos />} />
                <Route path="estatisticas" element={<Estatisticas />} />
              </Route>

              {/* Legacy redirects for user routes */}
              <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/casos" element={<Navigate to="/app/casos" replace />} />
              <Route path="/central-casos" element={<Navigate to="/app/central-casos" replace />} />
              <Route path="/caso/:id" element={<Navigate to="/app/caso/:id" replace />} />
              <Route path="/rankings" element={<Navigate to="/app/rankings" replace />} />
              <Route path="/ranking-eventos" element={<Navigate to="/app/ranking-eventos" replace />} />
              <Route path="/eventos" element={<Navigate to="/app/eventos" replace />} />
              <Route path="/estatisticas" element={<Navigate to="/app/estatisticas" replace />} />
              
              {/* Admin routes - with layout wrapper */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/analytics" replace />} />
                <Route path="analytics" element={<AdminDashboardAdvanced />} />
                <Route path="create-event" element={<CreateEvent />} />
                <Route path="events" element={<EventsManagement />} />
                <Route path="casos-medicos" element={<CasosMedicos />} />
                <Route path="gestao-casos" element={<GestaoCasos />} />
                <Route path="usuarios" element={<PlaceholderPage title="Gestão de Usuários" />} />
                <Route path="assinaturas" element={<PlaceholderPage title="Gestão de Assinaturas" />} />
                <Route path="tutor-ia" element={<PlaceholderPage title="Tutor IA" />} />
                <Route path="conquistas" element={<PlaceholderPage title="Sistema de Conquistas" />} />
                <Route path="monitoramento" element={<PlaceholderPage title="Monitoramento do Sistema" />} />
                <Route path="recompensas" element={<PlaceholderPage title="Sistema de Recompensas" />} />
                <Route path="configuracoes" element={<PlaceholderPage title="Configurações Gerais" />} />
                <Route path="textos-ui" element={<PlaceholderPage title="Gestão de Textos da UI" />} />
                <Route path="config-assinatura" element={<PlaceholderPage title="Configurações de Assinatura" />} />
                <Route path="config-stripe" element={<PlaceholderPage title="Configurações do Stripe" />} />
                <Route path="chaves-api" element={<PlaceholderPage title="Gestão de Chaves API" />} />
                <Route path="fake-cases-preview" element={<FakeCasesPreview />} />
              </Route>
              
              {/* Super Admin routes (future implementation) */}
              <Route path="/super-admin" element={<Navigate to="/admin" replace />} />
              
              {/* Catch all */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
