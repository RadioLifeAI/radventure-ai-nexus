
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Zap, 
  FileImage, 
  Settings, 
  TestTube,
  Archive,
  Image as ImageIcon,
  Stethoscope,
  FolderTree,
  Sparkles
} from 'lucide-react';
import { ImageEditorModal } from '../image-editor/ImageEditorModal';
import { MedicalStackViewer } from '../image-viewer/MedicalStackViewer';
import { ZipProcessor } from '../upload/ZipProcessor';
import { EnhancedImageUpload } from '../../pages/admin/components/EnhancedImageUpload';
import { useSpecializedImageUpload } from '@/hooks/useSpecializedImageUpload';

interface AdvancedUploadTabSpecializedProps {
  caseId?: string;
  categoryId?: number;
  modality?: string;
  onImagesChange?: (images: any[]) => void;
}

interface ExtractedImage {
  name: string;
  file: File;
  order: number;
  size: string;
}

export function AdvancedUploadTabSpecialized({ 
  caseId, 
  categoryId, 
  modality,
  onImagesChange 
}: AdvancedUploadTabSpecializedProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [extractedImages, setExtractedImages] = useState<ExtractedImage[]>([]);
  const [previewImages, setPreviewImages] = useState<any[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<string>('geral');
  
  const { uploading, processing, uploadSpecializedImage, processZipSpecialized } = useSpecializedImageUpload();

  const templates = {
    geral: {
      name: 'Geral',
      icon: FileImage,
      description: 'Upload padrão para qualquer tipo de imagem médica',
      settings: { maxFiles: 10, requireLegend: false }
    },
    rx: {
      name: 'Raio-X',
      icon: Stethoscope,
      description: 'Otimizado para radiografias simples',
      settings: { maxFiles: 4, requireLegend: true, suggestedFormat: '1:1' }
    },
    tc: {
      name: 'Tomografia',
      icon: Archive,
      description: 'Pilha de imagens sequenciais (DICOM/ZIP)',
      settings: { maxFiles: 200, requireOrder: true, stackMode: true }
    },
    rm: {
      name: 'Ressonância',
      icon: Archive,
      description: 'Múltiplas sequências e cortes',
      settings: { maxFiles: 100, requireOrder: true, stackMode: true }
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setShowImageEditor(true);
  };

  const handleImageEdited = async (editedFile: File) => {
    const result = await uploadSpecializedImage(editedFile, {
      caseId,
      categoryId,
      modality,
      legend: `Imagem editada - ${editedFile.name}`
    });
    
    if (result && onImagesChange) {
      onImagesChange([result]);
    }
    
    setSelectedFile(null);
  };

  const handleZipExtracted = (images: ExtractedImage[]) => {
    setExtractedImages(images);
    
    // Converter para formato compatível com o viewer
    const viewerImages = images.map((img, index) => ({
      id: `temp_${index}`,
      url: URL.createObjectURL(img.file),
      legend: `Imagem ${img.order} - ${img.name}`,
      sequence_order: img.order
    }));
    
    setPreviewImages(viewerImages);
  };

  const handleZipError = (error: string) => {
    console.error('Erro no ZIP:', error);
  };

  const handleUploadBatch = async () => {
    if (extractedImages.length === 0) return;
    
    console.log('Fazendo upload em lote especializado de', extractedImages.length, 'imagens');
    
    const results = [];
    for (const image of extractedImages) {
      const result = await uploadSpecializedImage(image.file, {
        caseId,
        categoryId,
        modality,
        sequenceOrder: image.order,
        legend: `Batch: ${image.name}`
      });
      
      if (result) results.push(result);
    }
    
    if (results.length > 0 && onImagesChange) {
      onImagesChange(results);
    }
  };

  // Informações da organização atual
  const getOrganizationPreview = () => {
    if (!categoryId && !modality) return 'Selecione categoria e modalidade primeiro';
    
    const parts = [];
    if (categoryId) parts.push(`Cat:${categoryId}`);
    if (modality) parts.push(`Mod:${modality}`);
    
    return `Estrutura: medical-cases/${parts.join('/')}/`;
  };

  return (
    <div className="space-y-6">
      {/* Header com Organização */}
      <Card className="bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-green-600 rounded-xl shadow-lg">
              <FolderTree className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-bold text-purple-800">Sistema Organizacional Especializado</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 font-bold">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AUTO-CLASSIFICAÇÃO
                </Badge>
              </div>
              <p className="text-sm text-purple-600">
                Upload inteligente com organização automática por especialidade médica
              </p>
            </div>
          </CardTitle>
          
          {/* Preview da Organização */}
          <Alert className="bg-white/70">
            <FolderTree className="h-4 w-4" />
            <AlertDescription>
              <strong>Estrutura de Organização:</strong> {getOrganizationPreview()}
            </AlertDescription>
          </Alert>
        </CardHeader>
      </Card>

      {/* Status de Processamento */}
      {(uploading || processing) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div>
                <p className="font-medium text-blue-800">
                  {processing ? '📁 Organizando imagens...' : '📤 Fazendo upload...'}
                </p>
                <p className="text-sm text-blue-600">
                  Sistema de classificação especializada ativo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates por Modalidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Template por Modalidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(templates).map(([key, template]) => {
              const Icon = template.icon;
              return (
                <Button
                  key={key}
                  variant={activeTemplate === key ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => setActiveTemplate(key)}
                >
                  <Icon className="h-6 w-6" />
                  <span className="font-medium">{template.name}</span>
                  <span className="text-xs opacity-75 text-center">
                    {template.description}
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Funcionalidades Especializadas */}
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="editor">Editor Especializado</TabsTrigger>
          <TabsTrigger value="zip">Processador ZIP</TabsTrigger>
          <TabsTrigger value="stack">Visualizador Stack</TabsTrigger>
          <TabsTrigger value="upload">Upload Organizado</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Editor com Organização Automática
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">
                  Selecione uma imagem para editar e organizar
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Crop, ajustes e classificação automática por especialidade
                </p>
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelected(file);
                  }}
                  className="hidden"
                  id="image-edit-upload-specialized"
                />
                
                <Button asChild disabled={uploading || processing}>
                  <label htmlFor="image-edit-upload-specialized" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar para Edição
                  </label>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zip" className="space-y-4">
          <ZipProcessor 
            onImagesExtracted={handleZipExtracted}
            onError={handleZipError}
          />
          
          {extractedImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  Imagens Prontas para Organização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="font-medium">{extractedImages.length} imagens extraídas</span>
                    <p className="text-sm text-gray-600">
                      Serão organizadas automaticamente por especialidade
                    </p>
                  </div>
                  <Button 
                    onClick={handleUploadBatch}
                    disabled={uploading || processing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <FolderTree className="h-4 w-4 mr-2" />
                    Organizar Todas
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stack" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Visualizador Stack Organizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              {previewImages.length > 0 ? (
                <MedicalStackViewer 
                  images={previewImages}
                  onImageChange={(index) => console.log('Imagem ativa:', index)}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Processe um ZIP primeiro para visualizar o stack organizado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Upload com Organização Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedImageUpload 
                caseId={caseId}
                onChange={onImagesChange}
              />
              
              <Alert className="mt-4">
                <FolderTree className="h-4 w-4" />
                <AlertDescription>
                  <strong>Sistema Ativo:</strong> Todas as imagens serão automaticamente organizadas 
                  na estrutura especializada baseada na categoria e modalidade selecionadas.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal do Editor */}
      {selectedFile && (
        <ImageEditorModal
          open={showImageEditor}
          onClose={() => {
            setShowImageEditor(false);
            setSelectedFile(null);
          }}
          file={selectedFile}
          onSave={handleImageEdited}
        />
      )}
    </div>
  );
}
