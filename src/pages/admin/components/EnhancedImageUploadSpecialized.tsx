
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSpecializedCaseImages, type SpecializedCaseImage } from '@/hooks/useSpecializedCaseImages';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Edit2, 
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FolderTree,
  Sparkles
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface EnhancedImageUploadSpecializedProps {
  caseId?: string;
  categoryId?: number;
  modality?: string;
  onChange?: (images: SpecializedCaseImage[]) => void;
}

export function EnhancedImageUploadSpecialized({ 
  caseId, 
  categoryId, 
  modality, 
  onChange 
}: EnhancedImageUploadSpecializedProps) {
  const {
    images,
    loading,
    uploading,
    processing,
    uploadSpecializedImage,
    deleteImage,
    updateLegend
  } = useSpecializedCaseImages(caseId);

  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingLegend, setEditingLegend] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<SpecializedCaseImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    onChange?.(images);
  }, [images, onChange]);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || !caseId) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validações
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Arquivo inválido",
          description: `${file.name} não é uma imagem válida.`,
          variant: "destructive",
        });
        continue;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede o limite de 10MB.`,
          variant: "destructive",
        });
        continue;
      }

      // Upload especializado
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await uploadSpecializedImage(file, {
        caseId,
        categoryId,
        modality,
        sequenceOrder: images.length + i
      });
      
      setUploadProgress(100);
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      processing: 'secondary',
      failed: 'destructive',
      pending: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (!caseId) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <FolderTree className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Salve o caso primeiro para habilitar o sistema especializado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Especializado */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-green-600" />
            Sistema Especializado de Upload
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Sparkles className="h-3 w-3 mr-1" />
              Organização Automática
            </Badge>
          </CardTitle>
          {categoryId && modality && (
            <div className="text-sm text-green-700">
              📁 Organização: Especialidade #{categoryId} → {modality}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Área de Upload Especializada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Especializado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <FolderTree className="h-10 w-10 mx-auto mb-4 text-green-500" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                Arraste imagens aqui ou clique para selecionar
              </p>
              <p className="text-sm text-gray-500">
                Suporte para JPEG, PNG, WebP • Máximo 10MB por arquivo
              </p>
              <p className="text-xs text-green-600">
                🗂️ Organização automática por especialidade e modalidade
              </p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          {(uploadProgress > 0 || uploading || processing) && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>
                  {processing ? 'Organizando especializado...' : 'Enviando...'}
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Galeria Especializada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Galeria Especializada ({images.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando imagens especializadas...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FolderTree className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma imagem organizada ainda</p>
              <p className="text-xs mt-1">Use o upload especializado acima</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={image.thumbnail_url || image.original_url}
                      alt={image.legend || `Imagem especializada ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(image.processing_status)}
                    </div>
                    <div className="absolute top-2 left-2">
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
                  
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">
                          {image.original_filename}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPreviewImage(image)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingLegend(image.id)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteImage(image.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {editingLegend === image.id ? (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Digite a legenda da imagem..."
                            defaultValue={image.legend || ''}
                            className="h-20"
                            onBlur={(e) => {
                              updateLegend(image.id, e.target.value);
                              setEditingLegend(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                updateLegend(image.id, e.currentTarget.value);
                                setEditingLegend(null);
                              }
                            }}
                          />
                          <p className="text-xs text-gray-500">
                            Ctrl+Enter para salvar
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {image.legend || 'Clique no ícone de edição para adicionar legenda'}
                        </p>
                      )}

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{formatFileSize(image.file_size_bytes)}</span>
                        {image.bucket_path && (
                          <span className="text-green-600">📁 {image.bucket_path}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Preview */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="max-w-4xl max-h-[90vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5 text-green-600" />
                Preview Especializado - {previewImage.original_filename}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewImage(null)}
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent>
              <img
                src={previewImage.original_url}
                alt={previewImage.legend || 'Preview especializado'}
                className="w-full max-h-96 object-contain rounded"
              />
              {previewImage.legend && (
                <p className="text-sm text-gray-600 mt-4">{previewImage.legend}</p>
              )}
              {previewImage.bucket_path && (
                <div className="mt-2 text-xs text-green-600">
                  📁 Organização: {previewImage.bucket_path}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
