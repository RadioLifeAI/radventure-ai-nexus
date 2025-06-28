
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
  Stethoscope
} from 'lucide-react';
import { ImageEditorModal } from '../image-editor/ImageEditorModal';
import { MedicalStackViewer } from '../image-viewer/MedicalStackViewer';
import { ZipProcessor } from '../upload/ZipProcessor';
import { EnhancedImageUpload } from '../../pages/admin/components/EnhancedImageUpload';

interface AdvancedUploadTabProps {
  caseId?: string;
  onImagesChange?: (images: any[]) => void;
}

interface ExtractedImage {
  name: string;
  file: File;
  order: number;
  size: string;
}

export function AdvancedUploadTab({ caseId, onImagesChange }: AdvancedUploadTabProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [extractedImages, setExtractedImages] = useState<ExtractedImage[]>([]);
  const [previewImages, setPreviewImages] = useState<any[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<string>('geral');

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

  const handleImageEdited = (editedFile: File) => {
    // Aqui você integraria com o sistema de upload existente
    console.log('Imagem editada:', editedFile);
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
    
    // Aqui você integraria com o sistema de upload do Supabase
    console.log('Fazendo upload em lote de', extractedImages.length, 'imagens');
    
    for (const image of extractedImages) {
      // Upload individual usando o sistema existente
      console.log('Upload:', image.name, 'Ordem:', image.order);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-6 w-6 text-purple-600" />
            Upload Avançado
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              Experimental
            </Badge>
          </CardTitle>
          <p className="text-sm text-purple-700">
            Ferramentas profissionais para upload e processamento de imagens médicas
          </p>
        </CardHeader>
      </Card>

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
          
          <Alert className="mt-4">
            <AlertDescription>
              <strong>Template ativo:</strong> {templates[activeTemplate as keyof typeof templates].name} - 
              {templates[activeTemplate as keyof typeof templates].description}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Tabs de Funcionalidades */}
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="editor">Editor de Imagem</TabsTrigger>
          <TabsTrigger value="zip">Processador ZIP</TabsTrigger>
          <TabsTrigger value="stack">Visualizador Stack</TabsTrigger>
          <TabsTrigger value="upload">Upload Padrão</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Editor de Imagem Profissional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">
                  Selecione uma imagem para editar
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Crop, ajustes de brilho/contraste, proporção 1:1
                </p>
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelected(file);
                  }}
                  className="hidden"
                  id="image-edit-upload"
                />
                
                <Button asChild>
                  <label htmlFor="image-edit-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Imagem
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
                <CardTitle>Imagens Extraídas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span>{extractedImages.length} imagens prontas para upload</span>
                  <Button onClick={handleUploadBatch}>
                    <Upload className="h-4 w-4 mr-2" />
                    Fazer Upload em Lote
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
                Visualizador Stack Médico
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
                  <p>Processe um ZIP primeiro para visualizar o stack</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Upload Padrão</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedImageUpload 
                caseId={caseId}
                onChange={onImagesChange}
              />
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
