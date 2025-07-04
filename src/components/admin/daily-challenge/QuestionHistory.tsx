import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Search, Calendar, BarChart3, Brain, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface QuestionHistoryItem {
  id: string;
  question: string;
  correct_answer: boolean;
  explanation: string;
  status: string;
  published_date: string | null;
  generated_by_ai: boolean;
  ai_confidence: number | null;
  created_at: string;
  prompt_control_id: string | null;
  quiz_prompt_controls?: {
    name: string;
    category: string;
    difficulty: string;
  };
}

export function QuestionHistory() {
  const [questions, setQuestions] = useState<QuestionHistoryItem[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, statusFilter, sourceFilter]);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_quiz_questions')
        .select(`
          *,
          quiz_prompt_controls (
            name,
            category,
            difficulty
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o histórico',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = questions;

    // Filtro por texto
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.explanation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.status === statusFilter);
    }

    // Filtro por origem
    if (sourceFilter !== 'all') {
      const isAI = sourceFilter === 'ai';
      filtered = filtered.filter(q => q.generated_by_ai === isAI);
    }

    setFilteredQuestions(filtered);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'outline' as const,
      approved: 'default' as const,
      rejected: 'destructive' as const,
      published: 'secondary' as const,
    };

    const labels = {
      draft: 'Rascunho',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      published: 'Publicado',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getQuestionStats = () => {
    const total = questions.length;
    const byStatus = {
      draft: questions.filter(q => q.status === 'draft').length,
      approved: questions.filter(q => q.status === 'approved').length,
      rejected: questions.filter(q => q.status === 'rejected').length,
      published: questions.filter(q => q.status === 'published').length,
    };
    const aiGenerated = questions.filter(q => q.generated_by_ai).length;
    const manualCreated = total - aiGenerated;

    return { total, byStatus, aiGenerated, manualCreated };
  };

  const stats = getQuestionStats();

  if (loading) {
    return <div className="flex justify-center p-8">Carregando histórico...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total de Questões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Geradas por IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.aiGenerated}</div>
            <p className="text-xs text-gray-500">
              {stats.total > 0 ? ((stats.aiGenerated / stats.total) * 100).toFixed(0) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Publicadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.byStatus.published}</div>
            <p className="text-xs text-gray-500">Ativas no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.byStatus.draft + stats.byStatus.approved}
            </div>
            <p className="text-xs text-gray-500">Aguardando publicação</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar questões..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Origem</label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as origens</SelectItem>
                  <SelectItem value="ai">Gerado por IA</SelectItem>
                  <SelectItem value="manual">Criado manualmente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Questões */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <Card key={question.id}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <p className="font-medium">{question.question}</p>
                    <p className="text-sm text-gray-600">
                      <strong>Resposta:</strong> {question.correct_answer ? 'Verdadeiro' : 'Falso'}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      <strong>Explicação:</strong> {question.explanation}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 ml-4">
                    {getStatusBadge(question.status)}
                    {question.generated_by_ai && (
                      <Badge variant="outline" className="text-xs">
                        <Brain className="h-3 w-3 mr-1" />
                        IA
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Metadados */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(question.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </span>
                    {question.published_date && (
                      <span>
                        Publicado: {format(new Date(question.published_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    )}
                    {question.quiz_prompt_controls && (
                      <span>
                        {question.quiz_prompt_controls.category} - {question.quiz_prompt_controls.difficulty}
                      </span>
                    )}
                  </div>
                  
                  {question.ai_confidence && (
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      <span>Confiança: {(question.ai_confidence * 100).toFixed(0)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma questão encontrada com os filtros selecionados.</p>
        </div>
      )}

      {/* Paginação poderia ser adicionada aqui para muitas questões */}
      {filteredQuestions.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Mostrando {filteredQuestions.length} de {questions.length} questões
        </div>
      )}
    </div>
  );
}