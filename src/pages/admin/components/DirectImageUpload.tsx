
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ImageIcon, Upload, X, CheckCircle } from 'lucide-react';

interface DirectImageUploadProps {
  caseId?: string;
  onImagesChange: (imageUrls: string[]) => void;
  currentImages?: string[];
  isEditMode?: boolean;
}

interface UploadedImage {
  id: string;
  url: string;
  filename: string;
  uploading: boolean;
}

export function DirectImageUpload({ 
  caseId, 
  onImagesChange, 
  currentImages = [],
  isEditMode = false
}: DirectImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);

  // Sistema unificado: usar caseId real (edição) ou gerar temporário (criação)
  const effectiveCaseId = caseId || `temp_${Date.now()}`;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validações básicas
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro no arquivo",
          description: `${file.name} não é uma imagem válida.`,
          variant: "destructive"
        });
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede o limite de 10MB.`,
          variant: "destructive"
        });
        continue;
      }

      const imageId = `img_${Date.now()}_${i}`;
      
      // Adicionar imagem como "carregando"
      setImages(prev => [...prev, {
        id: imageId,
        url: '',
        filename: file.name,
        uploading: true
      }]);

      try {
        const fileExt = file.name.split('.').pop();
        const filename = `${Date.now()}_${file.name}`;
        
        // CORREÇÃO: Path unificado simples sem duplicação
        const filePath = `${effectiveCaseId}/${filename}`;

        console.log('📤 Upload unificado para:', filePath);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('case-images')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('case-images')
          .getPublicUrl(filePath);

        console.log('✅ URL gerada:', publicUrl);

        // Sistema unificado: sempre registrar na tabela case_images quando há caseId real
        if (caseId && caseId !== effectiveCaseId) {
          const { error: insertError } = await supabase
            .from('case_images')
            .insert({
              case_id: caseId,
              original_filename: file.name,
              original_url: publicUrl,
              processing_status: 'completed',
              sequence_order: images.length
            });

          if (insertError) {
            console.warn('Erro ao registrar na tabela:', insertError);
          }
        }

        // Atualizar estado local
        setImages(prev => prev.map(img => 
          img.id === imageId 
            ? { ...img, url: publicUrl, uploading: false }
            : img
        ));

        // Notificar componente pai
        const newUrls = [...currentImages, publicUrl];
        onImagesChange(newUrls);

        toast({
          title: "✅ Upload concluído!",
          description: `${file.name} foi carregado com sucesso.`,
        });

      } catch (error: any) {
        console.error('❌ Erro no upload:', error);
        
        setImages(prev => prev.filter(img => img.id !== imageId));
        
        toast({
          title: "Erro no upload",
          description: error.message || 'Falha ao carregar a imagem.',
          variant: "destructive"
        });
      }
    }

    setUploading(false);
    event.target.value = '';
  };

  const removeImage = async (imageId: string) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (!imageToRemove) return;

    try {
      // Tentar deletar do storage
      if (imageToRemove.url) {
        const urlParts = imageToRemove.url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `${effectiveCaseId}/${fileName}`;
        
        await supabase.storage
          .from('case-images')
          .remove([filePath]);
      }

      // Remover do estado
      setImages(prev => prev.filter(img => img.id !== imageId));
      
      // Atualizar URLs no componente pai
      const remainingUrls = images
        .filter(img => img.id !== imageId)
        .map(img => img.url)
        .filter(url => url);
      
      onImagesChange([...currentImages.filter(url => url !== imageToRemove.url), ...remainingUrls]);
      
    } catch (error) {
      console.warn('Erro ao deletar imagem:', error);
    }
  };

  const replaceImage = async (imageId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Remover imagem atual
    await removeImage(imageId);
    
    // Fazer upload da nova
    const fakeEvent = { target: { files: [file] } } as any;
    handleFileSelect(fakeEvent);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
        <CardContent className="p-6">
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold text-blue-700 mb-2">
              {isEditMode ? 'Gerenciar Imagens do Caso' : 'Upload de Imagens'}
            </h3>
            <p className="text-blue-600 mb-4">
              Sistema unificado para criação e edição de casos
            </p>
            
            <div className="relative">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button 
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Carregando...' : 'Selecionar Imagens'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Imagens Existentes (modo edição) */}
      {isEditMode && currentImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-700">Imagens Atuais:</h4>
          {currentImages.map((url, index) => (
            <div key={`current-${index}`} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Imagem {index + 1}</span>
                <Badge variant="default" className="bg-green-100 text-green-700">
                  Salva
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => replaceImage(`current-${index}`, e)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" size="sm">
                    Substituir
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newUrls = currentImages.filter((_, i) => i !== index);
                    onImagesChange(newUrls);
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de Imagens em Upload */}
      {images.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-700">Novos Uploads:</h4>
          {images.map((image) => (
            <div key={image.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {image.uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <span className="text-sm font-medium">{image.filename}</span>
                {image.uploading ? (
                  <Badge variant="secondary">Carregando...</Badge>
                ) : (
                  <Badge variant="default" className="bg-green-100 text-green-700">
                    Concluído
                  </Badge>
                )}
              </div>
              
              {!image.uploading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImage(image.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Status Unificado */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        💡 <strong>Sistema Unificado:</strong> Upload para case-images/{effectiveCaseId}/
        {isEditMode && <span className="ml-2 text-green-600">• Modo Edição Ativo</span>}
      </div>
    </div>
  );
}
