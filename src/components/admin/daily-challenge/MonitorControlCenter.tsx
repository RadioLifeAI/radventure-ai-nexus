import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminDashboardData } from '@/hooks/useAdminDashboardData';
import { 
  Bot, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  Calendar,
  Settings,
  Play,
  RefreshCw,
  Activity,
  TrendingUp
} from 'lucide-react';

export function MonitorControlCenter() {
  const { 
    data, 
    isLoading, 
    generateQuestion, 
    scheduleWeeklyBatch, 
    publishTodaysChallenge, 
    maintainPool 
  } = useAdminDashboardData();
  
  const [operationLoading, setOperationLoading] = useState<string | null>(null);

  const executeOperation = async (operation: string, fn: () => Promise<any>) => {
    setOperationLoading(operation);
    try {
      await fn();
    } finally {
      setOperationLoading(null);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="h-5 w-5" />;
      case 'good': return <Activity className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'critical': return <AlertTriangle className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Carregando dados do sistema...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8 text-red-500">
        Erro ao carregar dados do sistema
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
            Monitor & Controle da Automação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status do Sistema */}
            <div className={`p-4 rounded-lg border ${getHealthColor(data.pool_health)}`}>
              <div className="flex items-center gap-2 mb-2">
                {getHealthIcon(data.pool_health)}
                <span className="font-medium capitalize">{data.pool_health}</span>
              </div>
              <p className="text-sm opacity-80">Status do Pool</p>
            </div>

            {/* Questões Aprovadas */}
            <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-600">{data.approved_questions}</span>
              </div>
              <p className="text-sm text-blue-600 opacity-80">Questões Aprovadas</p>
            </div>

            {/* Questões Pendentes */}
            <div className="p-4 rounded-lg border bg-amber-50 border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-amber-600" />
                <span className="font-medium text-amber-600">{data.pending_questions}</span>
              </div>
              <p className="text-sm text-amber-600 opacity-80">Aguardando Revisão</p>
            </div>

            {/* Taxa de Aprovação */}
            <div className="p-4 rounded-lg border bg-green-50 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-600">{Math.round(data.avg_confidence * 100)}%</span>
              </div>
              <p className="text-sm text-green-600 opacity-80">Confiança Média</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Produção */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{data.weekly_generated}</p>
                <p className="text-xs text-muted-foreground">Esta Semana</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                Semana passada: {data.generation_trend.last_week}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{data.monthly_generated}</p>
                <p className="text-xs text-muted-foreground">Este Mês</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{data.total_responses}</p>
                <p className="text-xs text-muted-foreground">Respostas Totais</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{data.accuracy_rate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Taxa de Acerto</p>
              </div>
              <CheckCircle className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de Automação */}
      <Card>
        <CardHeader>
          <CardTitle>Controles de Automação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status dos Cron Jobs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Geração Semanal</p>
                  <p className="text-xs text-muted-foreground">Domingos às 23:00</p>
                </div>
                <Badge variant="default">Ativo</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Publicação Diária</p>
                  <p className="text-xs text-muted-foreground">Diário às 06:00</p>
                </div>
                <Badge variant="default">Ativo</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Manutenção Pool</p>
                  <p className="text-xs text-muted-foreground">Diário às 22:00</p>
                </div>
                <Badge variant="default">Ativo</Badge>
              </div>
            </div>

            {/* Ações Manuais */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Executar Manualmente</h4>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => executeOperation('generate', generateQuestion)}
                  disabled={operationLoading === 'generate'}
                >
                  {operationLoading === 'generate' ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-1" />
                  )}
                  Gerar Questão
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => executeOperation('publish', publishTodaysChallenge)}
                  disabled={operationLoading === 'publish'}
                >
                  {operationLoading === 'publish' ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-1" />
                  )}
                  Publicar Hoje
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => executeOperation('weekly', scheduleWeeklyBatch)}
                  disabled={operationLoading === 'weekly'}
                >
                  {operationLoading === 'weekly' ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Calendar className="h-4 w-4 mr-1" />
                  )}
                  Lote Semanal
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => executeOperation('maintain', maintainPool)}
                  disabled={operationLoading === 'maintain'}
                >
                  {operationLoading === 'maintain' ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Settings className="h-4 w-4 mr-1" />
                  )}
                  Manter Pool
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Sistema Automatizado Ativo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Geração automática: Questões criadas conforme demanda</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Auto-aprovação: Questões ≥90% de confiança aprovadas automaticamente</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Publicação inteligente: Desafio diário publicado automaticamente</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Pool equilibrado: Sistema mantém 5-10 questões sempre disponíveis</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}