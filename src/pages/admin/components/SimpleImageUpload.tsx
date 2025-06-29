
import React, { useCallback, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Settings,
  FolderTree,
  Eye,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCaseImageIntegration } from "@/hooks/useCaseImageIntegration";
import { UnifiedImageSystemTabs } from "./UnifiedImageSystemTabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SimpleImageUploadProps {
  caseId?: string;
  categoryId?: number;
  modality?: string;
  onImagesChange?: (images: any[]) => void;
  className?: string;
}

export function SimpleImageUpload({
  caseId,
  categoryId,
  modality,
  onImagesChange,
  className
}: SimpleImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editingLegend, setEditingLegend] = useState<string | null>(null);

  const imageIntegration = useCaseImageIntegration({
    caseId,
    categoryId,
    modality
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        await imageIntegration.handleImageUpload(file);
        // Notificar mudanças para o componente pai
        onImagesChange?.(imageIntegration.images);
      }
    }
  }, [imageIntegration, onImagesChange]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await imageIntegration.handleImageUpload(file);
      // Notificar mudanças para o componente pai
      onImagesChange?.(imageIntegration.images);
    }
  }, [imageIntegration, onImagesChange]);

  const handleRemoveImage = useCallback((imageId: string) => {
    imageIntegration.removeImage(imageId);
    // Notificar mudanças para o componente pai
    onImagesChange?.(imageIntegration.images);
  }, [imageIntegration, onImagesChange]);

  const updateImageLegend = useCallback(async (imageId: string, legend: string) => {
    // Aqui você implementaria a atualização da legenda
    // Por enquanto, vamos apenas fechar o editor
    setEditingLegend(null);
  }, []);

  // Notificar mudanças sempre que as imagens mudarem
  React.useEffect(() => {
    onImagesChange?.(imageIntegration.images);
  }, [imageIntegration.images, onImagesChange]);

  const isConfigured = imageIntegration.isIntegrated;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Status da Integração */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
            <FolderTree className="h-4 w-4" />
            Status da Integração
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-medium">Categoria:</span>{" "}
              <Badge variant="outline" className="ml-1">
                {categoryId ? "✅ Configurada" : "⚠️ Pendente"}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Modalidade:</span>{" "}
              <Badge variant="outline" className="ml-1">
                {modality ? "✅ Configurada" : "⚠️ Pendente"}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Integração:</span>{" "}
              <Badge variant={isConfigured ? "default" : "secondary"} className="ml-1">
                {isConfigured ? "✅ Ativa" : "⚠️ Aguardando"}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Imagens:</span>{" "}
              <Badge variant="outline" className="ml-1">
                {imageIntegration.images.length} preparadas
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isConfigured ? (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="text-center text-yellow-800">
              <div className="mb-2">⚠️ <strong>Configuração Necessária</strong></div>
              <p className="text-sm">
                Configure <strong>categoria</strong> e <strong>modalidade</strong> na aba "Informações Básicas" 
                para ativar o upload integrado.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Área de Upload */}
          <Card>
            <CardContent className="pt-6">
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                  dragActive 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
                  imageIntegration.uploading && "opacity-50 pointer-events-none"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={imageIntegration.uploading}
                />
                
                <div className="space-y-3">
                  {imageIntegration.uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-blue-600">Processando imagem...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-gray-600 font-medium">
                          Arraste uma imagem aqui ou clique para selecionar
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          PNG, JPG até 10MB
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Galeria de Imagens */}
          {imageIntegration.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Imagens ({imageIntegration.images.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imageIntegration.images.map((image, index) => (
                    <div key={image.id || index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image.original_url}
                          alt={image.legend || `Imagem ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Overlay com ações */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => window.open(image.original_url, '_blank')}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveImage(image.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Legenda editável */}
                      <div className="mt-2">
                        {editingLegend === image.id ? (
                          <Input
                            defaultValue={image.legend || ""}
                            placeholder="Digite uma legenda..."
                            className="text-xs"
                            onBlur={(e) => {
                              updateImageLegend(image.id, e.target.value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateImageLegend(image.id, e.currentTarget.value);
                              }
                              if (e.key === 'Escape') {
                                setEditingLegend(null);
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <p 
                            className="text-xs text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
                            onClick={() => setEditingLegend(image.id)}
                          >
                            {image.legend || "Clique para adicionar legenda..."}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Botão Opções Avançadas */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(true)}
          className="text-xs"
        >
          <Settings className="h-3 w-3 mr-2" />
          Opções Avançadas
        </Button>
      </div>

      {/* Modal Opções Avançadas */}
      <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Opções Avançadas de Upload</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <UnifiedImageSystemTabs
              caseId={caseId}
              categoryId={categoryId}
              modality={modality}
              onImagesChange={onImagesChange}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
