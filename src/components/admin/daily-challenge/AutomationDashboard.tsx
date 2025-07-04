
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Bot, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Zap,
  Settings,
  Play,
  Pause
} from 'lucide-react';

interface AutomationStats {
  questionsToday: number;
  autoApproved: number;
  avgConfidence: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'error';
  lastGeneration: string | null;
  dailyTarget: number;
}

export function AutomationDashboard() {
  const [stats, setStats] = useState<AutomationStats>({
    questionsToday: 0,
    autoApproved: 0,
    avgConfidence: 0,
    systemHealth: 'good',
    lastGeneration: null,
    dailyTarget: 3
  });
  const [isRunningAuto, setIsRunningAuto] = useState(false);
  const { toast } = useToast();

  const loadAutomationStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: todayQuestions, error } = await supabase
        .from('daily_quiz_questions')
        .select('*')
        .gte('created_at', today);

      if (error) throw error;

      const total = todayQuestions?.length || 0;
      const autoApproved = todayQuestions?.filter(q => 
        q.metadata?.auto_approved === true
      ).length || 0;
      
      const avgConfidence = todayQuestions?.length ? 
        todayQuestions.reduce((sum, q) => sum + (q.ai_confidence || 0), 0) / todayQuestions.length : 0;

      const lastGeneration = todayQuestions?.[0]?.created_at || null;

      // Determinar health do sistema
      let systemHealth: AutomationStats['systemHealth'] = 'excellent';
      if (total === 0) systemHealth = 'warning';
      else if (avgConfidence < 0.8) systemHealth = 'good';
      else if (total >= 3 && avgConfidence >= 0.9) systemHealth = 'excellent';

      setStats({
        questionsToday: total,
        autoApproved,
        avgConfidence,
        systemHealth,
        lastGeneration,
        dailyTarget: 3
      });

    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    }
  };

  useEffect(() => {
    loadAutomationStats();
    const interval = setInterval(loadAutomationStats, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  const runAutomation = async () => {
    setIsRunningAuto(true);
    
    try {
      console.log('🤖 Executando automação...');

      const { data, error } = await supabase.functions.invoke('generate-daily-challenge', {
        body: { mode: 'auto' }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: '🤖 Automação Executada',
          description: `Questão gerada automaticamente ${data.auto_approved ? 'e aprovada' : ''}`,
        });
        
        await loadAutomationStats();
      } else {
        throw new Error(data?.error || 'Erro na automação');
      }
    } catch (error: any) {
      console.error('❌ Erro na automação:', error);
      toast({
        title: '❌ Erro na Automação',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsRunningAuto(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-amber-600 bg-amber-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="h-5 w-5" />;
      case 'good': return <TrendingUp className="h-5 w-5" />;
      case 'warning': return <AlertCircle className="h-5 w-5" />;
      case 'error': return <AlertCircle className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Geral do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Status da Automação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getHealthColor(stats.systemHealth)}`}>
              {getHealthIcon(stats.systemHealth)}
              <span className="font-medium capitalize">{stats.systemHealth}</span>
            </div>
            
            <Button
              onClick={runAutomation}
              disabled={isRunningAuto}
              className="flex items-center gap-2"
            >
              {isRunningAuto ? (
                <>
                  <Pause className="h-4 w-4 animate-spin" />
                  Executando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Executar Agora
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.questionsToday}</p>
                <p className="text-xs text-muted-foreground">Questões Hoje</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min((stats.questionsToday / stats.dailyTarget) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {stats.dailyTarget}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.autoApproved}</p>
                <p className="text-xs text-muted-foreground">Auto-aprovadas</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.avgConfidence * 100)}%</p>
                <p className="text-xs text-muted-foreground">Confiança Média</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {stats.lastGeneration ? 
                    new Date(stats.lastGeneration).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : '--:--'
                  }
                </p>
                <p className="text-xs text-muted-foreground">Última Geração</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recursos de Automação */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos Automatizados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Prompt Global Unificado</p>
                <p className="text-xs text-muted-foreground">Um prompt que se adapta a qualquer especialidade</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Seleção Inteligente</p>
                <p className="text-xs text-muted-foreground">Algoritmo balanceado de especialidades</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Auto-aprovação ≥90%</p>
                <p className="text-xs text-muted-foreground">Questões com alta confiança aprovadas automaticamente</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Bot className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Execução Manual/Auto</p>
                <p className="text-xs text-muted-foreground">Sistema híbrido conforme necessidade</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Próximos Passos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Passos da Automação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Fase 2</Badge>
              <span className="text-sm">Cron job diário automático</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Fase 3</Badge>
              <span className="text-sm">Pool de questões sempre abastecido</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Fase 4</Badge>
              <span className="text-sm">Personalização por usuário</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
