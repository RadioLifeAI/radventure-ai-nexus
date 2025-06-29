
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface TempImage {
  id: string;
  file: File;
  url: string;
  legend?: string;
  sequenceOrder: number;
}

export interface ProcessedImage {
  id: string;
  original_url: string;
  legend?: string;
  sequence_order: number;
  specialty_code?: string;
  modality_prefix?: string;
}

export function useTempImageManager() {
  const [tempImages, setTempImages] = useState<TempImage[]>([]);
  const [processing, setProcessing] = useState(false);

  const addTempImage = useCallback((file: File, legend?: string) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const url = URL.createObjectURL(file);
    
    const tempImage: TempImage = {
      id: tempId,
      file,
      url,
      legend,
      sequenceOrder: tempImages.length
    };

    setTempImages(prev => [...prev, tempImage]);
    return tempId;
  }, [tempImages.length]);

  const removeTempImage = useCallback((id: string) => {
    setTempImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // Revoke object URL to prevent memory leaks
      const removedImage = prev.find(img => img.id === id);
      if (removedImage) {
        URL.revokeObjectURL(removedImage.url);
      }
      return updated;
    });
  }, []);

  const updateTempImageLegend = useCallback((id: string, legend: string) => {
    setTempImages(prev => 
      prev.map(img => img.id === id ? { ...img, legend } : img)
    );
  }, []);

  const processAllTempImages = useCallback(async (
    caseId: string,
    categoryId?: number,
    modality?: string
  ): Promise<ProcessedImage[]> => {
    if (tempImages.length === 0) return [];

    setProcessing(true);
    const processedImages: ProcessedImage[] = [];

    try {
      console.log('🔄 Processando imagens temporárias para caso:', caseId);

      for (const tempImage of tempImages) {
        // Upload para storage temporário
        const fileExt = tempImage.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `temp-uploads/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('case-images')
          .upload(filePath, tempImage.file);

        if (uploadError) throw uploadError;

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('case-images')
          .getPublicUrl(filePath);

        // Processar com organização especializada
        const { data: processResult, error: processError } = await supabase.functions
          .invoke('image-processor-specialized', {
            body: {
              imageUrl: publicUrl,
              caseId: caseId,
              filename: fileName,
              legend: tempImage.legend,
              sequenceOrder: tempImage.sequenceOrder,
              categoryId: categoryId,
              modality: modality,
              integrationSource: 'case_creation_final',
              timestamp: new Date().toISOString()
            }
          });

        if (processError) throw processError;

        if (processResult?.success) {
          processedImages.push({
            id: processResult.caseImage.id,
            original_url: processResult.caseImage.original_url,
            legend: processResult.caseImage.legend,
            sequence_order: processResult.caseImage.sequence_order,
            specialty_code: processResult.caseImage.specialty_code,
            modality_prefix: processResult.caseImage.modality_prefix
          });

          console.log('✅ Imagem processada:', processResult.caseImage.id);
        }
      }

      // Limpar imagens temporárias após processamento
      tempImages.forEach(img => URL.revokeObjectURL(img.url));
      setTempImages([]);

      toast({
        title: "🎯 Imagens Organizadas!",
        description: `${processedImages.length} imagem(ns) salvas e organizadas automaticamente.`
      });

      return processedImages;

    } catch (error: any) {
      console.error('❌ Erro no processamento de imagens:', error);
      toast({
        title: "Erro no processamento",
        description: error.message || 'Falha ao processar imagens',
        variant: "destructive"
      });
      return [];
    } finally {
      setProcessing(false);
    }
  }, [tempImages]);

  const clearAllTempImages = useCallback(() => {
    tempImages.forEach(img => URL.revokeObjectURL(img.url));
    setTempImages([]);
  }, [tempImages]);

  return {
    tempImages,
    processing,
    addTempImage,
    removeTempImage,
    updateTempImageLegend,
    processAllTempImages,
    clearAllTempImages
  };
}
