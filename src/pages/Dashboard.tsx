
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { HeaderNav } from '@/components/HeaderNav';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { ProfileCompleteness } from '@/components/profile/ProfileCompleteness';
import { ProtectedRoute } from '@/components/navigation/ProtectedRoute';
import { useFirstTimeUser } from '@/hooks/useFirstTimeUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Trophy, 
  Zap, 
  Target, 
  TrendingUp,
  Award,
  Clock,
  Play
} from 'lucide-react';

function DashboardContent() {
  const { profile } = useAuth();
  const { showWelcome, markTutorialAsSeen } = useFirstTimeUser();
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const quickActions = [
    {
      title: "Resolver Casos",
      description: "Pratique com casos reais",
      icon: <Users className="text-blue-400" size={24} />,
      link: "/casos",
      color: "from-blue-500 to-cyan-600"
    },
    {
      title: "Eventos Ativos",
      description: "Participe de competições",
      icon: <Calendar className="text-green-400" size={24} />,
      link: "/eventos",
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Ver Rankings",
      description: "Compare seu desempenho",
      icon: <Trophy className="text-yellow-400" size={24} />,
      link: "/rankings",
      color: "from-yellow-500 to-orange-600"
    }
  ];

  const stats = [
    {
      label: "Total de Pontos",
      value: profile?.total_points || 0,
      icon: <Target className="text-cyan-400" size={20} />,
      change: "+12%"
    },
    {
      label: "RadCoins",
      value: profile?.radcoin_balance || 0,
      icon: <Zap className="text-yellow-400" size={20} />,
      change: "+5"
    },
    {
      label: "Sequência Atual",
      value: profile?.current_streak || 0,
      icon: <TrendingUp className="text-green-400" size={20} />,
      change: "dias"
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#111C44] via-[#162850] to-[#0286d0]">
        <HeaderNav />
        
        <main className="container mx-auto px-6 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Bem-vindo de volta, {profile?.full_name?.split(' ')[0] || 'Doutor'}! 👋
            </h1>
            <p className="text-cyan-200 text-lg">
              Continue sua jornada de aprendizado em radiologia
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Profile Completeness */}
            <div className="lg:col-span-1">
              <ProfileCompleteness onEditProfile={() => setShowProfileEdit(true)} />
            </div>

            {/* Quick Stats */}
            <div className="lg:col-span-2">
              <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="text-cyan-400" size={20} />
                    Suas Estatísticas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {stats.map((stat, index) => (
                      <div key={index} className="text-center p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex justify-center mb-2">
                          {stat.icon}
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-300">
                          {stat.label}
                        </div>
                        <Badge variant="outline" className="mt-2 border-cyan-500 text-cyan-300">
                          {stat.change}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {quickActions.map((action, index) => (
              <Card key={index} className={`bg-gradient-to-r ${action.color} border-none hover:scale-105 transition-transform duration-300`}>
                <CardContent className="p-6 text-center text-white">
                  <div className="flex justify-center mb-4">
                    {action.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                  <p className="text-white/80 mb-4">{action.description}</p>
                  <Button asChild className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                    <Link to={action.link}>
                      <Play size={16} className="mr-2" />
                      Acessar
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="text-cyan-400" size={20} />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <Award className="text-yellow-400" size={20} />
                  <div className="flex-1">
                    <p className="text-white font-medium">Bem-vindo ao RadVenture!</p>
                    <p className="text-gray-300 text-sm">Você se juntou à nossa comunidade</p>
                  </div>
                  <Badge variant="outline" className="border-cyan-500 text-cyan-300">
                    Agora
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Welcome Modal */}
        <WelcomeModal
          isOpen={showWelcome}
          onClose={() => markTutorialAsSeen()}
          onComplete={() => markTutorialAsSeen()}
        />
      </div>
    </ProtectedRoute>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
