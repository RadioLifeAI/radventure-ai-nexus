
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ProtectedRouteRedirect } from "@/components/auth/ProtectedRouteRedirect";

// Landing pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";

// App pages
import Dashboard from "./pages/Dashboard";
import CasoUsuarioView from "./pages/CasoUsuarioView";
import { CasesCentralAdvanced } from "@/components/cases/CasesCentralAdvanced";
import Eventos from "./pages/Eventos";
import EventDetails from "./pages/EventDetails";
import CriarJornada from "./pages/CriarJornada";
import Profile from "./pages/Profile";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import GestaoCasos from "./pages/admin/GestaoCasos";
import CasosMedicos from "./pages/admin/CasosMedicos";
import GestaoEventos from "./pages/admin/GestaoEventos";
import GestaoUsuarios from "./pages/admin/GestaoUsuarios";
import GestaoAssinaturas from "./pages/admin/GestaoAssinaturas";
import GestaoRecompensas from "./pages/admin/GestaoRecompensas";
import GestaoConquistas from "./pages/admin/GestaoConquistas";
import GestaoTutorIA from "./pages/admin/GestaoTutorIA";
import MonitoramentoSistema from "./pages/admin/MonitoramentoSistema";
import AnalyticsAvancado from "./pages/admin/AnalyticsAvancado";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected app routes - Sistema Unificado */}
          <Route
            path="/app"
            element={
              <ProtectedRouteRedirect>
                <Navigate to="/app/dashboard" replace />
              </ProtectedRouteRedirect>
            }
          />
          <Route
            path="/app/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Casos - Sistema Unificado Avançado */}
          <Route
            path="/app/casos"
            element={
              <ProtectedRoute>
                <CasesCentralAdvanced />
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
          
          {/* Outros módulos */}
          <Route
            path="/app/eventos"
            element={
              <ProtectedRoute>
                <Eventos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/evento/:id"
            element={
              <ProtectedRoute>
                <EventDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/criar-jornada"
            element={
              <ProtectedRoute>
                <CriarJornada />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin routes - Sistema Unificado */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <Navigate to="/admin/dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Gestão de Casos - Sistema Unificado */}
          <Route
            path="/admin/gestao-casos"
            element={
              <ProtectedRoute requireAdmin>
                <GestaoCasos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/casos-medicos"
            element={
              <ProtectedRoute requireAdmin>
                <CasosMedicos />
              </ProtectedRoute>
            }
          />
          
          {/* Outros modulos admin */}
          <Route
            path="/admin/gestao-eventos"
            element={
              <ProtectedRoute requireAdmin>
                <GestaoEventos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/gestao-usuarios"
            element={
              <ProtectedRoute requireAdmin>
                <GestaoUsuarios />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/gestao-assinaturas"
            element={
              <ProtectedRoute requireAdmin>
                <GestaoAssinaturas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/gestao-recompensas"
            element={
              <ProtectedRoute requireAdmin>
                <GestaoRecompensas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/gestao-conquistas"
            element={
              <ProtectedRoute requireAdmin>
                <GestaoConquistas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/gestao-tutor-ia"
            element={
              <ProtectedRoute requireAdmin>
                <GestaoTutorIA />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/monitoramento-sistema"
            element={
              <ProtectedRoute requireAdmin>
                <MonitoramentoSistema />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics-avancado"
            element={
              <ProtectedRoute requireAdmin>
                <AnalyticsAvancado />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
