import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PromptControlManager } from './daily-challenge/PromptControlManager';
import { QuestionGeneratorEnhanced } from './daily-challenge/QuestionGeneratorEnhanced';
import { PublishingScheduler } from './daily-challenge/PublishingScheduler';
import { ChallengeAnalytics } from './daily-challenge/ChallengeAnalytics';
import { QuestionHistory } from './daily-challenge/QuestionHistory';
import { useDailyChallengeStats } from '@/hooks/useDailyChallengeStats';
import { Brain, Calendar, BarChart3, History, Settings, Loader2 } from 'lucide-react';

export function DailyChallengeManagement() {
  const [activeTab, setActiveTab] = useState('prompts');
  const { stats } = useDailyChallengeStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Controle de Desafios Diários</h1>
          <p className="text-muted-foreground mt-1">Gerencie prompts, questões e agendamento automático</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          Sistema Ativo
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prompts Ativos</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {stats.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.activePrompts}
            </div>
            <p className="text-xs text-muted-foreground">Prompts configurados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questões Pendentes</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {stats.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.pendingQuestions}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando revisão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {stats.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.scheduledChallenges}
            </div>
            <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Engajamento</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {stats.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `${stats.engagementRate}%`}
            </div>
            <p className="text-xs text-muted-foreground">Participação hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Prompts
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Gerador
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

        <TabsContent value="prompts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Prompts</CardTitle>
              <CardDescription>
                Configure prompts para geração automática de questões por categoria e dificuldade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PromptControlManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerador de Questões</CardTitle>
              <CardDescription>
                Gere questões usando IA e revise antes da publicação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuestionGeneratorEnhanced />
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