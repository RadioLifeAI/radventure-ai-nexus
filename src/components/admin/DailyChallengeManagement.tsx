
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { QuestionGeneratorSimplified } from './daily-challenge/QuestionGeneratorSimplified';
import { AutomationDashboard } from './daily-challenge/AutomationDashboard';
import { AutomationControlCenter } from './daily-challenge/AutomationControlCenter';
import { AutomationNotifications } from './daily-challenge/AutomationNotifications';
import { PublishingScheduler } from './daily-challenge/PublishingScheduler';
import { ChallengeAnalytics } from './daily-challenge/ChallengeAnalytics';
import { QuestionHistory } from './daily-challenge/QuestionHistory';
import { useDailyChallengeStats } from '@/hooks/useDailyChallengeStats';
import { Bot, Zap, Calendar, BarChart3, History, Loader2 } from 'lucide-react';

export function DailyChallengeManagement() {
  const [activeTab, setActiveTab] = useState('automation');
  const { stats, isLoading } = useDailyChallengeStats();

  return (
    <div className="space-y-6">
      {/* Header Simplificado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Desafios Diários</h1>
          <p className="text-muted-foreground mt-1">Geração automatizada e simplificada</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            ✨ Automatizado
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            v2.0 Simplificado
          </Badge>
        </div>
      </div>

      {/* Stats Cards Compactas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questões Hoje</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.pendingQuestions || 0}
            </div>
            <p className="text-xs text-muted-foreground">Geradas automaticamente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-aprovadas</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Confiança ≥90%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistema</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2 text-green-600">
              ON
            </div>
            <p className="text-xs text-muted-foreground">Funcionando</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2 text-blue-600">
              95%
            </div>
            <p className="text-xs text-muted-foreground">Automação ativa</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Simplificadas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Controle Auto
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Gerador
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Agendamento
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerador Simplificado</CardTitle>
              <CardDescription>
                Sistema automatizado com prompt global unificado - 95% menos trabalho manual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuestionGeneratorSimplified />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>🤖 Central de Controle da Automação</CardTitle>
                  <CardDescription>
                    Sistema 100% automatizado - Gera, agenda e publica questões diariamente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AutomationControlCenter />
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <AutomationNotifications />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard de Automação</CardTitle>
              <CardDescription>
                Monitoramento e métricas do sistema automatizado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutomationDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduler" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agendamento e Publicação</CardTitle>
              <CardDescription>
                Gerencie o calendário de publicação de desafios diários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PublishingScheduler />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics e Estatísticas</CardTitle>
              <CardDescription>
                Acompanhe o desempenho e engajamento dos desafios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChallengeAnalytics />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Questões</CardTitle>
              <CardDescription>
                Visualize todas as questões criadas e suas métricas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuestionHistory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
