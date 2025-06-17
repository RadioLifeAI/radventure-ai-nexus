
import React from 'react';
import './App.css';

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Index from "@/pages/Index";
import Casos from "@/pages/Casos";
import CentralCasos from "@/pages/CentralCasos";
import CasoUsuarioView from "@/pages/CasoUsuarioView";
import Rankings from "@/pages/Rankings";
import RankingEventos from "@/pages/RankingEventos";
import Eventos from "@/pages/Eventos";
import Estatisticas from "@/pages/Estatisticas";
import NotFound from "@/pages/NotFound";

// Admin pages
import AdminPanel from "@/pages/AdminPanel";
import AdminPanelIntegrated from "@/pages/AdminPanelIntegrated";
import AdminDashboardAdvanced from "@/pages/admin/AdminDashboardAdvanced";
import CasosMedicos from "@/pages/admin/CasosMedicos";
import GestaoCasos from "@/pages/admin/GestaoCasos";
import EventsManagement from "@/pages/admin/EventsManagement";
import CreateEvent from "@/pages/admin/CreateEvent";
import FakeCasesPreview from "@/pages/admin/FakeCasesPreview";

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
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              
              {/* Main app routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/casos" element={<Casos />} />
              <Route path="/central-casos" element={<CentralCasos />} />
              <Route path="/caso/:id" element={<CasoUsuarioView />} />
              <Route path="/rankings" element={<Rankings />} />
              <Route path="/ranking-eventos" element={<RankingEventos />} />
              <Route path="/eventos" element={<Eventos />} />
              <Route path="/estatisticas" element={<Estatisticas />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin-integrated" element={<AdminPanelIntegrated />} />
              <Route path="/admin/dashboard" element={<AdminDashboardAdvanced />} />
              <Route path="/admin/casos-medicos" element={<CasosMedicos />} />
              <Route path="/admin/gestao-casos" element={<GestaoCasos />} />
              <Route path="/admin/events" element={<EventsManagement />} />
              <Route path="/admin/create-event" element={<CreateEvent />} />
              <Route path="/admin/fake-cases-preview" element={<FakeCasesPreview />} />
              
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
