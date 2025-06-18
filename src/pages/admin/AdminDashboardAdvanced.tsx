import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, Users, Brain, Trophy, Settings, 
  Sparkles, Crown, Shield, Zap, Target,
  TrendingUp, DollarSign, Calendar, Bell
} from "lucide-react";
import { DashboardAnalyticsIntegrated } from "@/components/admin/DashboardAnalyticsIntegrated";
import { UserManagement } from "@/components/admin/UserManagement";
import { SubscriptionManagementIntegrated } from "@/components/admin/SubscriptionManagementIntegrated";
import { AITutorManagement } from "@/components/admin/AITutorManagement";
import { AchievementManagement } from "@/components/admin/AchievementManagement";
import { SystemMonitoringIntegrated } from "@/components/admin/SystemMonitoringIntegrated";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { BackToDashboard } from "@/components/navigation/BackToDashboard";

export default function AdminDashboardAdvanced() {
  const { adminRoles, isAdmin, isLoading } = useAdminPermissions();
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 mb-4">Você não possui permissões administrativas.</p>
          <Button onClick={() => window.location.href = '/dashboard'}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Mapear roles para badges com cores
  const getRoleBadges = () => {
    const roleColors: Record<string, string> = {
      'DEV': 'bg-red-500',
      'ADMIN_DEV': 'bg-red-600',
      'TechAdmin': 'bg-purple-500',
      'SHIELD_MASTER': 'bg-blue-600',
      'LORE_CRAFTER': 'bg-green-600',
      'SPEED_WIZARD': 'bg-yellow-600',
      'DATA_SEER': 'bg-pink-600',
      'GROWTH_HACKER': 'bg-orange-600',
      'LOOT_KEEPER': 'bg-teal-600',
      'HELP_RANGER': 'bg-indigo-600',
      'LAW_GUARDIAN': 'bg-gray-600',
      'WebSecuritySpecialist': 'bg-blue-500',
      'ContentEditor': 'bg-green-500',
      'WebPerformanceSpecialist': 'bg-yellow-500',
      'WebAnalyticsManager': 'bg-pink-500',
      'DigitalMarketingSpecialist': 'bg-orange-500',
      'EcommerceManager': 'bg-teal-500',
      'CustomerSupportCoordinator': 'bg-indigo-500',
      'ComplianceOfficer': 'bg-gray-500'
    };

    return adminRoles.map(role => (
      <Badge key={role.admin_role} className={`${roleColors[role.admin_role]} text-white`}>
        {role.admin_role}
      </Badge>
    ));
  };

  const quickActions = [
    {
      title: "Criar Caso Médico",
      description: "Adicionar novo caso à base de dados",
      icon: Brain,
      color: "bg-blue-500",
      action: () => window.location.href = '/admin/casos-medicos'
    },
    {
      title: "Criar Evento",
      description: "Organizar novo evento competitivo",
      icon: Trophy,
      color: "bg-purple-500",
      action: () => window.location.href = '/admin/events-management'
    },
    {
      title: "Gerenciar Usuários",
      description: "Administrar contas e permissões",
      icon: Users,
      color: "bg-green-500",
      action: () => setActiveTab('users')
    },
    {
      title: "Configurações",
      description: "Ajustar parâmetros do sistema",
      icon: Settings,
      color: "bg-orange-500",
      action: () => setActiveTab('monitoring')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navegação superior */}
        <div className="flex items-center justify-between">
          <BackToDashboard variant="back" />
          <div className="text-sm text-gray-500">
            Painel Administrativo
          </div>
        </div>

        {/* Header Principal */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Crown className="text-yellow-300 h-10 w-10" />
                Painel Administrativo Master
                <Sparkles className="text-yellow-300 h-8 w-8" />
              </h1>
              <p className="text-blue-100 text-lg mt-2">
                Controle total da plataforma médica gamificada
              </p>
              <div className="flex gap-2 mt-4">
                {getRoleBadges()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">🏆 Admin Level</div>
              <div className="text-blue-200 text-lg">Sistema Master Control</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              onClick={action.action}
            >
              <CardHeader className="text-center pb-2">
                <div className={`w-16 h-16 ${action.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription className="text-sm">
                  {action.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Tabs Principais */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Assinaturas
            </TabsTrigger>
            <TabsTrigger value="ai-tutor" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Tutor IA
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Conquistas
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Monitoramento
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DashboardAnalyticsIntegrated />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="subscriptions">
            <SubscriptionManagementIntegrated />
          </TabsContent>

          <TabsContent value="ai-tutor">
            <AITutorManagement />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementManagement />
          </TabsContent>

          <TabsContent value="monitoring">
            <SystemMonitoringIntegrated />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-500" />
                  Configurações do Sistema
                </CardTitle>
                <CardDescription>
                  Parâmetros gerais e configurações avançadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 py-12">
                  <Settings className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
                  <p>Painel de configurações será implementado aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
