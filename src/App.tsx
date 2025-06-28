import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRouteRedirect } from "@/components/auth/ProtectedRouteRedirect";
import { useAuth } from "@/hooks/useAuth";

// Imports for all pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Casos from "./pages/Casos";
import CasoUsuarioView from "./pages/CasoUsuarioView";
import EventosEnhanced from "./pages/EventosEnhanced";
import EventoDetalhes from "./pages/EventoDetalhes";
import RankingEventos from "./pages/RankingEventos";
import Rankings from "./pages/Rankings";
import Estatisticas from "./pages/Estatisticas";
import AdminPanel from "./pages/AdminPanel";
import AdminDashboardAdvanced from "./pages/admin/AdminDashboardAdvanced";
import GestaoCasos from "./pages/admin/GestaoCasos";
import EventsManagement from "./pages/admin/EventsManagement";
import CreateEvent from "./pages/admin/CreateEvent";
import CasosMedicos from "./pages/admin/CasosMedicos";
import CreateJourney from "./pages/CreateJourney";
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
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            
            {/* Rotas Protegidas - Dashboard */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRouteRedirect>
                  <Dashboard />
                </ProtectedRouteRedirect>
              } 
            />
            
            {/* Rotas Protegidas - Aplicação */}
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
              path="/app/ranking-eventos" 
              element={
                <ProtectedRouteRedirect>
                  <RankingEventos />
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
              path="/app/jornada/criar" 
              element={
                <ProtectedRouteRedirect>
                  <CreateJourney />
                </ProtectedRouteRedirect>
              } 
            />

            {/* Rotas de Admin */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRouteRedirect>
                  <AdminPanel />
                </ProtectedRouteRedirect>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRouteRedirect>
                  <AdminDashboardAdvanced />
                </ProtectedRouteRedirect>
              } 
            />
            <Route 
              path="/admin/casos" 
              element={
                <ProtectedRouteRedirect>
                  <GestaoCasos />
                </ProtectedRouteRedirect>
              } 
            />
            <Route 
              path="/admin/eventos" 
              element={
                <ProtectedRouteRedirect>
                  <EventsManagement />
                </ProtectedRouteRedirect>
              } 
            />
            <Route 
              path="/admin/eventos/criar" 
              element={
                <ProtectedRouteRedirect>
                  <CreateEvent />
                </ProtectedRouteRedirect>
              } 
            />
            <Route 
              path="/admin/casos-medicos" 
              element={
                <ProtectedRouteRedirect>
                  <CasosMedicos />
                </ProtectedRouteRedirect>
              } 
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
