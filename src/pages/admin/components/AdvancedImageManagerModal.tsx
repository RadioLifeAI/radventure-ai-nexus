
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Image as ImageIcon, 
  Upload, 
  Edit3, 
  Archive, 
  Layers,
  Sparkles
} from 'lucide-react';
import { ImageEditorModal } from '@/components/image-editor/ImageEditorModal';
import { AdvancedUploadTab } from '@/components/admin/AdvancedUploadTab';
import { ZipProcessor } from '@/components/upload/ZipProcessor';
import { MedicalStackViewer } from '@/components/image-viewer/MedicalStackViewer';

interface AdvancedImageManagerModalProps {
  open: boolean;
  onClose: () => void;
  caseId?: string;
  currentImages?: any[];
  onImagesUpdated?: (images: any[]) => void;
}

export function AdvancedImageManagerModal({
  open,
  onClose,
  caseId,
  currentImages = [],
  onImagesUpdated
}: AdvancedImageManagerModalProps) {
  const [activeTab, setActiveTab] = useState('upload');
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [processedImages, setProcessedImages] = useState<any[]>(currentImages);

  const handleImagesProcessed = (newImages: any[]) => {
    const updatedImages = [...processedImages, ...newImages];
    setProcessedImages(updatedImages);
    onImagesUpdated?.(updatedImages);
  };

  const handleImageEdited = (editedFile: File) => {
    // Convert file to URL for display
    const editedImageUrl = URL.createObjectURL(editedFile);
    const updatedImages = processedImages.map(img => 
      img.url === selectedImageFile?.name 
        ? { ...img, url: editedImageUrl, edited: true }
        : img
    );
    setProcessedImages(updatedImages);
    onImagesUpdated?.(updatedImages);
    setShowImageEditor(false);
    setSelectedImageFile(null);
  };

  const openImageEditor = (imageUrl: string) => {
    // Convert URL back to File for editor
    // For now, we'll create a mock file - in real implementation, you'd fetch the actual file
    fetch(imageUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'image.jpg', { type: blob.type });
        setSelectedImageFile(file);
        setShowImageEditor(true);
      })
      .catch(() => {
        console.warn('Could not convert image to file for editing');
      });
  };

  const handleZipImagesExtracted = (extractedImages: any[]) => {
    // Convert extracted images to the format expected by our system
    const formattedImages = extractedImages.map((img, index) => ({
      url: URL.createObjectURL(img.file),
      legend: img.name,
      order: img.order,
      file: img.file
    }));
    handleImagesProcessed(formattedImages);
  };

  const handleZipError = (error: string) => {
    console.error('ZIP processing error:', error);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 -m-6 mb-6 border-b">
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              Ferramentas Avançadas de Imagem
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                Modo Profissional
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Avançado
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Editor de Imagem
              </TabsTrigger>
              <TabsTrigger value="zip" className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Processador ZIP
              </TabsTrigger>
              <TabsTrigger value="stack" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Visualizador Stack
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Upload com Templates por Modalidade</h3>
                <p className="text-blue-700 text-sm mb-4">
                  Sistema inteligente que adapta o upload baseado na modalidade do caso (TC, RM, RX, etc.)
                </p>
                <AdvancedUploadTab 
                  caseId={caseId}
                  onImagesChange={handleImagesProcessed}
                />
              </div>
            </TabsContent>

            <TabsContent value="editor" className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">Editor Profissional de Imagens</h3>
                <p className="text-green-700 text-sm mb-4">
                  Crop, rotação, brilho, contraste e outras ferramentas profissionais
                </p>
                
                {processedImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {processedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={`Imagem ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                          <Button
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => openImageEditor(image.url)}
                          >
                            <Edit3 className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                        {image.edited && (
                          <Badge className="absolute top-2 right-2 bg-green-500">
                            Editada
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma imagem carregada para edição</p>
                    <p className="text-sm">Use a aba "Upload Avançado" primeiro</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="zip" className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h3 className="font-semibold text-orange-800 mb-2">Processamento Automático de ZIP</h3>
                <p className="text-orange-700 text-sm mb-4">
                  Envie arquivos ZIP com múltiplas imagens e processe automaticamente
                </p>
                <ZipProcessor 
                  onImagesExtracted={handleZipImagesExtracted}
                  onError={handleZipError}
                />
              </div>
            </TabsContent>

            <TabsContent value="stack" className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-2">Visualização em Pilha (Stack)</h3>
                <p className="text-purple-700 text-sm mb-4">
                  Visualize séries de imagens como TC/RM com navegação avançada
                </p>
                
                {processedImages.length > 1 ? (
                  <MedicalStackViewer
                    images={processedImages.map((img, index) => ({
                      id: `${index}`,
                      url: img.url,
                      legend: img.legend || `Imagem ${index + 1}`,
                      sequence_order: index
                    }))}
                    className="h-96"
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Layers className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Carregue múltiplas imagens para visualização em pilha</p>
                    <p className="text-sm">Mínimo 2 imagens necessárias</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              {processedImages.length} imagem(ns) processada(s)
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-700">
                Aplicar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal do Editor de Imagem */}
      {selectedImageFile && (
        <ImageEditorModal
          open={showImageEditor}
          onClose={() => {
            setShowImageEditor(false);
            setSelectedImageFile(null);
          }}
          file={selectedImageFile}
          onSave={handleImageEdited}
        />
      )}
    </>
  );
}
