
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSpecializedCaseImages } from "@/hooks/useSpecializedCaseImages";
import { EnhancedImageUploadSpecialized } from "./EnhancedImageUploadSpecialized";
import { 
  FolderTree,
  Upload,
  Archive,
  Settings,
  Image as ImageIcon,
  Sparkles
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface AdvancedImageManagerModalUnifiedProps {
  open: boolean;
  onClose: () => void;
  caseId?: string;
  categoryId?: number;
  modality?: string;
  currentImages?: string[];
  onImagesUpdated?: (images: string[]) => void;
}

export function AdvancedImageManagerModalUnified({
  open,
  onClose,
  caseId,
  categoryId,
  modality,
  currentImages = [],
  onImagesUpdated
}: AdvancedImageManagerModalUnifiedProps) {
  const [activeTab, setActiveTab] = useState("upload");
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipProcessing, setZipProcessing] = useState(false);

  const { 
    images: specializedImages, 
    uploading, 
    processing, 
    processZipSpecialized 
  } = useSpecializedCaseImages(caseId);

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !caseId) return;

    if (!file.name.toLowerCase().endsWith('.zip')) {
      toast({
        title: "Arquivo inválido",
        description: "Selecione um arquivo ZIP válido.",
        variant: "destructive",
      });
      return;
    }

    setZipFile(file);
    setZipProcessing(true);

    try {
      const result = await processZipSpecialized(file, {
        caseId,
        categoryId,
        modality
      });

      if (result && result.length > 0) {
        toast({
          title: "🗂️ ZIP Processado com Sucesso!",
          description: `${result.length} imagens organizadas no sistema especializado.`
        });
        
        const urls = result.map((img: any) => img.original_url);
        onImagesUpdated?.(urls);
      }
    } catch (error) {
      console.error('Erro no processamento ZIP:', error);
    } finally {
      setZipProcessing(false);
      setZipFile(null);
    }
  };

  const handleImagesChange = (images: any[]) => {
    const urls = images.map(img => img.original_url);
    onImagesUpdated?.(urls);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 -m-6 mb-6 border-b">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-green-100 rounded-lg">
              <FolderTree className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <span className="text-green-800">Ferramentas Especializadas Unificadas</span>
              <div className="text-sm text-green-600 font-normal mt-1">
                Sistema único de organização automática por especialidade e modalidade
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700 ml-auto">
              <Sparkles className="h-3 w-3 mr-1" />
              {specializedImages.length} imagem(ns) organizadas
            </Badge>
          </DialogTitle>

          {categoryId && modality && (
            <div className="mt-3 p-3 bg-green-100 border border-green-200 rounded-lg">
              <div className="text-sm text-green-800">
                <strong>Organização Atual:</strong> Especialidade #{categoryId} → {modality}
              </div>
              <div className="text-xs text-green-600 mt-1">
                📁 Estrutura: /medical-cases/specialty-{categoryId}/{modality.toLowerCase()}/
              </div>
            </div>
          )}
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Especializado
            </TabsTrigger>
            <TabsTrigger value="zip" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Processamento ZIP
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Gerenciamento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <EnhancedImageUploadSpecialized
              caseId={caseId}
              categoryId={categoryId}
              modality={modality}
              onChange={handleImagesChange}
            />
          </TabsContent>

          <TabsContent value="zip" className="space-y-4">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Archive className="h-5 w-5" />
                  Processamento ZIP Especializado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-blue-700">
                  <p>• Extrai automaticamente todas as imagens do ZIP</p>
                  <p>• Organiza por especialidade e modalidade</p>
                  <p>• Processa múltiplos formatos simultaneamente</p>
                  <p>• Aplica compressão e otimização automática</p>
                </div>

                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
                  <Archive className="h-10 w-10 mx-auto mb-4 text-blue-500" />
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleZipUpload}
                    disabled={zipProcessing || !caseId}
                    className="hidden"
                    id="zip-upload"
                  />
                  <label
                    htmlFor="zip-upload"
                    className={`cursor-pointer ${!caseId ? 'opacity-50' : ''}`}
                  >
                    <Button
                      type="button"
                      disabled={zipProcessing || !caseId}
                      className="mb-2"
                    >
                      {zipProcessing ? "Processando..." : "Selecionar Arquivo ZIP"}
                    </Button>
                    <p className="text-sm text-blue-600">
                      Clique para selecionar um arquivo ZIP com imagens médicas
                    </p>
                  </label>
                </div>

                {zipProcessing && (
                  <div className="bg-blue-100 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="font-medium">Processando ZIP especializado...</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      Extraindo, organizando e otimizando imagens automaticamente
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Gerenciamento de Imagens Especializadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-green-800">{specializedImages.length}</div>
                    <div className="text-sm text-green-600">Imagens Organizadas</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <FolderTree className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-800">
                      {specializedImages.filter(img => img.processing_status === 'completed').length}
                    </div>
                    <div className="text-sm text-blue-600">Processadas</div>
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Archive className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                    <div className="text-2xl font-bold text-yellow-800">
                      {specializedImages.filter(img => img.processing_status === 'processing').length}
                    </div>
                    <div className="text-sm text-yellow-600">Em Processo</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold text-purple-800">
                      {specializedImages.filter(img => img.specialty_code && img.modality_prefix).length}
                    </div>
                    <div className="text-sm text-purple-600">Especializadas</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Status do Sistema Especializado</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Sistema Unificado:</span>
                      <Badge variant="default" className="bg-green-600">Ativo</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Organização Automática:</span>
                      <Badge variant="default" className="bg-blue-600">Funcionando</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Processamento ZIP:</span>
                      <Badge variant="default" className="bg-purple-600">Disponível</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Upload Individual:</span>
                      <Badge variant="default" className="bg-indigo-600">Disponível</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {uploading || processing ? (
              <span className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Sistema especializado processando...
              </span>
            ) : (
              <span>✅ Sistema especializado pronto</span>
            )}
          </div>
          
          <Button onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
