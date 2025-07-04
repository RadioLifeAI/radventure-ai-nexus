
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Brain, Sparkles, CheckCircle, XCircle, Edit, Save, X, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PromptControl {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  modality: string;
  prompt_template: string;
  is_active: boolean;
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
}

export function QuestionGenerator() {
  const [prompts, setPrompts] = useState<PromptControl[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<GeneratedQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('🔄 Carregando dados do gerador...');
      
      // Carregar prompts ativos
      const { data: promptsData, error: promptsError } = await supabase
        .from('quiz_prompt_controls')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (promptsError) throw promptsError;

      // Carregar questões geradas (últimas 10)
      const { data: questionsData, error: questionsError } = await supabase
        .from('daily_quiz_questions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (questionsError) throw questionsError;

      console.log('📊 Dados carregados:', {
        prompts: promptsData?.length || 0,
        questions: questionsData?.length || 0
      });

      setPrompts(promptsData || []);
      setGeneratedQuestions(questionsData || []);
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

    try {
      console.log('🚀 Iniciando geração de questão...');
      console.log('📋 Prompt selecionado:', {
        id: selectedPrompt.id,
        name: selectedPrompt.name,
        category: selectedPrompt.category,
        difficulty: selectedPrompt.difficulty,
        modality: selectedPrompt.modality
      });

      const { data, error } = await supabase.functions.invoke('generate-daily-challenge', {
        body: {
          promptControlId: selectedPromptId,
          promptTemplate: selectedPrompt.prompt_template,
          category: selectedPrompt.category,
          difficulty: selectedPrompt.difficulty,
          modality: selectedPrompt.modality,
        }
      });

      console.log('📡 Resposta da edge function:', { data, error });

      if (error) {
        console.error('❌ Erro na edge function:', error);
        throw error;
      }

      if (data?.success) {
        console.log('✅ Questão gerada com sucesso!', data.question);
        toast({
          title: '✅ Sucesso',
          description: 'Questão gerada com sucesso!',
        });
        loadData(); // Recarregar as questões
      } else {
        console.error('❌ Erro retornado pela função:', data);
        throw new Error(data?.error || 'Erro desconhecido na geração');
      }
    } catch (error: any) {
      console.error('❌ Erro ao gerar questão:', error);
      
      let errorMessage = 'Não foi possível gerar a questão';
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      toast({
        title: '❌ Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
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
      console.error('❌ Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status',
        variant: 'destructive',
      });
    }
  };

  const saveEditedQuestion = async (questionData: { question: string; explanation: string; correct_answer: boolean }) => {
    if (!editingQuestion) return;

    try {
      const { error } = await supabase
        .from('daily_quiz_questions')
        .update({
          question: questionData.question,
          explanation: questionData.explanation,
          correct_answer: questionData.correct_answer,
        })
        .eq('id', editingQuestion.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Questão editada com sucesso',
      });
      
      setEditingQuestion(null);
      loadData();
    } catch (error) {
      console.error('❌ Erro ao editar questão:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível editar a questão',
        variant: 'destructive',
      });
    }
  };

  const EditQuestionModal = () => {
    const [formData, setFormData] = useState({
      question: editingQuestion?.question || '',
      explanation: editingQuestion?.explanation || '',
      correct_answer: editingQuestion?.correct_answer || false,
    });

    return (
      <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Questão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Pergunta</label>
              <Textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                rows={3}
                placeholder="Digite a pergunta..."
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-2">Resposta Correta</label>
              <Select 
                value={formData.correct_answer.toString()} 
                onValueChange={(value) => setFormData({ ...formData, correct_answer: value === 'true' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Verdadeiro</SelectItem>
                  <SelectItem value="false">Falso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Explicação</label>
              <Textarea
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                rows={4}
                placeholder="Digite a explicação..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => saveEditedQuestion(formData)} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setEditingQuestion(null)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Carregando...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gerador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Gerar Nova Questão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Selecionar Prompt</label>
            <Select value={selectedPromptId} onValueChange={setSelectedPromptId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um prompt para gerar a questão" />
              </SelectTrigger>
              <SelectContent>
                {prompts.map((prompt) => (
                  <SelectItem key={prompt.id} value={prompt.id}>
                    <div className="flex items-center gap-2">
                      <span>{prompt.name}</span>
                      <span className="text-xs text-gray-500">
                        ({prompt.category} • {prompt.difficulty})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {prompts.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ Nenhum prompt ativo encontrado. Configure prompts na aba anterior.
              </p>
            )}
          </div>

          <Button 
            onClick={generateQuestion} 
            disabled={!selectedPromptId || isGenerating || prompts.length === 0}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Gerando questão...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Questão com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Questões Geradas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Questões Geradas Recentemente</h3>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
        
        <div className="space-y-4">
          {generatedQuestions.map((question) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{question.question}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Resposta:</strong> {question.correct_answer ? 'Verdadeiro' : 'Falso'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {question.status === 'draft' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => updateQuestionStatus(question.id, 'approved')}
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateQuestionStatus(question.id, 'rejected')}
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setEditingQuestion(question)}
                            variant="outline"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
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

                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    <strong>Explicação:</strong> {question.explanation}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {question.ai_confidence && (
                      <span>Confiança IA: {(question.ai_confidence * 100).toFixed(0)}%</span>
                    )}
                    <span>{new Date(question.created_at).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {generatedQuestions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhuma questão gerada ainda</h3>
            <p className="text-sm">Use o gerador acima para criar sua primeira questão.</p>
          </div>
        )}
      </div>

      <EditQuestionModal />
    </div>
  );
}
