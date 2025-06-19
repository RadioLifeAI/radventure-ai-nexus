
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/Loader";
import { 
  GitCompare,
  Clock,
  User,
  Plus,
  Minus,
  Edit,
  RotateCcw,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from "lucide-react";

interface CaseVersionComparisonModalProps {
  open: boolean;
  onClose: () => void;
  caseId: string | null;
  onRestore?: (versionData: any) => void;
}

interface CaseVersion {
  id: string;
  version: number;
  changes: any;
  changed_by: string;
  created_at: string;
  change_summary: string;
  full_data: any;
}

export function CaseVersionComparisonModal({ open, onClose, caseId, onRestore }: CaseVersionComparisonModalProps) {
  const [loading, setLoading] = useState(false);
  const [currentCase, setCurrentCase] = useState<any>(null);
  const [versions, setVersions] = useState<CaseVersion[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<[number, number]>([0, 1]);
  const [comparisonData, setComparisonData] = useState<any>(null);

  useEffect(() => {
    if (open && caseId) {
      loadCaseVersions();
    }
  }, [open, caseId]);

  useEffect(() => {
    if (versions.length >= 2) {
      generateComparison();
    }
  }, [selectedVersions, versions]);

  const loadCaseVersions = async () => {
    if (!caseId) return;
    
    setLoading(true);
    try {
      // Carregar caso atual
      const { data: caseData, error: caseError } = await supabase
        .from("medical_cases")
        .select("*")
        .eq("id", caseId)
        .single();

      if (caseError) throw caseError;
      setCurrentCase(caseData);

      // Simular versões do caso (em uma implementação real, isso viria de uma tabela de histórico)
      const mockVersions: CaseVersion[] = [
        {
          id: "current",
          version: 0,
          changes: {},
          changed_by: "current",
          created_at: caseData.updated_at,
          change_summary: "Versão atual",
          full_data: caseData
        },
        {
          id: "v1", 
          version: 1,
          changes: { title: "old_title", difficulty_level: 2 },
          changed_by: "admin@example.com",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          change_summary: "Ajuste de dificuldade e título",
          full_data: { ...caseData, title: "Título anterior", difficulty_level: 2 }
        },
        {
          id: "v2",
          version: 2, 
          changes: { specialty: "old_specialty", points: 15 },
          changed_by: "editor@example.com",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          change_summary: "Mudança de especialidade e pontuação",
          full_data: { ...caseData, specialty: "Cardiologia", points: 15 }
        },
        {
          id: "v3",
          version: 3,
          changes: { explanation: "old_explanation" },
          changed_by: "content@example.com", 
          created_at: new Date(Date.now() - 259200000).toISOString(),
          change_summary: "Revisão da explicação",
          full_data: { ...caseData, explanation: "Explicação anterior mais curta" }
        }
      ];

      setVersions(mockVersions);
    } catch (error: any) {
      console.error("Erro ao carregar versões:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateComparison = () => {
    if (versions.length < 2) return;

    const [leftIndex, rightIndex] = selectedVersions;
    const leftVersion = versions[leftIndex];
    const rightVersion = versions[rightIndex];

    if (!leftVersion || !rightVersion) return;

    const changes = compareVersions(leftVersion.full_data, rightVersion.full_data);
    setComparisonData({
      left: leftVersion,
      right: rightVersion,
      changes
    });
  };

  const compareVersions = (version1: any, version2: any) => {
    const changes: any = {};
    const fields = [
      'title', 'specialty', 'modality', 'difficulty_level', 'points',
      'patient_age', 'patient_gender', 'patient_clinical_info', 'findings',
      'main_question', 'explanation', 'manual_hint'
    ];

    fields.forEach(field => {
      const val1 = version1[field];
      const val2 = version2[field];
      
      if (val1 !== val2) {
        changes[field] = {
          from: val1,
          to: val2,
          type: !val1 ? 'added' : !val2 ? 'removed' : 'modified'
        };
      }
    });

    return changes;
  };

  const handleRestore = (version: CaseVersion) => {
    if (onRestore) {
      onRestore(version.full_data);
    }
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'added':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'removed':
        return <Minus className="h-4 w-4 text-red-600" />;
      case 'modified':
        return <Edit className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'added':
        return "bg-green-50 border-green-200";
      case 'removed':
        return "bg-red-50 border-red-200";
      case 'modified':
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const formatFieldName = (field: string) => {
    const fieldNames: { [key: string]: string } = {
      title: "Título",
      specialty: "Especialidade",
      modality: "Modalidade",
      difficulty_level: "Dificuldade",
      points: "Pontos",
      patient_age: "Idade do Paciente",
      patient_gender: "Gênero do Paciente",
      patient_clinical_info: "Informações Clínicas",
      findings: "Achados",
      main_question: "Pergunta Principal",
      explanation: "Explicação",
      manual_hint: "Dica Manual"
    };
    return fieldNames[field] || field;
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-purple-600" />
            Comparação de Versões do Caso
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Seleção de Versões */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Versão Base</label>
                <select
                  value={selectedVersions[0]}
                  onChange={(e) => setSelectedVersions([Number(e.target.value), selectedVersions[1]])}
                  className="w-full p-2 border rounded-md"
                >
                  {versions.map((version, index) => (
                    <option key={version.id} value={index}>
                      {version.version === 0 ? "Atual" : `v${version.version}`} - {version.change_summary}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Comparar com</label>
                <select
                  value={selectedVersions[1]}
                  onChange={(e) => setSelectedVersions([selectedVersions[0], Number(e.target.value)])}
                  className="w-full p-2 border rounded-md"
                >
                  {versions.map((version, index) => (
                    <option key={version.id} value={index}>
                      {version.version === 0 ? "Atual" : `v${version.version}`} - {version.change_summary}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {comparisonData && (
              <Tabs defaultValue="diff" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="diff" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Diferenças
                  </TabsTrigger>
                  <TabsTrigger value="side-by-side" className="flex items-center gap-2">
                    <GitCompare className="h-4 w-4" />
                    Lado a Lado
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Histórico
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="diff" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5" />
                        Mudanças Detectadas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Object.keys(comparisonData.changes).length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                          <p>Nenhuma diferença encontrada entre as versões selecionadas</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {Object.entries(comparisonData.changes).map(([field, change]: [string, any]) => (
                            <div key={field} className={`p-4 rounded-lg border ${getChangeTypeColor(change.type)}`}>
                              <div className="flex items-start gap-3">
                                {getChangeTypeIcon(change.type)}
                                <div className="flex-1">
                                  <div className="font-medium mb-2">{formatFieldName(field)}</div>
                                  
                                  {change.type === 'modified' && (
                                    <div className="space-y-2">
                                      <div className="p-2 bg-red-50 border border-red-200 rounded">
                                        <div className="text-xs text-red-600 font-medium mb-1">Anterior:</div>
                                        <div className="text-sm">{change.from || "(vazio)"}</div>
                                      </div>
                                      <div className="p-2 bg-green-50 border border-green-200 rounded">
                                        <div className="text-xs text-green-600 font-medium mb-1">Atual:</div>
                                        <div className="text-sm">{change.to || "(vazio)"}</div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {change.type === 'added' && (
                                    <div className="p-2 bg-green-50 border border-green-200 rounded">
                                      <div className="text-xs text-green-600 font-medium mb-1">Adicionado:</div>
                                      <div className="text-sm">{change.to}</div>
                                    </div>
                                  )}
                                  
                                  {change.type === 'removed' && (
                                    <div className="p-2 bg-red-50 border border-red-200 rounded">
                                      <div className="text-xs text-red-600 font-medium mb-1">Removido:</div>
                                      <div className="text-sm">{change.from}</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="side-by-side" className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>
                            {comparisonData.left.version === 0 ? "Versão Atual" : `Versão ${comparisonData.left.version}`}
                          </span>
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(comparisonData.left.created_at).toLocaleDateString('pt-BR')}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-96">
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-600">Título</label>
                              <p className="text-sm">{comparisonData.left.full_data.title}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Especialidade</label>
                              <p className="text-sm">{comparisonData.left.full_data.specialty}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Dificuldade</label>
                              <p className="text-sm">{comparisonData.left.full_data.difficulty_level}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Pontos</label>
                              <p className="text-sm">{comparisonData.left.full_data.points}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Explicação</label>
                              <p className="text-sm">{comparisonData.left.full_data.explanation || "(não informado)"}</p>
                            </div>
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>
                            {comparisonData.right.version === 0 ? "Versão Atual" : `Versão ${comparisonData.right.version}`}
                          </span>
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(comparisonData.right.created_at).toLocaleDateString('pt-BR')}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-96">
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-600">Título</label>
                              <p className="text-sm">{comparisonData.right.full_data.title}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Especialidade</label>
                              <p className="text-sm">{comparisonData.right.full_data.specialty}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Dificuldade</label>
                              <p className="text-sm">{comparisonData.right.full_data.difficulty_level}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Pontos</label>
                              <p className="text-sm">{comparisonData.right.full_data.points}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Explicação</label>
                              <p className="text-sm">{comparisonData.right.full_data.explanation || "(não informado)"}</p>
                            </div>
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Histórico de Modificações
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {versions.map((version, index) => (
                          <div key={version.id} className="flex items-start gap-4 p-4 border rounded-lg">
                            <div className={`w-3 h-3 rounded-full mt-2 ${
                              version.version === 0 ? 'bg-green-500' : 'bg-blue-500'
                            }`} />
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">
                                  {version.version === 0 ? "Versão Atual" : `Versão ${version.version}`}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    <User className="h-3 w-3 mr-1" />
                                    {version.changed_by}
                                  </Badge>
                                  <Badge variant="outline">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(version.created_at).toLocaleDateString('pt-BR')}
                                  </Badge>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-3">{version.change_summary}</p>
                              
                              {version.version !== 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRestore(version)}
                                  className="flex items-center gap-2"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                  Restaurar esta versão
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={onClose}>
                Fechar Comparação
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
