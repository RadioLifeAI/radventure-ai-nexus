
import { useState, useCallback } from 'react';
import { useSpecializedCaseImages } from './useSpecializedCaseImages';
import { toast } from '@/components/ui/use-toast';

interface ImageIntegrationOptions {
  caseId?: string;
  categoryId?: number;
  modality?: string;
}

export function useCaseImageIntegration(options: ImageIntegrationOptions) {
  const [tempImages, setTempImages] = useState<any[]>([]);
  
  const {
    images: savedImages,
    uploading,
    processing,
    uploadSpecializedImage,
    processZipSpecialized,
    refetch
  } = useSpecializedCaseImages(options.caseId);

  // Durante a criação do caso, usar imagens temporárias
  // Após salvar, usar imagens do banco
  const currentImages = options.caseId ? savedImages : tempImages;

  const handleImageUpload = useCallback(async (file: File) => {
    if (!options.categoryId || !options.modality) {
      toast({
        title: "⚠️ Configuração Pendente",
        description: "Selecione categoria e modalidade primeiro",
        variant: "destructive",
      });
      return null;
    }

    if (options.caseId) {
      // Caso já existe - salvar diretamente
      return await uploadSpecializedImage(file, {
        caseId: options.caseId,
        categoryId: options.categoryId,
        modality: options.modality,
        sequenceOrder: currentImages.length
      });
    } else {
      // Caso ainda não existe - armazenar temporariamente
      const tempImage = {
        id: `temp_${Date.now()}`,
        file,
        original_url: URL.createObjectURL(file),
        original_filename: file.name,
        legend: `Imagem ${tempImages.length + 1}`,
        sequence_order: tempImages.length,
        processing_status: 'pending'
      };
      
      setTempImages(prev => [...prev, tempImage]);
      
      toast({
        title: "📁 Imagem Preparada",
        description: "Será salva junto com o caso",
      });
      
      return tempImage;
    }
  }, [options, tempImages.length, uploadSpecializedImage, currentImages.length]);

  const saveTempImages = useCallback(async (finalCaseId: string) => {
    if (tempImages.length === 0) return [];

    console.log('💾 Salvando imagens temporárias para caso:', finalCaseId);
    
    const savedImages = [];
    
    for (let i = 0; i < tempImages.length; i++) {
      const tempImage = tempImages[i];
      
      if (tempImage.file) {
        const result = await uploadSpecializedImage(tempImage.file, {
          caseId: finalCaseId,
          categoryId: options.categoryId,
          modality: options.modality,
          legend: tempImage.legend,
          sequenceOrder: i
        });
        
        if (result) {
          savedImages.push(result);
        }
      }
    }
    
    // Limpar imagens temporárias
    setTempImages([]);
    
    return savedImages;
  }, [tempImages, uploadSpecializedImage, options]);

  const removeImage = useCallback((imageId: string) => {
    if (imageId.startsWith('temp_')) {
      setTempImages(prev => prev.filter(img => img.id !== imageId));
    }
    // Para imagens salvas, usar o método do hook principal
  }, []);

  return {
    images: currentImages,
    uploading,
    processing,
    handleImageUpload,
    saveTempImages,
    removeImage,
    refetch,
    isIntegrated: !!(options.categoryId && options.modality)
  };
}
