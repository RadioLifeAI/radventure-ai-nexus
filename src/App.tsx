
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Casos from "./pages/Casos";
import CasoUsuarioView from "./pages/CasoUsuarioView";
import EventosEnhanced from "./pages/EventosEnhanced";
import EventoDetalhes from "./pages/EventoDetalhes";
import Rankings from "./pages/Rankings";
import RankingEventos from "./pages/RankingEventos";
import Estatisticas from "./pages/Estatisticas";
import Conquistas from "./pages/Conquistas";
import CreateJourney from "./pages/CreateJourney";
import AdminPanel from "./pages/AdminPanel";
import UserReports from "./pages/UserReports";
import NotFound from "./pages/NotFound";
import Contato from "./pages/Contato";
import Sobre from "./pages/Sobre";
import Funcionalidades from "./pages/Funcionalidades";
import TermosDeUso from "./pages/TermosDeUso";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import PoliticaCookies from "./pages/PoliticaCookies";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminProtectedRoute } from "./components/auth/AdminProtectedRoute";
import { HeaderNav } from "./components/HeaderNav";
import { useLocation } from "react-router-dom";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function AppContent() {
  const location = useLocation();
  
  // Páginas que não devem mostrar o header
  const hideHeaderRoutes = ['/login', '/admin', '/'];
  const shouldHideHeader = hideHeaderRoutes.some(route => 
    location.pathname === route || location.pathname.startsWith('/admin')
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header condicional */}
      {!shouldHideHeader && <HeaderNav />}
      
      <Routes>
        {/* Páginas públicas */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/funcionalidades" element={<Funcionalidades />} />
        <Route path="/termos-de-uso" element={<TermosDeUso />} />
        <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
        <Route path="/politica-cookies" element={<PoliticaCookies />} />
        
        {/* Páginas protegidas */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/app/casos" element={
          <ProtectedRoute>
            <Casos />
          </ProtectedRoute>
        } />
        
        <Route path="/app/caso/:caseId" element={
          <ProtectedRoute>
            <CasoUsuarioView />
          </ProtectedRoute>
        } />
        
        <Route path="/app/eventos" element={
          <ProtectedRoute>
            <EventosEnhanced />
          </ProtectedRoute>
        } />
        
        <Route path="/app/evento/:eventId" element={
          <ProtectedRoute>
            <EventoDetalhes />
          </ProtectedRoute>
        } />
        
        <Route path="/app/rankings" element={
          <ProtectedRoute>
            <Rankings />
          </ProtectedRoute>
        } />
        
        <Route path="/app/ranking-eventos" element={
          <ProtectedRoute>
            <RankingEventos />
          </ProtectedRoute>
        } />
        
        <Route path="/app/estatisticas" element={
          <ProtectedRoute>
            <Estatisticas />
          </ProtectedRoute>
        } />
        
        <Route path="/app/conquistas" element={
          <ProtectedRoute>
            <Conquistas />
          </ProtectedRoute>
        } />
        
        <Route path="/app/create-journey" element={
          <ProtectedRoute>
            <CreateJourney />
          </ProtectedRoute>
        } />

        <Route path="/app/reports" element={
          <ProtectedRoute>
            <UserReports />
          </ProtectedRoute>
        } />
        
        {/* Área administrativa */}
        <Route path="/admin/*" element={
          <AdminProtectedRoute>
            <AdminPanel />
          </AdminProtectedRoute>
        } />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
        <Toaster />
        <SonnerToaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
