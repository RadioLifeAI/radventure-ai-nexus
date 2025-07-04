
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRouteRedirect } from "@/components/auth/ProtectedRouteRedirect";
import { useAuth } from "@/hooks/useAuth";
import { DailyChallengeProvider } from "@/components/challenges/DailyChallengeProvider";

// Imports for all pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Casos from "./pages/Casos";
import CasoUsuarioView from "./pages/CasoUsuarioView";
import EventosEnhanced from "./pages/EventosEnhanced";
import EventoDetalhes from "./pages/EventoDetalhes";
import EventRankingsEnhanced from "./pages/EventRankingsEnhanced";
import EventoArena from "./pages/EventoArena";
import Rankings from "./pages/Rankings";
import Estatisticas from "./pages/Estatisticas";
import AdminPanel from "./pages/AdminPanel";
import CreateJourney from "./pages/CreateJourney";
import Conquistas from "./pages/Conquistas";
import Sobre from "./pages/Sobre";
import Funcionalidades from "./pages/Funcionalidades";
import Contato from "./pages/Contato";
import TermosDeUso from "./pages/TermosDeUso";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import PoliticaCookies from "./pages/PoliticaCookies";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente para redirecionamento inteligente
function AuthRedirect() {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  return <Navigate to={isAuthenticated ? "/app/dashboard" : "/login"} replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DailyChallengeProvider>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/funcionalidades" element={<Funcionalidades />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/termos" element={<TermosDeUso />} />
            <Route path="/privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/cookies" element={<PoliticaCookies />} />
            
            {/* Redirecionamento para /app */}
            <Route path="/app" element={<AuthRedirect />} />
            
            {/* Rotas Protegidas - Dashboard (rota legacy mantida por compatibilidade) */}
            <Route 
              path="/dashboard" 
              element={<Navigate to="/app/dashboard" replace />}
            />
            
            <Route 
              path="/app/dashboard" 
              element={
                <ProtectedRouteRedirect>
                  <Dashboard />
                </ProtectedRouteRedirect>
              } 
            />
            
            <Route 
              path="/app/casos" 
              element={
                <ProtectedRouteRedirect>
                  <Casos />
                </ProtectedRouteRedirect>
              } 
            />
            <Route 
              path="/app/caso/:id" 
              element={
                <ProtectedRouteRedirect>
                  <CasoUsuarioView />
                </ProtectedRouteRedirect>
              } 
            />
            <Route 
              path="/app/eventos" 
              element={
                <ProtectedRouteRedirect>
                  <EventosEnhanced />
                </ProtectedRouteRedirect>
              } 
            />
            <Route 
              path="/app/evento/:id" 
              element={
                <ProtectedRouteRedirect>
                  <EventoDetalhes />
                </ProtectedRouteRedirect>
              } 
            />
            <Route 
              path="/app/evento/:id/arena" 
              element={
                <ProtectedRouteRedirect>
                  <EventoArena />
                </ProtectedRouteRedirect>
              } 
            />
            <Route 
              path="/app/ranking-eventos" 
              element={
                <ProtectedRouteRedirect>
                  <EventRankingsEnhanced />
                </ProtectedRouteRedirect>
              } 
            />
            <Route 
              path="/app/rankings" 
              element={
                <ProtectedRouteRedirect>
                  <Rankings />
                </ProtectedRouteRedirect>
              } 
            />
            <Route 
              path="/app/estatisticas" 
              element={
                <ProtectedRouteRedirect>
                  <Estatisticas />
                </ProtectedRouteRedirect>
              } 
            />
            <Route 
              path="/app/conquistas" 
              element={
                <ProtectedRouteRedirect>
                  <Conquistas />
                </ProtectedRouteRedirect>
              } 
            />
            <Route 
              path="/app/jornada/criar" 
              element={
                <ProtectedRouteRedirect>
                  <CreateJourney />
                </ProtectedRouteRedirect>
              } 
            />

            {/* Rota Admin - Usar wildcard para capturar todas as sub-rotas */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRouteRedirect>
                  <AdminPanel />
                </ProtectedRouteRedirect>
              } 
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </DailyChallengeProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
