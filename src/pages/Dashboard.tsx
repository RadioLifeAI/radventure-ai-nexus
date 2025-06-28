
import React, { useState, Suspense } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { SpecialtyCard } from "@/components/dashboard/SpecialtyCard";
import { RankingWidget } from "@/components/dashboard/RankingWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/Loader";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Calendar,
  Trophy,
  Zap,
  Target,
  BookOpen,
  Users,
  TrendingUp,
  Award,
  Sparkles
} from "lucide-react";

// Lazy load do RadCoin Shop para performance
const RadCoinStoreModal = React.lazy(() => 
  import("@/components/radcoin-shop/RadCoinStoreModal").then(module => ({
    default: module.RadCoinStoreModal
  }))
);

export default function Dashboard() {
  const { specialties, events, profile, isLoading } = useDashboardData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showRadCoinShop, setShowRadCoinShop] = useState(false);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6]">
      <HeaderNav />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Principal - SEM ANIMAÇÕES */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            RadVenture Dashboard
          </h1>
          <p className="text-cyan-100 text-lg">
            Sua jornada médica começa aqui
          </p>
        </div>

        {/* Stats Cards - Otimizados sem hover effects */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-200 text-sm">Seus RadCoins</p>
                  <p className="text-2xl font-bold text-white">
                    {profile?.radcoin_balance || 0}
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-200 text-sm">Pontos Totais</p>
                  <p className="text-2xl font-bold text-white">
                    {profile?.total_points || 0}
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-200 text-sm">Especialidades</p>
                  <p className="text-2xl font-bold text-white">
                    {specialties.length}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-200 text-sm">Eventos Ativos</p>
                  <p className="text-2xl font-bold text-white">
                    {events.length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Especialidades - Grid Otimizado */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Especialidades Médicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {specialties.map((specialty) => (
                    <SpecialtyCard
                      key={specialty.id}
                      specialty={specialty}
                      onClick={() => navigate('/app/casos')}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* RadCoin Shop - Botão otimizado */}
            <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-300/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  RadCoin Shop
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-100 text-sm mb-4">
                  Use seus RadCoins para desbloquear recursos premium
                </p>
                <Button 
                  onClick={() => setShowRadCoinShop(true)}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600"
                >
                  Abrir Loja
                </Button>
              </CardContent>
            </Card>

            {/* Ranking Widget */}
            <RankingWidget />

            {/* Eventos Recentes */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Eventos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium text-sm">{event.name}</p>
                        <p className="text-cyan-200 text-xs">
                          {event.status === 'ACTIVE' ? 'Ativo' : 'Agendado'}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                        {event.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full mt-4 text-cyan-300"
                  onClick={() => navigate('/app/eventos')}
                >
                  Ver Todos os Eventos
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions - Sem animações */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-cyan-300"
                  onClick={() => navigate('/app/casos')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Resolver Casos
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-cyan-300"
                  onClick={() => navigate('/app/rankings')}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Ver Rankings
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-cyan-300"
                  onClick={() => navigate('/app/estatisticas')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Estatísticas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* RadCoin Shop Modal - Lazy loaded */}
      {showRadCoinShop && (
        <Suspense fallback={<Loader />}>
          <RadCoinStoreModal 
            open={showRadCoinShop}
            onClose={() => setShowRadCoinShop(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
