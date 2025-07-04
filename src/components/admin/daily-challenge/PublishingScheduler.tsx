import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { CalendarDays, Send, Clock, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ApprovedQuestion {
  id: string;
  question: string;
  correct_answer: boolean;
  explanation: string;
  created_at: string;
  ai_confidence: number;
}

interface ScheduledQuestion {
  id: string;
  question: string;
  published_date: string;
  status: string;
}

export function PublishingScheduler() {
  const [approvedQuestions, setApprovedQuestions] = useState<ApprovedQuestion[]>([]);
  const [scheduledQuestions, setScheduledQuestions] = useState<ScheduledQuestion[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [loading, setLoading] = useState(true);
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
        .order('created_at', { ascending: false });

      if (approvedError) throw approvedError;
      setApprovedQuestions(approvedData || []);

      // Carregar questões agendadas
      const { data: scheduledData, error: scheduledError } = await supabase
        .from('daily_quiz_questions')
        .select('id, question, published_date, status')
        .not('published_date', 'is', null)
        .order('published_date', { ascending: true });

      if (scheduledError) throw scheduledError;
      setScheduledQuestions(scheduledData || []);
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

  const scheduleQuestion = async (questionId: string, publishDate: Date) => {
    try {
      // Verificar se já existe uma questão para esta data
      const existingForDate = scheduledQuestions.find(q => 
        isSameDay(parseISO(q.published_date), publishDate)
      );

      if (existingForDate) {
        toast({
          title: 'Erro',
          description: 'Já existe uma questão agendada para esta data',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('daily_quiz_questions')
        .update({ 
          published_date: format(publishDate, 'yyyy-MM-dd'),
          status: 'published'
        })
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Questão agendada para ${format(publishDate, 'dd/MM/yyyy')}`,
      });
      
      setShowQuestionModal(false);
      loadData();
    } catch (error) {
      console.error('Erro ao agendar questão:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível agendar a questão',
        variant: 'destructive',
      });
    }
  };

  const publishImmediately = async (questionId: string) => {
    try {
      // Verificar se já existe questão para hoje
      const today = format(new Date(), 'yyyy-MM-dd');
      const existingToday = scheduledQuestions.find(q => q.published_date === today);

      if (existingToday) {
        toast({
          title: 'Erro',
          description: 'Já existe uma questão publicada para hoje',
          variant: 'destructive',
        });
        return;
      }

      // Publicar questão na tabela daily_challenges
      const question = approvedQuestions.find(q => q.id === questionId);
      if (!question) return;

      // Inserir em daily_challenges
      const { error: challengeError } = await supabase
        .from('daily_challenges')
        .insert({
          external_id: `daily-${questionId}`,
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
      
      loadData();
    } catch (error) {
      console.error('Erro ao publicar questão:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível publicar a questão',
        variant: 'destructive',
      });
    }
  };

  const unscheduleQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('daily_quiz_questions')
        .update({ 
          published_date: null,
          status: 'approved'
        })
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Questão removida do agendamento',
      });
      
      loadData();
    } catch (error) {
      console.error('Erro ao desagendar questão:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível desagendar a questão',
        variant: 'destructive',
      });
    }
  };

  // Verificar se uma data tem questão agendada
  const getQuestionForDate = (date: Date) => {
    return scheduledQuestions.find(q => 
      isSameDay(parseISO(q.published_date), date)
    );
  };

  const QuestionSelectionModal = () => (
    <Dialog open={showQuestionModal} onOpenChange={setShowQuestionModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Escolher Questão para {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {approvedQuestions.map((question) => (
            <Card key={question.id} className="cursor-pointer hover:bg-gray-50">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <p className="font-medium">{question.question}</p>
                  <p className="text-sm text-gray-600">
                    Resposta: <strong>{question.correct_answer ? 'Verdadeiro' : 'Falso'}</strong>
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2">{question.explanation}</p>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-gray-500">
                      Confiança: {((question.ai_confidence || 0) * 100).toFixed(0)}%
                    </span>
                    <Button 
                      size="sm"
                      onClick={() => scheduleQuestion(question.id, selectedDate)}
                    >
                      Agendar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Calendário de Publicação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setShowQuestionModal(true);
                }
              }}
              modifiers={{
                scheduled: (date) => !!getQuestionForDate(date),
                today: new Date()
              }}
              modifiersStyles={{
                scheduled: { 
                  backgroundColor: 'hsl(var(--primary))', 
                  color: 'white',
                  fontWeight: 'bold'
                }
              }}
              className="rounded-md border"
            />
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded"></div>
                <span>Data com questão agendada</span>
              </div>
              <p className="text-gray-600">Clique em uma data para agendar uma questão</p>
            </div>
          </CardContent>
        </Card>

        {/* Questões Aprovadas */}
        <Card>
          <CardHeader>
            <CardTitle>Questões Aprovadas ({approvedQuestions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {approvedQuestions.map((question) => (
                <div key={question.id} className="p-3 border rounded-lg">
                  <p className="font-medium text-sm line-clamp-2">{question.question}</p>
                  <div className="flex justify-between items-center mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {question.correct_answer ? 'V' : 'F'}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => publishImmediately(question.id)}
                      variant="outline"
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Publicar Agora
                    </Button>
                  </div>
                </div>
              ))}
              {approvedQuestions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma questão aprovada pendente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questões Agendadas */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Publicações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scheduledQuestions
              .filter(q => new Date(q.published_date) >= new Date())
              .slice(0, 10)
              .map((question) => (
              <div key={question.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm line-clamp-1">{question.question}</p>
                  <p className="text-xs text-gray-500">
                    {format(parseISO(question.published_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={question.status === 'published' ? 'default' : 'secondary'}>
                    {question.status === 'published' ? 'Publicado' : 'Agendado'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => unscheduleQuestion(question.id)}
                  >
                    <Clock className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {scheduledQuestions.filter(q => new Date(q.published_date) >= new Date()).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma questão agendada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <QuestionSelectionModal />
    </div>
  );
}