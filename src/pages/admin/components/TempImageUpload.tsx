
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTempCaseImages, type TempCaseImage } from '@/hooks/useTempCaseImages';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Edit2, 
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface TempImageUploadProps {
  onChange?: (images: TempCaseImage[]) => void;
}

export function TempImageUpload({ onChange }: TempImageUploadProps) {
  const {
    tempImages,
    uploading,
    uploadTempImage,
    removeTempImage,
    updateTempImageLegend,
    reorderTempImages
  } = useTempCaseImages();

  const [dragOver, setDragOver] = useState(false);
  const [editingLegend, setEditingLegend] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<TempCaseImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    onChange?.(tempImages);
  }, [tempImages, onChange]);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await uploadTempImage(file, '', tempImages.length + i);
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

  const getStatusIcon = (image: TempCaseImage) => {
    if (image.uploading) {
      return <Clock className="h-4 w-4 text-yellow-600 animate-spin" />;
    }
    if (image.error) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
    if (image.uploadedUrl) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <AlertCircle className="h-4 w-4 text-gray-600" />;
  };

  const getStatusBadge = (image: TempCaseImage) => {
    if (image.uploading) {
      return (
        <Badge variant="secondary">
          {getStatusIcon(image)}
          <span className="ml-1">Enviando...</span>
        </Badge>
      );
    }
    if (image.error) {
      return (
        <Badge variant="destructive">
          {getStatusIcon(image)}
          <span className="ml-1">Erro</span>
        </Badge>
      );
    }
    if (image.uploadedUrl) {
      return (
        <Badge variant="default">
          {getStatusIcon(image)}
          <span className="ml-1">Pronto</span>
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        {getStatusIcon(image)}
        <span className="ml-1">Pendente</span>
      </Badge>
    );
  };

  const formatFileSize = (file: File) => {
    const mb = file.size / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Área de Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Imagens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 mx-auto mb-4 text-gray-400" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                Arraste imagens aqui ou clique para selecionar
              </p>
              <p className="text-sm text-gray-500">
                Suporte para JPEG, PNG, WebP • Máximo 10MB por arquivo
              </p>
              <p className="text-xs text-blue-600">
                ✨ As imagens serão associadas automaticamente ao caso após salvá-lo
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
        </CardContent>
      </Card>

      {/* Galeria de Imagens */}
      {tempImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Imagens Carregadas ({tempImages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tempImages.map((image, index) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={image.uploadedUrl || image.tempUrl}
                      alt={image.legend || `Imagem ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(image)}
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary">#{index + 1}</Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">
                          {image.originalFilename}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPreviewImage(image)}
                            disabled={image.uploading}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingLegend(image.id)}
                            disabled={image.uploading}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeTempImage(image.id)}
                            disabled={image.uploading}
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
                              updateTempImageLegend(image.id, e.target.value);
                              setEditingLegend(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                updateTempImageLegend(image.id, e.currentTarget.value);
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
                          {image.legend || 'Clique no ícone de edição para adicionar uma legenda'}
                        </p>
                      )}

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{formatFileSize(image.file)}</span>
                        {image.error && (
                          <span className="text-red-600">{image.error}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Preview */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="max-w-4xl max-h-[90vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Preview - {previewImage.originalFilename}</CardTitle>
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
                src={previewImage.uploadedUrl || previewImage.tempUrl}
                alt={previewImage.legend || 'Preview'}
                className="w-full max-h-96 object-contain rounded"
              />
              {previewImage.legend && (
                <p className="text-sm text-gray-600 mt-4">{previewImage.legend}</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
