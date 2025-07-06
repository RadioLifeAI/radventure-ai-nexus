import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminDashboardData } from '@/hooks/useAdminDashboardData';
import { 
  BarChart3, 
  Users, 
  Target, 
  TrendingUp, 
  Search, 
  Calendar, 
  Brain, 
  Filter,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
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
  metadata?: any;
}

export function AnalyticsHistory() {
  const { data: dashboardData, isLoading: dashboardLoading } = useAdminDashboardData();
  const [questions, setQuestions] = useState<QuestionHistoryItem[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'analytics' | 'history'>('analytics');

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
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.explanation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.status === statusFilter);
    }

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
      pending: 'secondary' as const,
      published: 'default' as const,
    };

    const labels = {
      draft: 'Rascunho',
      approved: 'Aprovado',
      pending: 'Pendente',
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
      pending: questions.filter(q => q.status === 'pending').length,
      published: questions.filter(q => q.status === 'published').length,
    };
    const aiGenerated = questions.filter(q => q.generated_by_ai).length;

    return { total, byStatus, aiGenerated };
  };

  const stats = getQuestionStats();

  // Analytics Tab Content
  const AnalyticsTab = () => {
    if (dashboardLoading) {
      return <div className="flex justify-center p-8">Carregando analytics...</div>;
    }

    if (!dashboardData) {
      return <div className="text-center p-8 text-gray-500">Dados não disponíveis</div>;
    }

    return (
      <div className="space-y-6">
        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Questões</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.total_questions}</div>
              <p className="text-xs text-muted-foreground">No sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Respostas de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.total_responses}</div>
              <p className="text-xs text-muted-foreground">Interações totais</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Acerto</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.accuracy_rate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.correct_responses} de {dashboardData.total_responses} corretas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Geração IA</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(dashboardData.avg_confidence * 100)}%</div>
              <p className="text-xs text-muted-foreground">Confiança média</p>
            </CardContent>
          </Card>
        </div>

        {/* Tendências */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Produção Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Esta semana</span>
                  <span className="font-bold text-blue-600">{dashboardData.generation_trend.this_week}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Semana passada</span>
                  <span className="font-bold text-gray-600">{dashboardData.generation_trend.last_week}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Este mês</span>
                  <span className="font-bold text-green-600">{dashboardData.generation_trend.this_month}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pool Health</span>
                  <Badge variant={dashboardData.pool_health === 'excellent' ? 'default' : 'secondary'}>
                    {dashboardData.pool_health}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Questões Aprovadas</span>
                  <span className="font-bold">{dashboardData.approved_questions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pendentes</span>
                  <span className="font-bold text-orange-600">{dashboardData.pending_questions}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // History Tab Content
  const HistoryTab = () => (
    <div className="space-y-6">
      {/* Estatísticas do Histórico */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total</CardTitle>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.byStatus.pending + stats.byStatus.approved}
            </div>
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
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
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
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="ai">IA</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Questões */}
      <div className="space-y-4">
        {filteredQuestions.slice(0, 20).map((question) => (
          <Card key={question.id}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <p className="font-medium line-clamp-2">{question.question}</p>
                    <p className="text-sm text-gray-600">
                      <strong>Resposta:</strong> {question.correct_answer ? 'Verdadeiro' : 'Falso'}
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

                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(question.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </span>
                  
                  {question.ai_confidence && (
                    <span>Confiança: {(question.ai_confidence * 100).toFixed(0)}%</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuestions.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma questão encontrada com os filtros selecionados.</p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-4">
        <Button
          variant={activeTab === 'analytics' ? 'default' : 'outline'}
          onClick={() => setActiveTab('analytics')}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Analytics
        </Button>
        <Button
          variant={activeTab === 'history' ? 'default' : 'outline'}
          onClick={() => setActiveTab('history')}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Histórico
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'analytics' ? <AnalyticsTab /> : <HistoryTab />}
    </div>
  );
}