
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, ImageIcon, FolderTree } from "lucide-react";

interface CaseFormPreviewModalProps {
  open: boolean;
  onClose: () => void;
  form: any;
  categories: any[];
  difficulties: any[];
  tempImages?: any[];
  specializedImages?: any[];
}

export function CaseFormPreviewModal({
  open,
  onClose,
  form,
  categories,
  difficulties,
  tempImages = [],
  specializedImages = []
}: CaseFormPreviewModalProps) {
  const selectedCategory = categories.find(c => String(c.id) === String(form.category_id));
  const selectedDifficulty = difficulties.find(d => String(d.id) === String(form.difficulty_level));
  
  const totalImages = tempImages.length + specializedImages.length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-6 w-6" />
            Preview do Caso Médico
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Título:</strong> {form.title || "A ser gerado"}
                </div>
                <div>
                  <strong>Número:</strong> {form.case_number || "A ser gerado"}
                </div>
                <div>
                  <strong>Especialidade:</strong> {selectedCategory?.name || "Não definida"}
                </div>
                <div>
                  <strong>Modalidade:</strong> {form.modality || "Não definida"}
                </div>
                <div>
                  <strong>Dificuldade:</strong> {selectedDifficulty?.description || form.difficulty_level}
                </div>
                <div>
                  <strong>Pontos:</strong> {form.points || "Não definido"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados do Paciente */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Paciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Idade:</strong> {form.patient_age || "Não informada"}
                </div>
                <div>
                  <strong>Gênero:</strong> {form.patient_gender || "Não informado"}
                </div>
                <div className="col-span-2">
                  <strong>Duração dos Sintomas:</strong> {form.symptoms_duration || "Não informada"}
                </div>
              </div>
              <div>
                <strong>Informações Clínicas:</strong>
                <p className="text-sm text-gray-600 mt-1">
                  {form.patient_clinical_info || "Não informadas"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Achados */}
          <Card>
            <CardHeader>
              <CardTitle>Achados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {form.findings || "Não informados"}
              </p>
            </CardContent>
          </Card>

          {/* Sistema de Imagens Integrado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5" />
                Sistema de Imagens Integrado
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {totalImages} imagem(ns)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {totalImages === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma imagem adicionada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Imagens Temporárias */}
                  {tempImages.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          Preparadas ({tempImages.length})
                        </Badge>
                        Serão organizadas automaticamente ao salvar
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {tempImages.map((image, index) => (
                          <div key={image.id} className="relative">
                            <img
                              src={image.url}
                              alt={`Imagem preparada ${index + 1}`}
                              className="w-full h-24 object-cover rounded border"
                            />
                            <div className="absolute top-1 right-1">
                              <Badge variant="secondary" className="text-xs">#{index + 1}</Badge>
                            </div>
                            {image.legend && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-1 rounded-b">
                                <p className="text-xs truncate">{image.legend}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Imagens Salvas */}
                  {specializedImages.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Organizadas ({specializedImages.length})
                        </Badge>
                        Salvas no sistema especializado
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {specializedImages.map((image, index) => (
                          <div key={image.id} className="relative">
                            <img
                              src={image.thumbnail_url || image.original_url}
                              alt={`Imagem salva ${index + 1}`}
                              className="w-full h-24 object-cover rounded border"
                            />
                            <div className="absolute top-1 right-1">
                              <Badge variant="secondary" className="text-xs">#{index + 1}</Badge>
                            </div>
                            {image.specialty_code && (
                              <div className="absolute top-1 left-1">
                                <Badge className="bg-green-600 text-white text-xs">
                                  {image.specialty_code}
                                </Badge>
                              </div>
                            )}
                            {image.legend && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-1 rounded-b">
                                <p className="text-xs truncate">{image.legend}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quiz */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong>Pergunta Principal:</strong>
                <p className="text-sm text-gray-600 mt-1">
                  {form.main_question || "Não definida"}
                </p>
              </div>
              
              <div>
                <strong>Alternativas:</strong>
                {form.answer_options && form.answer_options.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-1 space-y-1">
                    {form.answer_options.map((option: string, index: number) => (
                      <li key={index} className={index === form.correct_answer_index ? "font-bold text-green-600" : ""}>
                        {option || `Opção ${index + 1} - Não definida`}
                        {index === form.correct_answer_index && " (Correta)"}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600 mt-1">Não definidas</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Explicação */}
          <Card>
            <CardHeader>
              <CardTitle>Explicação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {form.explanation || "Não definida"}
              </p>
            </CardContent>
          </Card>

          {/* Diagnóstico */}
          {form.primary_diagnosis && (
            <Card>
              <CardHeader>
                <CardTitle>Diagnóstico</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <strong>Diagnóstico Principal:</strong> {form.primary_diagnosis}
                </div>
                {form.cid10_code && (
                  <div className="mt-2">
                    <strong>Código CID-10:</strong> {form.cid10_code}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Referência */}
          {form.is_radiopaedia_case && (
            <Card>
              <CardHeader>
                <CardTitle>Referência</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong>Citação:</strong> {form.reference_citation || "Não informada"}
                </div>
                <div>
                  <strong>URL:</strong> {form.reference_url || "Não informada"}
                </div>
                {form.access_date && (
                  <div>
                    <strong>Data de Acesso:</strong> {form.access_date}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
