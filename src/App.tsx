import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import RankingEventos from "@/pages/RankingEventos";
import Rankings from "@/pages/Rankings";
import Casos from "@/pages/Casos";
import CasoUsuarioView from "@/pages/CasoUsuarioView";
import EventosEnhanced from "@/pages/EventosEnhanced";
import EventoDetalhes from "@/pages/EventoDetalhes";
import Estatisticas from "@/pages/Estatisticas";
import CreateJourney from "@/pages/CreateJourney";
import AdminPanel from "@/pages/AdminPanel";
import AdminDashboardAdvanced from "@/pages/admin/AdminDashboardAdvanced";
import GestaoCasos from "@/pages/admin/GestaoCasos";
import EventsManagement from "@/pages/admin/EventsManagement";
import CreateEvent from "@/pages/admin/CreateEvent";
import CasosMedicos from "@/pages/admin/CasosMedicos";
import FakeCasesPreview from "@/pages/admin/FakeCasesPreview";
import NotFound from "@/pages/NotFound";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Páginas legais e institucionais
import TermosDeUso from "@/pages/TermosDeUso";
import PoliticaPrivacidade from "@/pages/PoliticaPrivacidade";
import PoliticaCookies from "@/pages/PoliticaCookies";
import Sobre from "@/pages/Sobre";
import Contato from "@/pages/Contato";
import Funcionalidades from "@/pages/Funcionalidades";

import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Páginas públicas */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          
          {/* Páginas legais e institucionais */}
          <Route path="/termos" element={<TermosDeUso />} />
          <Route path="/privacidade" element={<PoliticaPrivacidade />} />
          <Route path="/cookies" element={<PoliticaCookies />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/funcionalidades" element={<Funcionalidades />} />

          {/* Páginas protegidas da aplicação - ROTAS CORRETAS COM /app */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/rankings"
            element={
              <ProtectedRoute>
                <Rankings />
              </ProtectedRoute>  
            }
          />
          <Route
            path="/app/ranking-eventos"
            element={
              <ProtectedRoute>
                <RankingEventos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/casos"
            element={
              <ProtectedRoute>
                <Casos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/caso/:id"
            element={
              <ProtectedRoute>
                <CasoUsuarioView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/eventos"
            element={
              <ProtectedRoute>
                <EventosEnhanced />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/evento/:id"
            element={
              <ProtectedRoute>
                <EventoDetalhes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/estatisticas"
            element={
              <ProtectedRoute>
                <Estatisticas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/criar-jornada"
            element={
              <ProtectedRoute>
                <CreateJourney />
              </ProtectedRoute>
            }
          />

          {/* REDIRECTS para compatibilidade com rotas antigas */}
          <Route path="/rankings" element={<Navigate to="/app/rankings" replace />} />
          <Route path="/ranking-eventos" element={<Navigate to="/app/ranking-eventos" replace />} />
          <Route path="/casos" element={<Navigate to="/app/casos" replace />} />
          <Route path="/caso/:id" element={<Navigate to="/app/caso/:id" replace />} />
          <Route path="/eventos" element={<Navigate to="/app/eventos" replace />} />
          <Route path="/evento/:id" element={<Navigate to="/app/evento/:id" replace />} />
          <Route path="/estatisticas" element={<Navigate to="/app/estatisticas" replace />} />
          <Route path="/jornadas" element={<Navigate to="/app/criar-jornada" replace />} />

          {/* PÁGINAS ADMINISTRATIVAS - Apenas rota principal com rotas aninhadas */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* Página 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster richColors position="top-right" />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
