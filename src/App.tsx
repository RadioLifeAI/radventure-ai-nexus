
import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import Eventos from "./pages/Eventos";
import RankingEventos from "./pages/RankingEventos";
import Rankings from "./pages/Rankings";
import Estatisticas from "./pages/Estatisticas";
import Casos from "./pages/Casos";
import CreateJourney from "./pages/CreateJourney";

// Lazy load heavy components
const CasoUsuarioView = React.lazy(() => import("./pages/CasoUsuarioView"));

// Loading component for lazy routes
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
  </div>
);

// Optimized query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/*" element={<AdminPanel />} />
            
            {/* Main App Routes */}
            <Route path="/app/casos" element={<Casos />} />
            <Route path="/app/caso/:id" element={<CasoUsuarioView />} />
            <Route path="/app/eventos" element={<Eventos />} />
            <Route path="/app/ranking-eventos" element={<RankingEventos />} />
            <Route path="/app/rankings" element={<Rankings />} />
            <Route path="/app/estatisticas" element={<Estatisticas />} />
            <Route path="/app/jornada" element={<CreateJourney />} />
            <Route path="/app/criar-jornada" element={<CreateJourney />} />

            {/* Legacy Routes - Redirect to /app structure */}
            <Route path="/casos" element={<Navigate to="/app/casos" replace />} />
            <Route path="/caso/:id" element={<Navigate to="/app/caso/:id" replace />} />
            <Route path="/eventos" element={<Navigate to="/app/eventos" replace />} />
            <Route path="/ranking-eventos" element={<Navigate to="/app/ranking-eventos" replace />} />
            <Route path="/rankings" element={<Navigate to="/app/rankings" replace />} />
            <Route path="/estatisticas" element={<Navigate to="/app/estatisticas" replace />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
