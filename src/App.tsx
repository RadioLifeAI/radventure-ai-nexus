
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AppRedirect from "./pages/AppRedirect";
import AdminPanel from "./pages/AdminPanel";
import CasosMedicos from "./pages/admin/CasosMedicos";
import GestaoCasos from "./pages/admin/GestaoCasos";
import EventsManagement from "./pages/admin/EventsManagement";
import CreateEvent from "./pages/admin/CreateEvent";
import AdminDashboardAdvanced from "./pages/admin/AdminDashboardAdvanced";
import FakeCasesPreview from "./pages/admin/FakeCasesPreview";
import Casos from "./pages/Casos";
import CasoUsuarioView from "./pages/CasoUsuarioView";
import EventosEnhanced from "./pages/EventosEnhanced";
import EventoDetalhes from "./pages/EventoDetalhes";
import RankingEventos from "./pages/RankingEventos";
import Rankings from "./pages/Rankings";
import Estatisticas from "./pages/Estatisticas";
import CreateJourney from "./pages/CreateJourney";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/app" element={<AppRedirect />} />
              
              {/* Rotas protegidas */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/casos" element={
                <ProtectedRoute>
                  <CasosMedicos />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/gestao-casos" element={
                <ProtectedRoute>
                  <GestaoCasos />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/eventos" element={
                <ProtectedRoute>
                  <EventsManagement />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/criar-evento" element={
                <ProtectedRoute>
                  <CreateEvent />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/dashboard-avancado" element={
                <ProtectedRoute>
                  <AdminDashboardAdvanced />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/preview-casos" element={
                <ProtectedRoute>
                  <FakeCasesPreview />
                </ProtectedRoute>
              } />
              
              <Route path="/casos" element={
                <ProtectedRoute>
                  <Casos />
                </ProtectedRoute>
              } />
              
              <Route path="/caso/:id" element={
                <ProtectedRoute>
                  <CasoUsuarioView />
                </ProtectedRoute>
              } />
              
              <Route path="/eventos" element={
                <ProtectedRoute>
                  <EventosEnhanced />
                </ProtectedRoute>
              } />
              
              <Route path="/evento/:id" element={
                <ProtectedRoute>
                  <EventoDetalhes />
                </ProtectedRoute>
              } />
              
              <Route path="/ranking-eventos" element={
                <ProtectedRoute>
                  <RankingEventos />
                </ProtectedRoute>
              } />
              
              <Route path="/rankings" element={
                <ProtectedRoute>
                  <Rankings />
                </ProtectedRoute>
              } />
              
              <Route path="/estatisticas" element={
                <ProtectedRoute>
                  <Estatisticas />
                </ProtectedRoute>
              } />
              
              <Route path="/criar-jornada" element={
                <ProtectedRoute>
                  <CreateJourney />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
