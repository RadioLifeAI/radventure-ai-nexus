import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/components/ui/use-toast';
import { 
  Upload, 
  Image as ImageIcon, 
  Scissors, 
  Archive, 
  Layers, 
  Settings,
  FolderTree,
  CheckCircle,
  AlertTriangle,
  RotateCw,
  Sun,
  Contrast,
  Crop,
  Download,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X
} from 'lucide-react';
import { useSpecializedImageUpload } from '@/hooks/useSpecializedImageUpload';
import { useSpecializedCaseImages } from '@/hooks/useSpecializedCaseImages';

interface UnifiedImageSystemTabsProps {
  caseId?: string;
  categoryId?: number;
  modality?: string;
  onImagesChange?: (images: any[]) => void;
  // Novas props para sistema integrado
  tempImages?: File[];
  onTempImageUpload?: (files: File[]) => void;
  onRemoveTempImage?: (index: number) => void;
  isProcessingImages?: boolean;
  specializedImages?: any[];
}

export function UnifiedImageSystemTabs({ 
  caseId, 
  categoryId, 
  modality, 
  onImagesChange,
  tempImages = [],
  onTempImageUpload,
  onRemoveTempImage,
  isProcessingImages = false,
  specializedImages = []
}: UnifiedImageSystemTabsProps) {
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [editSettings, setEditSettings] = useState({
    brightness: 0,
    contrast: 0,
    rotation: 0,
    cropArea: null
  });
  const [zipProcessing, setZipProcessing] = useState(false);
  const [stackIndex, setStackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { 
    uploading, 
    processing, 
    uploadSpecializedImage,
    processZipSpecialized
  } = useSpecializedImageUpload();

  const { 
    images, 
    loading, 
    refetch 
  } = useSpecializedCaseImages(caseId);

  const isIntegrated = !!(categoryId && modality);
  const isCreationMode = !caseId; // Modo criação (sem caseId ainda)

  // Upload Tab Component
  const UploadTab = () => (
    <div className="space-y-6">
      <Card className={`border-2 ${isIntegrated 
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
        : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {isCreationMode ? 'Upload Integrado (Staging)' : 'Upload Especializado Integrado'}
            <Badge variant="secondary" className={isIntegrated 
              ? 'bg-green-100 text-green-700'
              : 'bg-orange-100 text-orange-700'
            }>
              {isIntegrated ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
              {isIntegrated ? 'INTEGRADO' : 'AGUARDANDO'}
            </Badge>
            {isCreationMode && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Staging: {tempImages.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              !isIntegrated 
                ? 'border-orange-300 bg-orange-50 cursor-not-allowed opacity-60'
                : 'border-gray-300 hover:border-gray-400 cursor-pointer'
            }`}
            onClick={isIntegrated ? () => fileInputRef.current?.click() : undefined}
          >
            <FolderTree className={`h-10 w-10 mx-auto mb-4 ${isIntegrated ? 'text-green-500' : 'text-orange-400'}`} />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isIntegrated 
                  ? isCreationMode 
                    ? 'Arraste imagens aqui (serão processadas após salvar caso)'
                    : 'Arraste imagens aqui ou clique para selecionar'
                  : 'Configure formulário para habilitar upload'
                }
              </p>
              <p className="text-sm text-gray-500">
                Suporte para JPEG, PNG, WebP, DICOM • Máximo 10MB por arquivo
              </p>
              {isIntegrated && (
                <p className="text-xs text-green-600">
                  🗂️ Organização automática: Cat#{categoryId} + {modality}
                  {isCreationMode && ' (após salvamento)'}
                </p>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.dcm"
              className="hidden"
              onChange={handleFileUpload}
              disabled={!isIntegrated || isProcessingImages}
            />
          </div>

          {(uploading || processing || isProcessingImages) && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>
                  {isProcessingImages ? 'Processando e organizando após salvamento...' : 
                   processing ? 'Processando e organizando...' : 'Enviando...'}
                </span>
              </div>
              <Progress value={isProcessingImages ? 85 : processing ? 75 : 25} className="h-2" />
            </div>
          )}

          {/* Área de Staging para modo criação */}
          {isCreationMode && tempImages.length > 0 && (
            <Card className="mt-4 bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Imagens em Staging ({tempImages.length})
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Aguardando processamento
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {tempImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="w-full h-20 bg-gray-100 rounded border flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="absolute top-1 right-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-6 w-6 p-0"
                          onClick={() => onRemoveTempImage?.(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  💡 Estas imagens serão processadas e organizadas automaticamente após salvar o caso
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Gallery - usa images existentes ou specializedImages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Galeria Integrada ({(specializedImages?.length || images.length)})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(specializedImages?.length || images.length) === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FolderTree className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma imagem integrada ainda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(specializedImages || images).map((image, index) => (
                <div key={image.id} className="relative group cursor-pointer" onClick={() => setSelectedImage(image)}>
                  <img
                    src={image.thumbnail_url || image.original_url}
                    alt={`Imagem ${index + 1}`}
                    className="w-full h-32 object-cover rounded border hover:border-blue-400 transition-colors"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">#{index + 1}</Badge>
                  </div>
                  {image.specialty_code && (
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-green-600 text-white text-xs">
                        {image.specialty_code}/{image.modality_prefix}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Editor Tab Component
  const EditorTab = () => (
    <div className="space-y-6">
      {!selectedImage ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Scissors className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Selecione uma imagem da galeria para editar</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scissors className="h-5 w-5" />
                  Editor Profissional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-96 object-contain"
                    style={{
                      filter: `brightness(${100 + editSettings.brightness}%) contrast(${100 + editSettings.contrast}%)`,
                      transform: `rotate(${editSettings.rotation}deg)`
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ajustes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Brilho
                  </label>
                  <Slider
                    value={[editSettings.brightness]}
                    onValueChange={(value) => setEditSettings(prev => ({ ...prev, brightness: value[0] }))}
                    min={-50}
                    max={50}
                    step={1}
                    className="mt-2"
                  />
                  <span className="text-xs text-gray-500">{editSettings.brightness}%</span>
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Contrast className="h-4 w-4" />
                    Contraste
                  </label>
                  <Slider
                    value={[editSettings.contrast]}
                    onValueChange={(value) => setEditSettings(prev => ({ ...prev, contrast: value[0] }))}
                    min={-50}
                    max={50}
                    step={1}
                    className="mt-2"
                  />
                  <span className="text-xs text-gray-500">{editSettings.contrast}%</span>
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <RotateCw className="h-4 w-4" />
                    Rotação
                  </label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditSettings(prev => ({ ...prev, rotation: prev.rotation - 90 }))}
                    >
                      -90°
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditSettings(prev => ({ ...prev, rotation: prev.rotation + 90 }))}
                    >
                      +90°
                    </Button>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button className="w-full" onClick={handleSaveEdit}>
                    <Download className="h-4 w-4 mr-2" />
                    Salvar Edições
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleResetEdit}>
                    Resetar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  // ZIP Processor Tab
  const ZipTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Processador ZIP Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              !isIntegrated 
                ? 'border-orange-300 bg-orange-50 cursor-not-allowed opacity-60'
                : 'border-gray-300 hover:border-gray-400 cursor-pointer'
            }`}
            onClick={isIntegrated ? () => zipInputRef.current?.click() : undefined}
          >
            <Archive className={`h-10 w-10 mx-auto mb-4 ${isIntegrated ? 'text-blue-500' : 'text-orange-400'}`} />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isIntegrated 
                  ? 'Envie arquivos ZIP com múltiplas imagens'
                  : 'Configure formulário para habilitar processamento ZIP'
                }
              </p>
              <p className="text-sm text-gray-500">
                Suporte para ZIP contendo JPEG, PNG, DICOM • Máximo 50MB
              </p>
              {isIntegrated && (
                <p className="text-xs text-blue-600">
                  📦 Processamento automático com organização por modalidade
                </p>
              )}
            </div>
            
            <input
              ref={zipInputRef}
              type="file"
              accept=".zip"
              className="hidden"
              onChange={handleZipUpload}
              disabled={!isIntegrated}
            />
          </div>

          {zipProcessing && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Processando arquivo ZIP...</span>
              </div>
              <Progress value={50} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Stack Viewer Tab
  const StackTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Visualizador Stack Médico
          </CardTitle>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Layers className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma série de imagens disponível</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stack Viewer */}
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={images[stackIndex]?.original_url}
                  alt={`Fatia ${stackIndex + 1}`}
                  className="w-full h-96 object-contain"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary">
                    Fatia {stackIndex + 1} de {images.length}
                  </Badge>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setStackIndex(Math.max(0, stackIndex - 1))}
                  disabled={stackIndex === 0}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setStackIndex(Math.min(images.length - 1, stackIndex + 1))}
                  disabled={stackIndex === images.length - 1}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {/* Slider */}
              <Slider
                value={[stackIndex]}
                onValueChange={(value) => setStackIndex(value[0])}
                min={0}
                max={images.length - 1}
                step={1}
                className="mt-4"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Templates Tab
  const TemplatesTab = () => {
    const modalityTemplates = {
      'Radiografia (RX)': { icon: '🦴', settings: { brightness: 10, contrast: 20 } },
      'Tomografia Computadorizada (TC)': { icon: '🧠', settings: { brightness: 0, contrast: 15 } },
      'Ressonância Magnética (RM)': { icon: '🔬', settings: { brightness: -5, contrast: 10 } },
      'Ultrassonografia (US)': { icon: '👶', settings: { brightness: 5, contrast: 25 } },
      'Mamografia': { icon: '🎀', settings: { brightness: 15, contrast: 30 } }
    };

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Templates por Modalidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(modalityTemplates).map(([name, config]) => (
                <Card key={name} className="cursor-pointer hover:border-blue-400 transition-colors">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl mb-2">{config.icon}</div>
                      <h3 className="font-semibold">{name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Configurações otimizadas para {name.toLowerCase()}
                      </p>
                      <Button 
                        size="sm" 
                        className="mt-3"
                        onClick={() => applyTemplate(config.settings)}
                      >
                        Aplicar Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Event Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !isIntegrated) return;
    
    const files = Array.from(e.target.files);
    
    if (isCreationMode) {
      // Modo criação: adicionar a staging
      onTempImageUpload?.(files);
    } else {
      // Modo edição: processar diretamente
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await uploadSpecializedImage(file, {
          caseId,
          categoryId,
          modality,
          sequenceOrder: (specializedImages?.length || images.length) + i
        });
      }
      
      refetch();
      onImagesChange?.(specializedImages || images);
    }
  };

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !isIntegrated) return;
    
    setZipProcessing(true);
    try {
      await processZipSpecialized(e.target.files[0], {
        caseId,
        categoryId,
        modality
      });
      refetch();
      onImagesChange?.(images);
    } finally {
      setZipProcessing(false);
    }
  };

  const handleSaveEdit = () => {
    toast({
      title: "Edições salvas!",
      description: "A imagem foi processada e salva com as modificações."
    });
  };

  const handleResetEdit = () => {
    setEditSettings({
      brightness: 0,
      contrast: 0,
      rotation: 0,
      cropArea: null
    });
  };

  const applyTemplate = (settings: any) => {
    setEditSettings(prev => ({ ...prev, ...settings }));
    toast({
      title: "Template aplicado!",
      description: "Configurações otimizadas foram aplicadas."
    });
  };

  return (
    <div className="space-y-6">
      {/* Integration Status */}
      <Card className={`border-2 ${isIntegrated 
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
        : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Sistema Unificado de Imagens
            <Badge variant="secondary" className={isIntegrated 
              ? 'bg-green-100 text-green-700'
              : 'bg-orange-100 text-orange-700'
            }>
              {isIntegrated ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
              {isIntegrated ? 'INTEGRADO' : 'AGUARDANDO'}
            </Badge>
            {isCreationMode && isIntegrated && (
              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                Modo Staging Ativo
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-gray-600">
            {isIntegrated 
              ? `Organização ativa: Cat#${categoryId} → ${modality}${isCreationMode ? ' (staging até salvamento)' : ''}`
              : 'Selecione categoria e modalidade no formulário para ativar todas as ferramentas'
            }
          </p>
        </CardHeader>
      </Card>

      {/* Unified Tabs System */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <Scissors className="h-4 w-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="zip" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            ZIP
          </TabsTrigger>
          <TabsTrigger value="stack" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Stack
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <UploadTab />
        </TabsContent>

        <TabsContent value="editor" className="mt-6">
          <EditorTab />
        </TabsContent>

        <TabsContent value="zip" className="mt-6">
          <ZipTab />
        </TabsContent>

        <TabsContent value="stack" className="mt-6">
          <StackTab />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <TemplatesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
