import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAdminDashboardData } from '@/hooks/useAdminDashboardData';
import { CalendarDays, Send, Clock, CheckCircle, Play, Pause } from 'lucide-react';
import { format, parseISO, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ApprovedQuestion {
  id: string;
  question: string;
  correct_answer: boolean;
  explanation: string;
  created_at: string;
  ai_confidence: number;
}

interface ScheduledChallenge {
  id: string;
  question: string;
  challenge_date: string;
  is_active: boolean;
}

export function WeeklyScheduler() {
  const { scheduleWeeklyBatch, publishTodaysChallenge } = useAdminDashboardData();
  const [approvedQuestions, setApprovedQuestions] = useState<ApprovedQuestion[]>([]);
  const [scheduledChallenges, setScheduledChallenges] = useState<ScheduledChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Carregar questões aprovadas não agendadas
      const { data: approvedData, error: approvedError } = await supabase
        .from('daily_quiz_questions')
        .select('*')
        .eq('status', 'approved')
        .is('published_date', null)
        .order('ai_confidence', { ascending: false })
        .limit(10);

      if (approvedError) throw approvedError;
      setApprovedQuestions(approvedData || []);

      // Carregar desafios já agendados
      const today = new Date();
      const nextWeek = addDays(today, 7);
      
      const { data: scheduledData, error: scheduledError } = await supabase
        .from('daily_challenges')
        .select('*')
        .gte('challenge_date', format(today, 'yyyy-MM-dd'))
        .lte('challenge_date', format(nextWeek, 'yyyy-MM-dd'))
        .order('challenge_date', { ascending: true });

      if (scheduledError) throw scheduledError;
      setScheduledChallenges(scheduledData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const executeWeeklyBatch = async () => {
    setOperationLoading('weekly');
    try {
      await scheduleWeeklyBatch();
      await loadData();
    } finally {
      setOperationLoading(null);
    }
  };

  const publishToday = async () => {
    setOperationLoading('publish');
    try {
      await publishTodaysChallenge();
      await loadData();
    } finally {
      setOperationLoading(null);
    }
  };

  const quickPublishQuestion = async (questionId: string) => {
    try {
      const question = approvedQuestions.find(q => q.id === questionId);
      if (!question) return;

      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Verificar se já existe desafio para hoje
      const existingToday = scheduledChallenges.find(c => c.challenge_date === today);
      if (existingToday) {
        toast({
          title: 'Erro',
          description: 'Já existe um desafio para hoje',
          variant: 'destructive',
        });
        return;
      }

      // Inserir em daily_challenges
      const { error: challengeError } = await supabase
        .from('daily_challenges')
        .insert({
          external_id: `quick-${questionId}`,
          question: question.question,
          correct_answer: question.correct_answer,
          explanation: question.explanation,
          challenge_date: today,
          community_stats: { total_responses: 0, correct_responses: 0 }
        });

      if (challengeError) throw challengeError;

      // Atualizar status da questão
      const { error: updateError } = await supabase
        .from('daily_quiz_questions')
        .update({ 
          published_date: today,
          status: 'published'
        })
        .eq('id', questionId);

      if (updateError) throw updateError;

      toast({
        title: 'Sucesso',
        description: 'Questão publicada imediatamente!',
      });
      
      await loadData();
    } catch (error: any) {
      console.error('Erro ao publicar questão:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível publicar a questão',
        variant: 'destructive',
      });
    }
  };

  const getNextSevenDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i);
      const challenge = scheduledChallenges.find(c => 
        isSameDay(parseISO(c.challenge_date), date)
      );
      
      days.push({
        date,
        challenge,
        isToday: i === 0,
        dateString: format(date, 'yyyy-MM-dd')
      });
    }
    
    return days;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  const weekDays = getNextSevenDays();

  return (
    <div className="space-y-6">
      {/* Controles Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Geração em Lote
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Gera questões automaticamente para os próximos 7 dias usando IA
              </p>
              <Button
                onClick={executeWeeklyBatch}
                disabled={operationLoading === 'weekly'}
                className="w-full"
              >
                {operationLoading === 'weekly' ? (
                  <>
                    <Pause className="h-4 w-4 mr-2 animate-spin" />
                    Gerando Lote...
                  </>
                ) : (
                  <>
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Gerar Lote Semanal
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Publicação Imediata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Publica o desafio diário imediatamente
              </p>
              <Button
                onClick={publishToday}
                disabled={operationLoading === 'publish'}
                variant="outline"
                className="w-full"
              >
                {operationLoading === 'publish' ? (
                  <>
                    <Pause className="h-4 w-4 mr-2 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Publicar Hoje
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendário Semanal */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos 7 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {weekDays.map((day, index) => (
              <div 
                key={day.dateString}
                className={`p-3 border rounded-lg text-center ${
                  day.isToday ? 'border-primary bg-primary/5' : ''
                } ${day.challenge ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}
              >
                <div className="text-xs font-medium">
                  {format(day.date, 'EEE', { locale: ptBR })}
                </div>
                <div className="text-sm font-bold">
                  {format(day.date, 'dd/MM')}
                </div>
                <div className="mt-1">
                  {day.challenge ? (
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Agendado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Vazio
                    </Badge>
                  )}
                </div>
                {day.isToday && (
                  <div className="text-xs text-primary font-medium mt-1">
                    Hoje
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Questões Aprovadas Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Questões Aprovadas Disponíveis ({approvedQuestions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {approvedQuestions.slice(0, 5).map((question) => (
              <div key={question.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm line-clamp-1">{question.question}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {question.correct_answer ? 'Verdadeiro' : 'Falso'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Confiança: {((question.ai_confidence || 0) * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(question.created_at), 'dd/MM', { locale: ptBR })}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => quickPublishQuestion(question.id)}
                >
                  <Send className="h-3 w-3 mr-1" />
                  Publicar
                </Button>
              </div>
            ))}
            {approvedQuestions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma questão aprovada disponível</p>
                <p className="text-xs text-muted-foreground">Execute a geração de lote para criar novas questões</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Desafios Agendados */}
      {scheduledChallenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Desafios Agendados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledChallenges.map((challenge) => (
                <div key={challenge.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-1">{challenge.question}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(challenge.challenge_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  <Badge variant={challenge.is_active ? 'default' : 'secondary'}>
                    {challenge.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}