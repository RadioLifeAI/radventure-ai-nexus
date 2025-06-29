import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Casos from "./pages/Casos";
import CasoUsuarioView from "./pages/CasoUsuarioView";
import EventosEnhanced from "./pages/EventosEnhanced";
import EventoDetalhes from "./pages/EventoDetalhes";
import RankingEventos from "./pages/RankingEventos";
import Rankings from "./pages/Rankings";
import Conquistas from "./pages/Conquistas";
import Estatisticas from "./pages/Estatisticas";
import AdminPanel from "./pages/AdminPanel";
import CreateJourney from "./pages/CreateJourney";
import Sobre from "./pages/Sobre";
import Funcionalidades from "./pages/Funcionalidades";
import Contato from "./pages/Contato";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import TermosDeUso from "./pages/TermosDeUso";
import PoliticaCookies from "./pages/PoliticaCookies";
import NotFound from "./pages/NotFound";
import NotificacoesPage from "./pages/NotificacoesPage";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/app/dashboard" element={<Dashboard />} />
            <Route path="/app/casos" element={<Casos />} />
            <Route path="/app/caso/:id" element={<CasoUsuarioView />} />
            <Route path="/app/eventos" element={<EventosEnhanced />} />
            <Route path="/app/evento/:id" element={<EventoDetalhes />} />
            <Route path="/app/ranking-eventos" element={<RankingEventos />} />
            <Route path="/app/rankings" element={<Rankings />} />
            <Route path="/app/conquistas" element={<Conquistas />} />
            <Route path="/app/estatisticas" element={<Estatisticas />} />
            <Route path="/app/notificacoes" element={<NotificacoesPage />} />
            <Route path="/app/criar-jornada" element={<CreateJourney />} />
            <Route path="/admin/*" element={<AdminPanel />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/funcionalidades" element={<Funcionalidades />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/termos-de-uso" element={<TermosDeUso />} />
            <Route path="/politica-cookies" element={<PoliticaCookies />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
