import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Brain, Sparkles, CheckCircle, XCircle, Edit, Save, X, AlertTriangle, Clock, Zap, Activity } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface PromptControl {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  modality: string;
  prompt_template: string;
  is_active: boolean;
  usage_count: number;
  success_rate: number;
}

interface GeneratedQuestion {
  id: string;
  question: string;
  correct_answer: boolean;
  explanation: string;
  status: string;
  ai_confidence: number;
  created_at: string;
  prompt_control_id: string;
  metadata: any;
}

export function QuestionGeneratorEnhanced() {
  const [prompts, setPrompts] = useState<PromptControl[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<GeneratedQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');
  const [apiMetrics, setApiMetrics] = useState({ calls: 0, cost: 0, avgTime: 0 });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    loadMetrics();
  }, []);

  const loadData = async () => {
    try {
      // Carregar prompts ativos
      const { data: promptsData, error: promptsError } = await supabase
        .from('quiz_prompt_controls')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (promptsError) throw promptsError;
      setPrompts(promptsData || []);

      // Carregar questões geradas (últimas 10)
      const { data: questionsData, error: questionsError } = await supabase
        .from('daily_quiz_questions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (questionsError) throw questionsError;
      setGeneratedQuestions(questionsData || []);
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

  const loadMetrics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('daily_quiz_questions')
        .select('created_at, ai_confidence, metadata')
        .gte('created_at', today);

      if (data) {
        setApiMetrics({
          calls: data.length,
          cost: data.reduce((acc, q) => {
            const metadata = q.metadata as any;
            return acc + (metadata?.cost || 0.001);
          }, 0),
          avgTime: data.reduce((acc, q) => {
            const metadata = q.metadata as any;
            return acc + (metadata?.response_time || 1000);
          }, 0) / (data.length || 1)
        });
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  };

  const generateQuestion = async () => {
    if (!selectedPromptId) {
      toast({
        title: 'Erro',
        description: 'Selecione um prompt para gerar a questão',
        variant: 'destructive',
      });
      return;
    }

    const selectedPrompt = prompts.find(p => p.id === selectedPromptId);
    if (!selectedPrompt) return;

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStep('Preparando requisição...');

    try {
      // Simular progresso visual
      setGenerationProgress(20);
      setGenerationStep('Conectando com OpenAI...');

      console.log('🚀 INICIANDO GERAÇÃO - Detalhes:', {
        promptControlId: selectedPromptId,
        category: selectedPrompt.category,
        difficulty: selectedPrompt.difficulty,
        modality: selectedPrompt.modality,
        promptLength: selectedPrompt.prompt_template.length,
        timestamp: new Date().toISOString()
      });

      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay

      setGenerationProgress(40);
      setGenerationStep('Processando com IA...');

      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke('generate-daily-challenge', {
        body: {
          promptControlId: selectedPromptId,
          promptTemplate: selectedPrompt.prompt_template,
          category: selectedPrompt.category,
          difficulty: selectedPrompt.difficulty,
          modality: selectedPrompt.modality,
        }
      });
      const responseTime = Date.now() - startTime;

      setGenerationProgress(80);
      setGenerationStep('Validando resposta...');

      console.log('📡 RESPOSTA COMPLETA DA EDGE FUNCTION:', {
        data,
        error,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      });

      if (error) {
        console.error('❌ ERRO NA CHAMADA DA EDGE FUNCTION:', {
          error,
          errorType: typeof error,
          errorDetails: JSON.stringify(error, null, 2)
        });

        // Análise detalhada do erro
        let specificError = 'Erro de comunicação com o servidor';
        if (error.message?.includes('CORS')) {
          specificError = '🌐 Erro de CORS - Configuração de segurança do navegador';
        } else if (error.message?.includes('timeout')) {
          specificError = '⏱️ Timeout - Servidor demorou para responder';
        } else if (error.message?.includes('network')) {
          specificError = '📶 Erro de rede - Verifique sua conexão';
        } else if (error.message?.includes('500')) {
          specificError = '🔥 Erro interno do servidor - Verifique logs do Supabase';
        }

        throw new Error(specificError);
      }

      setGenerationProgress(90);
      setGenerationStep('Salvando questão...');

      if (data?.success) {
        console.log('✅ QUESTÃO GERADA COM SUCESSO:', {
          questionId: data.question?.id,
          questionText: data.question?.question?.substring(0, 50) + '...',
          confidence: data.ai_response?.confidence,
          responseTime: `${responseTime}ms`
        });

        setGenerationProgress(100);
        setGenerationStep('Concluído!');

        toast({
          title: '✅ Questão Gerada com Sucesso!',
          description: `"${data.question?.question?.substring(0, 60)}..." (Confiança: ${(data.ai_response?.confidence || 0.8 * 100).toFixed(0)}%)`,
        });

        // Atualizar métricas
        loadMetrics();
        loadData(); // Recarregar as questões
      } else {
        console.error('❌ ERRO RETORNADO PELA FUNÇÃO:', {
          data,
          errorMessage: data?.error,
          fullResponse: JSON.stringify(data, null, 2)
        });

        // Análise específica do erro da função
        let functionError = data?.error || 'Erro desconhecido na geração da questão';
        if (functionError.includes('OPENAI_API_KEY')) {
          functionError = '🔑 OPENAI_API_KEY não configurada no Supabase Secrets';
        } else if (functionError.includes('quota')) {
          functionError = '💰 Cota da OpenAI excedida - Verifique sua conta OpenAI';
        } else if (functionError.includes('model')) {
          functionError = '🤖 Erro no modelo de IA - Verifique configurações';
        }

        throw new Error(functionError);
      }
    } catch (error: any) {
      setGenerationProgress(0);
      setGenerationStep('');

      console.error('❌ ERRO COMPLETO NA GERAÇÃO:', {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
        selectedPrompt: {
          id: selectedPromptId,
          name: selectedPrompt.name,
          category: selectedPrompt.category
        },
        timestamp: new Date().toISOString(),
        fullError: error
      });
      
      let userFriendlyMessage = 'Não foi possível gerar a questão';
      
      // Categorização detalhada de erros
      if (error.message?.includes('OPENAI_API_KEY')) {
        userFriendlyMessage = '🔑 Configure a OPENAI_API_KEY no Supabase Edge Functions Secrets';
      } else if (error.message?.includes('CORS')) {
        userFriendlyMessage = '🌐 Erro de CORS - Entre em contato com o suporte técnico';
      } else if (error.message?.includes('timeout')) {
        userFriendlyMessage = '⏱️ Timeout - A IA demorou para responder. Tente novamente.';
      } else if (error.message?.includes('quota')) {
        userFriendlyMessage = '💰 Cota da OpenAI excedida - Verifique limites de uso';
      } else if (error.message?.includes('500')) {
        userFriendlyMessage = '🔥 Erro interno - Verifique logs do Supabase Functions';
      } else if (error.message?.includes('network')) {
        userFriendlyMessage = '📶 Erro de conexão - Verifique sua internet';
      } else if (error.message) {
        userFriendlyMessage = `🚨 ${error.message}`;
      }
      
      toast({
        title: '❌ Erro na Geração de Questão',
        description: userFriendlyMessage,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setGenerationProgress(0);
        setGenerationStep('');
      }, 2000);
    }
  };

  const updateQuestionStatus = async (questionId: string, status: 'approved' | 'rejected') => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('daily_quiz_questions')
        .update({ 
          status,
          reviewed_by: user.user.id
        })
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Questão ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso`,
      });
      
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Métricas da API */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Gerações Hoje
            </CardTitle>
            <div className="text-2xl font-bold">{apiMetrics.calls}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Custo Estimado
            </CardTitle>
            <div className="text-2xl font-bold">${apiMetrics.cost.toFixed(3)}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tempo Médio
            </CardTitle>
            <div className="text-2xl font-bold">{(apiMetrics.avgTime / 1000).toFixed(1)}s</div>
          </CardHeader>
        </Card>
      </div>

      {/* Gerador Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Gerador de Questões IA - Versão Aprimorada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Selecionar Prompt Configurado</label>
            <Select value={selectedPromptId} onValueChange={setSelectedPromptId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um prompt para gerar a questão" />
              </SelectTrigger>
              <SelectContent>
                {prompts.map((prompt) => (
                  <SelectItem key={prompt.id} value={prompt.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{prompt.name} - {prompt.category} ({prompt.difficulty})</span>
                      <Badge variant="outline" className="ml-2">
                        {prompt.usage_count} usos
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Área de Status da Geração */}
          {isGenerating && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">{generationStep}</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </div>
          )}

          {/* Informações do Prompt Selecionado */}
          {selectedPromptId && (
            <div className="bg-muted p-4 rounded-lg">
              {(() => {
                const selected = prompts.find(p => p.id === selectedPromptId);
                return selected ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-sm">
                      <span><strong>Categoria:</strong> {selected.category}</span>
                      <span><strong>Dificuldade:</strong> {selected.difficulty}</span>
                      <span><strong>Modalidade:</strong> {selected.modality}</span>
                    </div>
                    <div>
                      <strong className="text-sm">Preview do Prompt:</strong>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {selected.prompt_template.substring(0, 200)}...
                      </p>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Usado {selected.usage_count} vezes</span>
                      <span>Taxa de sucesso: {(selected.success_rate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <Button 
            onClick={generateQuestion} 
            disabled={!selectedPromptId || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Gerando... ({generationProgress}%)
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Questão com IA
              </>
            )}
          </Button>

          {/* Alertas e Dicas */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Dica:</strong> Certifique-se de que a OPENAI_API_KEY está configurada no Supabase Edge Functions Secrets para usar este recurso.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Lista de Questões Geradas - Mesmo conteúdo do componente original */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Questões Geradas Recentemente</h3>
        <div className="space-y-4">
          {generatedQuestions.map((question) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{question.question}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Resposta: <strong>{question.correct_answer ? 'Verdadeiro' : 'Falso'}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {question.status === 'draft' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateQuestionStatus(question.id, 'approved')}
                            variant="outline"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateQuestionStatus(question.id, 'rejected')}
                            variant="outline"
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      <Badge 
                        variant={
                          question.status === 'approved' ? 'default' :
                          question.status === 'rejected' ? 'destructive' :
                          question.status === 'published' ? 'secondary' : 'outline'
                        }
                      >
                        {question.status === 'draft' && 'Rascunho'}
                        {question.status === 'approved' && 'Aprovado'}
                        {question.status === 'rejected' && 'Rejeitado'}
                        {question.status === 'published' && 'Publicado'}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <strong>Explicação:</strong> {question.explanation}
                  </div>

                  {question.ai_confidence && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Confiança da IA: {(question.ai_confidence * 100).toFixed(0)}%</span>
                      <span>•</span>
                      <span>{new Date(question.created_at).toLocaleString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {generatedQuestions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma questão gerada ainda.</p>
            <p className="text-sm">Use o gerador acima para criar sua primeira questão.</p>
          </div>
        )}
      </div>
    </div>
  );
}