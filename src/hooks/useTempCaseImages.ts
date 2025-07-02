
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface TempCaseImage {
  id: string;
  file: File;
  originalFilename: string;
  tempUrl: string;
  uploadedUrl?: string;
  legend?: string;
  sequenceOrder: number;
  uploading: boolean;
  error?: string;
}

export function useTempCaseImages() {
  const [tempImages, setTempImages] = useState<TempCaseImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substring(2)}`;

  const uploadTempImage = useCallback(async (file: File, legend?: string, sequenceOrder?: number) => {
    const tempId = generateTempId();
    const tempUrl = URL.createObjectURL(file);
    
    const tempImage: TempCaseImage = {
      id: tempId,
      file,
      originalFilename: file.name,
      tempUrl,
      legend: legend || '',
      sequenceOrder: sequenceOrder || tempImages.length,
      uploading: true
    };

    setTempImages(prev => [...prev, tempImage]);
    setUploading(true);

    try {
      // Validações
      if (!file.type.startsWith('image/')) {
        throw new Error(`${file.name} não é uma imagem válida.`);
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new Error(`${file.name} excede o limite de 10MB.`);
      }

      // Upload para o storage temporário
      const fileExt = file.name.split('.').pop();
      const fileName = `temp/${tempId}.${fileExt}`;
      const filePath = `case-images/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('case-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('case-images')
        .getPublicUrl(filePath);

      // Atualizar com URL real
      setTempImages(prev => prev.map(img => 
        img.id === tempId 
          ? { ...img, uploadedUrl: publicUrl, uploading: false }
          : img
      ));

      toast({
        title: "✅ Imagem enviada!",
        description: `${file.name} foi carregada com sucesso.`,
      });

      return tempId;

    } catch (error: any) {
      console.error('Erro no upload temporário:', error);
      
      setTempImages(prev => prev.map(img => 
        img.id === tempId 
          ? { ...img, uploading: false, error: error.message }
          : img
      ));

      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setUploading(false);
    }
  }, [tempImages.length]);

  const removeTempImage = useCallback(async (tempId: string) => {
    const imageToRemove = tempImages.find(img => img.id === tempId);
    
    if (imageToRemove?.uploadedUrl) {
      try {
        // Extrair path do storage da URL
        const urlParts = imageToRemove.uploadedUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `temp/${fileName}`;
        
        await supabase.storage
          .from('case-images')
          .remove([filePath]);
      } catch (error) {
        console.warn('Erro ao deletar arquivo temporário:', error);
      }
    }

    // Limpar URL temporária
    if (imageToRemove?.tempUrl) {
      URL.revokeObjectURL(imageToRemove.tempUrl);
    }

    setTempImages(prev => prev.filter(img => img.id !== tempId));
  }, [tempImages]);

  const updateTempImageLegend = useCallback((tempId: string, legend: string) => {
    setTempImages(prev => prev.map(img => 
      img.id === tempId ? { ...img, legend } : img
    ));
  }, []);

  const reorderTempImages = useCallback((reorderedImages: TempCaseImage[]) => {
    const updatedImages = reorderedImages.map((img, index) => ({
      ...img,
      sequenceOrder: index
    }));
    setTempImages(updatedImages);
  }, []);

  const clearTempImages = useCallback(() => {
    // Limpar URLs temporárias
    tempImages.forEach(img => {
      if (img.tempUrl) {
        URL.revokeObjectURL(img.tempUrl);
      }
    });
    setTempImages([]);
  }, [tempImages]);

  const associateWithCase = useCallback(async (caseId: string) => {
    if (tempImages.length === 0) return [];

    const associatedImages = [];

    for (const tempImage of tempImages) {
      if (!tempImage.uploadedUrl) continue;

      try {
        // Mover arquivo de temp/ para case-id/
        const urlParts = tempImage.uploadedUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const oldPath = `temp/${fileName}`;
        const newPath = `${caseId}/${fileName}`;

        // Copiar arquivo para nova localização
        const { data: fileData } = await supabase.storage
          .from('case-images')
          .download(oldPath);

        if (fileData) {
          const { data: newUpload, error: uploadError } = await supabase.storage
            .from('case-images')
            .upload(newPath, fileData);

          if (!uploadError) {
            // Deletar arquivo temporário
            await supabase.storage
              .from('case-images')
              .remove([oldPath]);

            // Obter nova URL
            const { data: { publicUrl } } = supabase.storage
              .from('case-images')
              .getPublicUrl(newPath);

            // Inserir na tabela case_images
            const { data: caseImageData, error: insertError } = await supabase
              .from('case_images')
              .insert({
                case_id: caseId,
                original_filename: tempImage.originalFilename,
                original_url: publicUrl,
                legend: tempImage.legend,
                sequence_order: tempImage.sequenceOrder,
                processing_status: 'completed'
              })
              .select()
              .single();

            if (!insertError && caseImageData) {
              associatedImages.push(caseImageData);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao associar imagem ao caso:', error);
      }
    }

    // Limpar imagens temporárias após associação
    clearTempImages();
    
    return associatedImages;
  }, [tempImages, clearTempImages]);

  return {
    tempImages,
    uploading,
    uploadTempImage,
    removeTempImage,
    updateTempImageLegend,
    reorderTempImages,
    clearTempImages,
    associateWithCase
  };
}
