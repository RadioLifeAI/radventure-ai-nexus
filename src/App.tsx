
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtecaoRota } from "@/components/auth/ProtecaoRota";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Casos from "./pages/Casos";
import CasoUsuarioView from "./pages/CasoUsuarioView";
import Eventos from "./pages/Eventos";
import EventoDetalhes from "./pages/EventoDetalhes";
import Rankings from "./pages/Rankings";
import RankingEventos from "./pages/RankingEventos";
import Estatisticas from "./pages/Estatisticas";
import AdminPanel from "./pages/AdminPanel";
import CreateJourney from "./pages/CreateJourney";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
            {/* Rotas protegidas */}
            <Route path="/dashboard" element={
              <ProtecaoRota>
                <Dashboard />
              </ProtecaoRota>
            } />
            
            <Route path="/casos" element={
              <ProtecaoRota>
                <Casos />
              </ProtecaoRota>
            } />
            
            <Route path="/caso/:id" element={
              <ProtecaoRota>
                <CasoUsuarioView />
              </ProtecaoRota>
            } />
            
            <Route path="/eventos" element={
              <ProtecaoRota>
                <Eventos />
              </ProtecaoRota>
            } />
            
            <Route path="/evento/:id" element={
              <ProtecaoRota>
                <EventoDetalhes />
              </ProtecaoRota>
            } />
            
            <Route path="/rankings" element={
              <ProtecaoRota>
                <Rankings />
              </ProtecaoRota>
            } />
            
            <Route path="/ranking-eventos" element={
              <ProtecaoRota>
                <RankingEventos />
              </ProtecaoRota>
            } />
            
            <Route path="/estatisticas" element={
              <ProtecaoRota>
                <Estatisticas />
              </ProtecaoRota>
            } />
            
            <Route path="/create-journey" element={
              <ProtecaoRota>
                <CreateJourney />
              </ProtecaoRota>
            } />
            
            {/* Rotas admin */}
            <Route path="/admin/*" element={
              <ProtecaoRota requireAdmin={true}>
                <AdminPanel />
              </ProtecaoRota>
            } />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
