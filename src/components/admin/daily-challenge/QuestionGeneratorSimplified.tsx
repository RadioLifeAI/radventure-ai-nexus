
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Brain, Sparkles, Zap, RefreshCw, CheckCircle } from 'lucide-react';

interface GeneratedQuestion {
  id: string;
  question: string;
  correct_answer: boolean;
  explanation: string;
  status: string;
  ai_confidence: number;
  created_at: string;
}

export function QuestionGeneratorSimplified() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<GeneratedQuestion | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
  const { toast } = useToast();

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_quiz_questions')
        .select('status')
        .gte('created_at', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      const total = data?.length || 0;
      const pending = data?.filter(q => q.status === 'draft').length || 0;
      const approved = data?.filter(q => q.status === 'approved').length || 0;

      setStats({ total, pending, approved });
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    }
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  const generateQuestion = async () => {
    setIsGenerating(true);
    
    try {
      console.log('🚀 Iniciando geração simplificada...');
      
      const { data, error } = await supabase.functions.invoke('generate-daily-challenge', {
        body: { mode: 'manual' }
      });

      console.log('📡 Resposta recebida:', { data, error });

      if (error) {
        console.error('❌ Erro na edge function:', error);
        throw error;
      }

      if (data?.success) {
        console.log('✅ Questão gerada com sucesso!');
        
        setLastGenerated(data.question);
        await loadStats();
        
        toast({
          title: '✅ Questão Gerada!',
          description: `Nova questão criada ${data.auto_approved ? 'e aprovada automaticamente' : 'para revisão'}`,
        });
      } else {
        console.error('❌ Erro retornado:', data);
        throw new Error(data?.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('❌ Erro ao gerar questão:', error);
      
      toast({
        title: '❌ Erro na Geração',
        description: error.message || 'Não foi possível gerar a questão',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const approveQuestion = async (questionId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('daily_quiz_questions')
        .update({ 
          status: 'approved',
          reviewed_by: user.user.id
        })
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: '✅ Aprovado',
        description: 'Questão aprovada com sucesso',
      });
      
      if (lastGenerated?.id === questionId) {
        setLastGenerated({ ...lastGenerated, status: 'approved' });
      }
      await loadStats();
    } catch (error) {
      console.error('❌ Erro ao aprovar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar a questão',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Rápidas */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center">{stats.total}</div>
            <p className="text-xs text-muted-foreground text-center">Questões Hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center text-amber-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground text-center">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground text-center">Aprovadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Gerador Simplificado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Gerador Inteligente de Questões
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sistema automatizado com prompt global unificado
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={generateQuestion} 
            disabled={isGenerating}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                Gerando questão inteligente...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                Gerar Questão Diária
              </>
            )}
          </Button>
          
          <div className="text-xs text-center text-muted-foreground">
            ✨ Seleção automática de especialidade, dificuldade e modalidade
          </div>
        </CardContent>
      </Card>

      {/* Preview da Última Questão */}
      {lastGenerated && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Última Questão Gerada</CardTitle>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={
                    lastGenerated.status === 'approved' ? 'default' :
                    lastGenerated.status === 'draft' ? 'secondary' : 'outline'
                  }
                >
                  {lastGenerated.status === 'draft' && 'Para Revisão'}
                  {lastGenerated.status === 'approved' && 'Aprovada'}
                </Badge>
                <Badge variant="outline">
                  {Math.round(lastGenerated.ai_confidence * 100)}% confiança
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="font-medium mb-2">{lastGenerated.question}</p>
              <p className="text-sm text-muted-foreground">
                <strong>Resposta:</strong> {lastGenerated.correct_answer ? 'Verdadeiro' : 'Falso'}
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm">
                <strong>Explicação:</strong> {lastGenerated.explanation}
              </p>
            </div>

            {lastGenerated.status === 'draft' && (
              <Button
                onClick={() => approveQuestion(lastGenerated.id)}
                className="w-full"
                variant="outline"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprovar Questão
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sistema de Automação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Sistema de Automação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Prompt Global Unificado</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Seleção Automática</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Auto-aprovação IA ≥90%</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Interface Simplificada</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
