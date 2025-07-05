import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useAutomationSystem } from '@/hooks/useAutomationSystem';
import { 
  Bot, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  Calendar,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Activity
} from 'lucide-react';

interface AutomationStatus {
  isActive: boolean;
  lastExecution: string | null;
  nextExecution: string | null;
  questionsInPool: number;
  scheduledQuestions: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'error';
  cronJobs: {
    autoSchedule: boolean;
    autoPublish: boolean;
    poolMaintenance: boolean;
  };
}

export function AutomationControlCenter() {
  const { 
    metrics, 
    isLoading, 
    scheduleQuestions, 
    publishTodaysChallenge, 
    maintainQuestionPool,
    generateQuestionAuto 
  } = useAutomationSystem();
  
  const { toast } = useToast();

  const executeManualOperation = async (operation: string) => {
    try {
      switch (operation) {
        case 'schedule':
          await scheduleQuestions();
          break;
        case 'publish':
          await publishTodaysChallenge();
          break;
        case 'maintain_pool':
          await maintainQuestionPool();
          break;
        case 'generate':
          await generateQuestionAuto();
          break;
        default:
          throw new Error('Operação desconhecida');
      }
    } catch (error: any) {
      console.error('Erro na operação:', error);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="h-5 w-5" />;
      case 'good': return <Activity className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'error': return <AlertTriangle className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Carregando status da automação...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            Central de Controle da Automação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status do Sistema */}
            <div className={`p-4 rounded-lg border ${getHealthColor(metrics.systemHealth)}`}>
              <div className="flex items-center gap-2 mb-2">
                {getHealthIcon(metrics.systemHealth)}
                <span className="font-medium capitalize">{metrics.systemHealth}</span>
              </div>
              <p className="text-sm opacity-80">Status do Sistema</p>
            </div>

            {/* Questões no Pool */}
            <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-600">{metrics.questionsInPool}</span>
              </div>
              <p className="text-sm text-blue-600 opacity-80">Questões no Pool</p>
            </div>

            {/* Questões Agendadas */}
            <div className="p-4 rounded-lg border bg-purple-50 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-600">{metrics.scheduledQuestions}</span>
              </div>
              <p className="text-sm text-purple-600 opacity-80">Questões Agendadas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controles de Automação */}
      <Card>
        <CardHeader>
          <CardTitle>Controles de Automação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Cron Jobs Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Auto-Agendamento</p>
                  <p className="text-xs text-muted-foreground">Diário às 23:00</p>
                </div>
                <Switch checked={true} disabled />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Auto-Publicação</p>
                  <p className="text-xs text-muted-foreground">Diário às 06:00</p>
                </div>
                <Switch checked={true} disabled />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Manutenção Pool</p>
                  <p className="text-xs text-muted-foreground">Diário às 22:00</p>
                </div>
                <Switch checked={true} disabled />
              </div>
            </div>

            {/* Ações Manuais */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Executar Manualmente</h4>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => executeManualOperation('schedule')}
                  disabled={isLoading}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Agendar Questões
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => executeManualOperation('publish')}
                  disabled={isLoading}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Publicar Hoje
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => executeManualOperation('maintain_pool')}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Manter Pool
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => executeManualOperation('generate')}
                  disabled={isLoading}
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Gerar Questão
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Automação Ativo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Auto-agendamento: Questões são agendadas automaticamente para os próximos 7 dias</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Auto-publicação: Desafio diário é publicado automaticamente às 6:00 AM</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Pool inteligente: Sistema mantém sempre 5-10 questões aprovadas disponíveis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Geração automática: Novas questões são geradas quando o pool fica baixo</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}