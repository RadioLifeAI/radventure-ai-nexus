
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/*" element={<AdminPanel />} />
          <Route path="/casos" element={<Casos />} />
          <Route path="/caso/:id" element={<CasoUsuarioView />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/ranking-eventos" element={<RankingEventos />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/estatisticas" element={<Estatisticas />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
