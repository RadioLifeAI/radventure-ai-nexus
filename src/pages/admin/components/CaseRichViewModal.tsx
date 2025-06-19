
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
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/Loader";
import { 
  Eye, 
  FileText, 
  Settings, 
  Edit,
  Copy,
  Calendar,
  User,
  Target,
  Brain,
  Clock,
  Award,
  Image as ImageIcon,
  BarChart,
  Wand2,
  GitCompare,
  Zap
} from "lucide-react";

interface CaseRichViewModalProps {
  open: boolean;
  onClose: () => void;
  caseId: string | null;
  onEdit: (caseId: string) => void;
  onDuplicate: (caseId: string) => void;
  onAnalytics?: (caseId: string) => void;
  onWizardEdit?: (caseId: string) => void;
  onVersionComparison?: (caseId: string) => void;
}

export function CaseRichViewModal({ 
  open, 
  onClose, 
  caseId, 
  onEdit, 
  onDuplicate,
  onAnalytics,
  onWizardEdit,
  onVersionComparison
}: CaseRichViewModalProps) {
  const [loading, setLoading] = useState(false);
  const [caseData, setCaseData] = useState<any>(null);

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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Visualização Completa do Caso
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader />
          </div>
        ) : caseData ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{caseData.title}</h2>
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
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Criado em</div>
                  <div className="font-medium">{new Date(caseData.created_at).toLocaleDateString('pt-BR')}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Atualizado</div>
                  <div className="font-medium">{new Date(caseData.updated_at).toLocaleDateString('pt-BR')}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Número</div>
                  <div className="font-medium">#{caseData.case_number || 'N/A'}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Fonte</div>
                  <div className="font-medium">{caseData.is_radiopaedia_case ? 'Radiopaedia' : 'Próprio'}</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => onEdit(caseId!)}>
                <Zap className="h-4 w-4 mr-2" />
                Edição Rápida
              </Button>
              {onWizardEdit && (
                <Button variant="outline" onClick={() => onWizardEdit(caseId!)}>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Editor Wizard
                </Button>
              )}
              <Button variant="outline" onClick={() => onDuplicate(caseId!)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar Caso
              </Button>
              {onAnalytics && (
                <Button variant="outline" onClick={() => onAnalytics(caseId!)}>
                  <BarChart className="h-4 w-4 mr-2" />
                  Ver Analytics
                </Button>
              )}
              {onVersionComparison && (
                <Button variant="outline" onClick={() => onVersionComparison(caseId!)}>
                  <GitCompare className="h-4 w-4 mr-2" />
                  Comparar Versões
                </Button>
              )}
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="content">Conteúdo</TabsTrigger>
                <TabsTrigger value="settings">Configurações</TabsTrigger>
                <TabsTrigger value="metadata">Metadados</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informações do Paciente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Idade</label>
                        <p className="text-sm">{caseData.patient_age || "Não informado"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Gênero</label>
                        <p className="text-sm">{caseData.patient_gender || "Não informado"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Informações Clínicas</label>
                        <p className="text-sm">{caseData.patient_clinical_info || "Não informado"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Resumo do Caso
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Pergunta Principal</label>
                        <p className="text-sm">{caseData.main_question || "Não informado"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Achados</label>
                        <p className="text-sm line-clamp-3">{caseData.findings || "Não informado"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pergunta e Alternativas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Pergunta</label>
                      <p className="text-sm mt-1">{caseData.main_question}</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-600">Alternativas</label>
                      {caseData.answer_options?.map((option: string, index: number) => (
                        <div key={index} className={`p-3 rounded-lg border ${
                          index === caseData.correct_answer_index ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                        }`}>
                          <div className="flex items-start gap-3">
                            <Badge variant={index === caseData.correct_answer_index ? "default" : "outline"}>
                              {String.fromCharCode(65 + index)}
                            </Badge>
                            <div className="flex-1">
                              <p className="text-sm">{option}</p>
                              {caseData.answer_feedbacks?.[index] && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {caseData.answer_feedbacks[index]}
                                </p>
                              )}
                            </div>
                            {index === caseData.correct_answer_index && (
                              <Badge className="bg-green-100 text-green-700">Correta</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {caseData.explanation && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Explicação</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{caseData.explanation}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Configurações do Caso
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Pode pular</label>
                        <p className="text-sm">{caseData.can_skip ? "Sim" : "Não"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Max. eliminações</label>
                        <p className="text-sm">{caseData.max_elimination || 0}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Dica de IA</label>
                        <p className="text-sm">{caseData.ai_hint_enabled ? "Habilitada" : "Desabilitada"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nível de IA</label>
                        <p className="text-sm">{caseData.ai_tutor_level || "Desligado"}</p>
                      </div>
                    </div>
                    
                    {caseData.manual_hint && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Dica Manual</label>
                        <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">{caseData.manual_hint}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="metadata" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Técnicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">ID do Caso</label>
                        <p className="text-xs font-mono bg-gray-100 p-2 rounded">{caseData.id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Categoria ID</label>
                        <p className="text-sm">{caseData.category_id || "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Criado por</label>
                        <p className="text-sm">{caseData.created_by || "Sistema"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Autor</label>
                        <p className="text-sm">{caseData.author_id || "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Actions */}
            <div className="flex items-center justify-end pt-4 border-t">
              <Button onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Caso não encontrado</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
