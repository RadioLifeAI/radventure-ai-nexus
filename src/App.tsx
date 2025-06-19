
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme-system/ThemeProvider";
import { RealtimeProvider } from "@/lib/realtime/RealtimeProvider";
import { AnalyticsProvider } from "@/lib/analytics/AnalyticsProvider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Casos from "./pages/Casos";
import CasoUsuarioView from "./pages/CasoUsuarioView";
import Eventos from "./pages/Eventos";
import Rankings from "./pages/Rankings";
import RankingEventos from "./pages/RankingEventos";
import Estatisticas from "./pages/Estatisticas";
import CreateJourney from "./pages/CreateJourney";
import AdminPanel from "./pages/AdminPanel";
import AdminPanelIntegrated from "./pages/AdminPanelIntegrated";
import AdminDashboardAdvanced from "./pages/admin/AdminDashboardAdvanced";
import CreateEvent from "./pages/admin/CreateEvent";
import EventsManagement from "./pages/admin/EventsManagement";
import CasosMedicos from "./pages/admin/CasosMedicos";
import GestaoCasos from "./pages/admin/GestaoCasos";
import FakeCasesPreview from "./pages/admin/FakeCasesPreview";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RealtimeProvider>
          <AnalyticsProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/casos"
                    element={
                      <ProtectedRoute>
                        <Casos />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/caso/:id"
                    element={
                      <ProtectedRoute>
                        <CasoUsuarioView />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/eventos"
                    element={
                      <ProtectedRoute>
                        <Eventos />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/rankings"
                    element={
                      <ProtectedRoute>
                        <Rankings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ranking-eventos"
                    element={
                      <ProtectedRoute>
                        <RankingEventos />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/estatisticas"
                    element={
                      <ProtectedRoute>
                        <Estatisticas />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/create-journey"
                    element={
                      <ProtectedRoute>
                        <CreateJourney />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Admin Routes */}
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
                        <AdminDashboardAdvanced />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/panel"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminPanel />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/panel-integrated"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminPanelIntegrated />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/create-event"
                    element={
                      <ProtectedRoute requireAdmin>
                        <CreateEvent />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/events"
                    element={
                      <ProtectedRoute requireAdmin>
                        <EventsManagement />
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
                  <Route
                    path="/admin/gestao-casos"
                    element={
                      <ProtectedRoute requireAdmin>
                        <GestaoCasos />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/fake-cases-preview"
                    element={
                      <ProtectedRoute requireAdmin>
                        <FakeCasesPreview />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AnalyticsProvider>
        </RealtimeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
