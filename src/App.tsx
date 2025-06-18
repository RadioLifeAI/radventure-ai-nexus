
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import CasoUsuarioView from "./pages/CasoUsuarioView";
import Eventos from "./pages/Eventos";
import RankingEventos from "./pages/RankingEventos";
import Rankings from "./pages/Rankings";
import Estatisticas from "./pages/Estatisticas";
import Casos from "./pages/Casos";
import CreateJourney from "./pages/CreateJourney";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/*" element={<AdminPanel />} />
            
            {/* Main App Routes */}
            <Route path="/app/casos" element={<Casos />} />
            <Route path="/app/caso/:id" element={<CasoUsuarioView />} />
            <Route path="/app/eventos" element={<Eventos />} />
            <Route path="/app/ranking-eventos" element={<RankingEventos />} />
            <Route path="/app/rankings" element={<Rankings />} />
            <Route path="/app/estatisticas" element={<Estatisticas />} />
            <Route path="/app/jornada" element={<CreateJourney />} />
            <Route path="/app/criar-jornada" element={<CreateJourney />} />

            {/* Legacy Routes - Redirect to /app structure */}
            <Route path="/casos" element={<Navigate to="/app/casos" replace />} />
            <Route path="/caso/:id" element={<Navigate to="/app/caso/:id" replace />} />
            <Route path="/eventos" element={<Navigate to="/app/eventos" replace />} />
            <Route path="/ranking-eventos" element={<Navigate to="/app/ranking-eventos" replace />} />
            <Route path="/rankings" element={<Navigate to="/app/rankings" replace />} />
            <Route path="/estatisticas" element={<Navigate to="/app/estatisticas" replace />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
