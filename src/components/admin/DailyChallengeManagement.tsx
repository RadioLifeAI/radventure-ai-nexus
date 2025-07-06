
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { QuestionGeneratorSimplified } from './daily-challenge/QuestionGeneratorSimplified';
import { MonitorControlCenter } from './daily-challenge/MonitorControlCenter';
import { WeeklyScheduler } from './daily-challenge/WeeklyScheduler';
import { AnalyticsHistory } from './daily-challenge/AnalyticsHistory';
import { useAdminDashboardData } from '@/hooks/useAdminDashboardData';
import { Bot, Zap, Calendar, BarChart3, Loader2 } from 'lucide-react';

export function DailyChallengeManagement() {
  const [activeTab, setActiveTab] = useState('monitor');
  const { data, isLoading } = useAdminDashboardData();

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

      {/* Stats Cards Otimizadas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pool de Questões</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : data?.approved_questions || 0}
            </div>
            <p className="text-xs text-muted-foreground">Questões aprovadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : data?.weekly_generated || 0}
            </div>
            <p className="text-xs text-muted-foreground">Questões geradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistema</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2 text-green-600">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : data?.pool_health === 'excellent' ? 'ÓTIMO' : 'BOM'}
            </div>
            <p className="text-xs text-muted-foreground">Status automação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Acerto</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2 text-blue-600">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `${data?.accuracy_rate.toFixed(1) || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">Usuários acertam</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Otimizadas - 4 Abas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Monitor & Controle
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Gerador Inteligente
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Agendamento Semanal
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics & Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="space-y-4">
          <MonitorControlCenter />
        </TabsContent>

        <TabsContent value="generator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerador Inteligente</CardTitle>
              <CardDescription>
                Sistema automatizado com prompt global unificado - 95% menos trabalho manual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuestionGeneratorSimplified />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduler" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agendamento Semanal</CardTitle>
              <CardDescription>
                Configure e agende questões em lotes semanais otimizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyScheduler />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Histórico</CardTitle>
              <CardDescription>
                Dados reais de performance, engajamento e histórico completo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsHistory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
