
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/navigation/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Casos from "./pages/Casos";
import CasoUsuarioView from "./pages/CasoUsuarioView";
import Eventos from "./pages/Eventos";
import Rankings from "./pages/Rankings";
import RankingEventos from "./pages/RankingEventos";
import Estatisticas from "./pages/Estatisticas";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route 
                path="/auth" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Auth />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected routes */}
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
              
              {/* Admin routes */}
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
