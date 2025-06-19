
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/Loader";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  Target, 
  Clock,
  Award,
  Brain,
  Eye,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Activity
} from "lucide-react";

interface CaseAdvancedAnalyticsModalProps {
  open: boolean;
  onClose: () => void;
  caseId: string | null;
}

export function CaseAdvancedAnalyticsModal({ open, onClose, caseId }: CaseAdvancedAnalyticsModalProps) {
  const [loading, setLoading] = useState(false);
  const [caseData, setCaseData] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (open && caseId) {
      loadCaseAnalytics();
    }
  }, [open, caseId]);

  const loadCaseAnalytics = async () => {
    if (!caseId) return;
    
    setLoading(true);
    try {
      // Carregar dados do caso
      const { data: caseInfo, error: caseError } = await supabase
        .from("medical_cases")
        .select("*")
        .eq("id", caseId)
        .single();

      if (caseError) throw caseError;

      // Carregar estatísticas de uso
      const { data: historyData, error: historyError } = await supabase
        .from("user_case_history")
        .select(`
          *,
          profiles (full_name, username)
        `)
        .eq("case_id", caseId);

      if (historyError) throw historyError;

      setCaseData(caseInfo);
      
      // Processar analytics
      const processedAnalytics = processAnalyticsData(historyData || []);
      setAnalytics(processedAnalytics);
    } catch (error: any) {
      console.error("Erro ao carregar analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (historyData: any[]) => {
    const totalAttempts = historyData.length;
    const correctAnswers = historyData.filter(h => h.is_correct).length;
    const successRate = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;
    
    // Dados por dia (últimos 7 dias)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const dailyData = last7Days.map(date => {
      const dayAttempts = historyData.filter(h => 
        h.answered_at.startsWith(date)
      );
      return {
        date: new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' }),
        attempts: dayAttempts.length,
        correct: dayAttempts.filter(h => h.is_correct).length
      };
    });

    // Distribuição de acertos vs erros
    const resultDistribution = [
      { name: 'Corretas', value: correctAnswers, color: '#10b981' },
      { name: 'Incorretas', value: totalAttempts - correctAnswers, color: '#ef4444' }
    ];

    // Top usuários
    const userPerformance = historyData.reduce((acc, curr) => {
      const userId = curr.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          name: curr.profiles?.full_name || curr.profiles?.username || 'Usuário',
          attempts: 0,
          correct: 0
        };
      }
      acc[userId].attempts++;
      if (curr.is_correct) acc[userId].correct++;
      return acc;
    }, {});

    const topUsers = Object.values(userPerformance)
      .sort((a: any, b: any) => b.correct - a.correct)
      .slice(0, 5);

    return {
      totalAttempts,
      correctAnswers,
      successRate,
      dailyData,
      resultDistribution,
      topUsers,
      averageTime: historyData.length > 0 ? 
        Math.round(historyData.reduce((acc, curr) => acc + (curr.details?.time_spent || 120), 0) / historyData.length) : 0
    };
  };

  const getDifficultyColor = (level: number) => {
    const colors = {
      1: "bg-green-100 text-green-700",
      2: "bg-yellow-100 text-yellow-700", 
      3: "bg-orange-100 text-orange-700",
      4: "bg-red-100 text-red-700",
      5: "bg-purple-100 text-purple-700"
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getDifficultyLabel = (level: number) => {
    const labels = {
      1: "Muito Fácil",
      2: "Fácil",
      3: "Moderado", 
      4: "Difícil",
      5: "Muito Difícil"
    };
    return labels[level as keyof typeof labels] || "Indefinido";
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-blue-600" />
            Analytics Avançado do Caso
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header com informações básicas */}
            {caseData && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{caseData.title}</h3>
                    <p className="text-gray-600 mt-1">{caseData.specialty} • {caseData.modality}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getDifficultyColor(caseData.difficulty_level)}>
                      <Brain className="h-3 w-3 mr-1" />
                      {getDifficultyLabel(caseData.difficulty_level)}
                    </Badge>
                    <Badge variant="secondary">
                      <Target className="h-3 w-3 mr-1" />
                      {caseData.points} pontos
                    </Badge>
                  </div>
                </div>
                
                {analytics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{analytics.totalAttempts}</div>
                      <div className="text-sm text-gray-500">Total de Tentativas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{analytics.successRate.toFixed(1)}%</div>
                      <div className="text-sm text-gray-500">Taxa de Acerto</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{analytics.averageTime}s</div>
                      <div className="text-sm text-gray-500">Tempo Médio</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{analytics.topUsers.length}</div>
                      <div className="text-sm text-gray-500">Usuários Ativos</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {analytics && (
              <Tabs defaultValue="performance" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="performance" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Performance
                  </TabsTrigger>
                  <TabsTrigger value="users" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Usuários
                  </TabsTrigger>
                  <TabsTrigger value="time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Temporal
                  </TabsTrigger>
                  <TabsTrigger value="quality" className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Qualidade
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="performance" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Distribuição de Resultados
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={analytics.resultDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              dataKey="value"
                            >
                              {analytics.resultDistribution.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-4">
                          {analytics.resultDistribution.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm">{entry.name}: {entry.value}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5" />
                          Taxa de Sucesso
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Taxa de Acerto Geral</span>
                              <span className="font-medium">{analytics.successRate.toFixed(1)}%</span>
                            </div>
                            <Progress value={analytics.successRate} className="h-2" />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                              <div className="text-lg font-semibold text-green-700">{analytics.correctAnswers}</div>
                              <div className="text-xs text-green-600">Acertos</div>
                            </div>
                            <div className="text-center p-3 bg-red-50 rounded-lg">
                              <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                              <div className="text-lg font-semibold text-red-700">{analytics.totalAttempts - analytics.correctAnswers}</div>
                              <div className="text-xs text-red-600">Erros</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="users" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Top Performers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analytics.topUsers.map((user: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                index === 1 ? 'bg-gray-100 text-gray-700' :
                                index === 2 ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.attempts} tentativas</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-green-600">{user.correct} acertos</div>
                              <div className="text-sm text-gray-500">
                                {((user.correct / user.attempts) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="time" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Atividade dos Últimos 7 Dias
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.dailyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="attempts" stroke="#3b82f6" strokeWidth={2} name="Tentativas" />
                          <Line type="monotone" dataKey="correct" stroke="#10b981" strokeWidth={2} name="Acertos" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="quality" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          Métricas de Qualidade
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Engajamento</span>
                            <span className="font-medium">{Math.min(analytics.totalAttempts * 10, 100)}%</span>
                          </div>
                          <Progress value={Math.min(analytics.totalAttempts * 10, 100)} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Dificuldade Apropriada</span>
                            <span className="font-medium">
                              {analytics.successRate > 80 ? 'Fácil' : 
                               analytics.successRate > 50 ? 'Adequado' : 'Difícil'}
                            </span>
                          </div>
                          <Progress 
                            value={analytics.successRate > 80 ? 40 : analytics.successRate > 50 ? 85 : 60} 
                            className="h-2" 
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Clareza da Questão</span>
                            <span className="font-medium">
                              {analytics.averageTime < 60 ? 'Muito Clara' :
                               analytics.averageTime < 120 ? 'Clara' : 'Complexa'}
                            </span>
                          </div>
                          <Progress 
                            value={analytics.averageTime < 60 ? 90 : analytics.averageTime < 120 ? 75 : 50} 
                            className="h-2" 
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Eye className="h-5 w-5" />
                          Recomendações
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analytics.successRate > 90 && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="text-sm font-medium text-yellow-800">Considere aumentar a dificuldade</div>
                              <div className="text-xs text-yellow-600 mt-1">Taxa de acerto muito alta pode indicar que o caso está fácil demais</div>
                            </div>
                          )}
                          
                          {analytics.successRate < 30 && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="text-sm font-medium text-red-800">Revisar dificuldade ou clareza</div>
                              <div className="text-xs text-red-600 mt-1">Taxa de acerto baixa pode indicar problema na questão</div>
                            </div>
                          )}
                          
                          {analytics.totalAttempts < 5 && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="text-sm font-medium text-blue-800">Promover mais engajamento</div>
                              <div className="text-xs text-blue-600 mt-1">Poucos usuários tentaram este caso</div>
                            </div>
                          )}
                          
                          {analytics.averageTime > 180 && (
                            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                              <div className="text-sm font-medium text-purple-800">Simplificar ou adicionar dicas</div>
                              <div className="text-xs text-purple-600 mt-1">Tempo médio alto pode indicar complexidade excessiva</div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={onClose}>
                Fechar Analytics
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
