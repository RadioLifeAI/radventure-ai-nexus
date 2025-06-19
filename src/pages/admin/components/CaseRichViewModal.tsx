
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/Loader";
import { 
  Eye,
  Target,
  Brain,
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Calendar,
  Award,
  BookOpen,
  Activity,
  BarChart3,
  Image as ImageIcon,
  Edit,
  Copy,
  Share2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CaseRichViewModalProps {
  open: boolean;
  onClose: () => void;
  caseId: string | null;
  onEdit?: (caseId: string) => void;
  onDuplicate?: (caseId: string) => void;
}

export function CaseRichViewModal({ 
  open, 
  onClose, 
  caseId, 
  onEdit, 
  onDuplicate 
}: CaseRichViewModalProps) {
  const [loading, setLoading] = useState(false);
  const [caseData, setCaseData] = useState<any>(null);

  // Métricas simuladas (em produção viria do banco)
  const [metrics] = useState({
    totalViews: Math.floor(Math.random() * 500) + 50,
    totalAttempts: Math.floor(Math.random() * 300) + 25,
    averageTime: Math.floor(Math.random() * 8) + 2,
    successRate: Math.floor(Math.random() * 40) + 60,
    popularityRank: Math.floor(Math.random() * 10) + 1,
    lastWeekViews: Math.floor(Math.random() * 50) + 10,
    averageRating: (Math.random() * 2 + 3).toFixed(1),
    helpUsageRate: Math.floor(Math.random() * 30) + 10
  });

  useEffect(() => {
    if (open && caseId) {
      loadCaseData();
    }
  }, [open, caseId]);

  const loadCaseData = async () => {
    if (!caseId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("medical_cases")
        .select("*")
        .eq("id", caseId)
        .single();

      if (error) throw error;
      setCaseData(data);
    } catch (error: any) {
      console.error("Erro ao carregar caso:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level: number) => {
    const colors = {
      1: "bg-green-100 text-green-700 border-green-200",
      2: "bg-yellow-100 text-yellow-700 border-yellow-200",
      3: "bg-orange-100 text-orange-700 border-orange-200",
      4: "bg-red-100 text-red-700 border-red-200",
      5: "bg-purple-100 text-purple-700 border-purple-200"
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-200";
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
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Visualização Rica do Caso
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : caseData ? (
          <div className="space-y-6">
            {/* Header com informações principais */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">{caseData.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    Criado em {format(new Date(caseData.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit?.(caseId!)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDuplicate?.(caseId!)}>
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Compartilhar
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary">{caseData.specialty}</Badge>
                <Badge variant="outline">{caseData.modality}</Badge>
                <Badge className={getDifficultyColor(caseData.difficulty_level)}>
                  <Brain className="h-3 w-3 mr-1" />
                  {getDifficultyLabel(caseData.difficulty_level)}
                </Badge>
                <Badge variant="secondary">
                  <Target className="h-3 w-3 mr-1" />
                  {caseData.points} pontos
                </Badge>
                {caseData.is_radiopaedia_case && (
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    Radiopaedia
                  </Badge>
                )}
              </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="content">Conteúdo</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Métricas rápidas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Eye className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Visualizações</p>
                          <p className="text-xl font-bold">{metrics.totalViews}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Taxa de Acerto</p>
                          <p className="text-xl font-bold">{metrics.successRate}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg">
                          <Clock className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Tempo Médio</p>
                          <p className="text-xl font-bold">{metrics.averageTime}min</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <Award className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Popularidade</p>
                          <p className="text-xl font-bold">#{metrics.popularityRank}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Status e informações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Activity className="h-5 w-5" />
                        Status do Caso
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <Badge variant="secondary">Publicado</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Última atualização</span>
                        <span className="text-sm">{format(new Date(caseData.updated_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Avaliação média</span>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{metrics.averageRating}/5</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Uso de ajudas</span>
                        <span className="text-sm">{metrics.helpUsageRate}%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5" />
                        Tendências
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Popularidade esta semana</span>
                          <span className="text-sm font-medium">+{metrics.lastWeekViews}</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Performance vs média</span>
                          <span className="text-sm font-medium text-green-600">+12%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Engajamento</span>
                          <span className="text-sm font-medium">Alto</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Conteúdo Principal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Pergunta Principal:</p>
                        <p className="text-sm bg-gray-50 p-3 rounded">{caseData.main_question || "Não definida"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Achados:</p>
                        <p className="text-sm bg-gray-50 p-3 rounded">{caseData.findings || "Não definidos"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Informações Clínicas:</p>
                        <p className="text-sm bg-gray-50 p-3 rounded">{caseData.patient_clinical_info || "Não definidas"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Imagens e Recursos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {caseData.image_url && Array.isArray(caseData.image_url) && caseData.image_url.length > 0 ? (
                          caseData.image_url.slice(0, 4).map((img: any, index: number) => (
                            <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              <img 
                                src={img.url || img} 
                                alt={`Imagem ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">Nenhuma imagem</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        {caseData.image_url && Array.isArray(caseData.image_url) ? 
                          `${caseData.image_url.length} imagem(ns) anexada(s)` : 
                          "Nenhuma imagem anexada"
                        }
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Alternativas de resposta */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Alternativas de Resposta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {caseData.answer_options && caseData.answer_options.map((option: string, index: number) => (
                        <div key={index} className={`p-3 rounded-lg border ${
                          index === caseData.correct_answer_index 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                              index === caseData.correct_answer_index
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-300 text-gray-700'
                            }`}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span className="flex-1">{option}</span>
                            {index === caseData.correct_answer_index && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <BarChart3 className="h-5 w-5" />
                        Métricas Detalhadas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total de tentativas</span>
                          <span className="font-medium">{metrics.totalAttempts}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Visualizações únicas</span>
                          <span className="font-medium">{Math.floor(metrics.totalViews * 0.8)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Taxa de abandono</span>
                          <span className="font-medium">{Math.floor(Math.random() * 20 + 5)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Tempo médio na tela</span>
                          <span className="font-medium">{Math.floor(Math.random() * 3 + 2)}min</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="h-5 w-5" />
                        Demografia dos Usuários
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Estudantes</span>
                            <span className="text-sm font-medium">65%</span>
                          </div>
                          <Progress value={65} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Residentes</span>
                            <span className="text-sm font-medium">25%</span>
                          </div>
                          <Progress value={25} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Especialistas</span>
                            <span className="text-sm font-medium">10%</span>
                          </div>
                          <Progress value={10} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5" />
                        Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {metrics.successRate}%
                        </div>
                        <p className="text-sm text-gray-600">Taxa de acerto geral</p>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Vs média da categoria</span>
                          <span className="text-sm font-medium text-green-600">+8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Ranking geral</span>
                          <span className="text-sm font-medium">#{metrics.popularityRank}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Preview do Caso (Visão do Usuário)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="text-center text-gray-500">
                        <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium mb-2">Preview Interativo</p>
                        <p className="text-sm">Esta seção mostraria uma prévia de como o caso aparece para os usuários</p>
                        <p className="text-sm mt-2">Incluindo: layout do quiz, imagens, alternativas e interface de resolução</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Caso não encontrado</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
