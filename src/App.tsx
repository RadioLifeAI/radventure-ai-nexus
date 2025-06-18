
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SecureWrapper } from "@/components/auth/SecureWrapper";
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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected User Routes */}
          <Route path="/dashboard" element={
            <SecureWrapper>
              <Dashboard />
            </SecureWrapper>
          } />
          
          {/* Main App Routes - Protected */}
          <Route path="/app/casos" element={
            <SecureWrapper>
              <Casos />
            </SecureWrapper>
          } />
          <Route path="/app/caso/:id" element={
            <SecureWrapper>
              <CasoUsuarioView />
            </SecureWrapper>
          } />
          <Route path="/app/eventos" element={
            <SecureWrapper>
              <Eventos />
            </SecureWrapper>
          } />
          <Route path="/app/ranking-eventos" element={
            <SecureWrapper>
              <RankingEventos />
            </SecureWrapper>
          } />
          <Route path="/app/rankings" element={
            <SecureWrapper>
              <Rankings />
            </SecureWrapper>
          } />
          <Route path="/app/estatisticas" element={
            <SecureWrapper>
              <Estatisticas />
            </SecureWrapper>
          } />
          <Route path="/app/jornada" element={
            <SecureWrapper>
              <CreateJourney />
            </SecureWrapper>
          } />
          <Route path="/app/criar-jornada" element={
            <SecureWrapper>
              <CreateJourney />
            </SecureWrapper>
          } />

          {/* Admin Routes - Protected with Admin Check */}
          <Route path="/admin/*" element={
            <SecureWrapper requireAdmin={true}>
              <AdminPanel />
            </SecureWrapper>
          } />

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
  </QueryClientProvider>
);

export default App;
