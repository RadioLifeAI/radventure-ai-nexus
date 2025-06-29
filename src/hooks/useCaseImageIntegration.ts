
import { useState, useCallback } from 'react';
import { useSpecializedImageUpload } from './useSpecializedImageUpload';
import { useSpecializedCaseImages } from './useSpecializedCaseImages';
import { supabase } from '@/integrations/supabase/client';
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
    uploading: savedUploading,
    processing: savedProcessing,
    refetch
  } = useSpecializedCaseImages(options.caseId);

  const {
    uploading: tempUploading,
    processing: tempProcessing,
    uploadSpecializedImage
  } = useSpecializedImageUpload();

  // Durante a criação do caso, usar imagens temporárias
  // Após salvar, usar imagens do banco
  const currentImages = options.caseId ? savedImages : tempImages;
  const uploading = options.caseId ? savedUploading : tempUploading;
  const processing = options.caseId ? savedProcessing : tempProcessing;

  const handleImageUpload = useCallback(async (file: File) => {
    if (!options.categoryId || !options.modality) {
      toast({
        title: "⚠️ Configuração Pendente",
        description: "Selecione categoria e modalidade primeiro",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Usar o hook correto para upload especializado
      const result = await uploadSpecializedImage(file, {
        caseId: options.caseId || null, // null para uploads temporários
        categoryId: options.categoryId,
        modality: options.modality,
        legend: `Imagem ${currentImages.length + 1}`,
        sequenceOrder: currentImages.length
      });

      if (result) {
        if (options.caseId) {
          // Caso já existe - refetch para atualizar lista
          refetch();
        } else {
          // Caso ainda não existe - adicionar à lista temporária
          setTempImages(prev => [...prev, result]);
        }

        toast({
          title: "🎯 Upload Concluído!",
          description: `Imagem organizada: ${options.modality}`,
          duration: 3000
        });
      }

      return result;
    } catch (error: any) {
      console.error('❌ Erro no upload:', error);
      toast({
        title: "Erro no Upload",
        description: error.message || 'Erro desconhecido',
        variant: "destructive"
      });
      return null;
    }
  }, [options, currentImages.length, uploadSpecializedImage, refetch]);

  const saveTempImages = useCallback(async (finalCaseId: string) => {
    if (tempImages.length === 0) {
      console.log('📝 Nenhuma imagem temporária para vincular');
      return [];
    }

    console.log('💾 Vinculando imagens temporárias ao caso:', finalCaseId, 'Total:', tempImages.length);
    
    try {
      // Atualizar todas as imagens temporárias com o case_id real
      const { data, error } = await supabase
        .from('case_images')
        .update({ 
          case_id: finalCaseId,
          updated_at: new Date().toISOString()
        })
        .in('id', tempImages.map(img => img.id))
        .select();

      if (error) {
        console.error('❌ Erro ao vincular imagens:', error);
        throw error;
      }

      console.log('✅ Imagens vinculadas ao caso:', data?.length);
      
      // Limpar imagens temporárias
      setTempImages([]);
      
      return data || [];
    } catch (error: any) {
      console.error('❌ Erro no saveTempImages:', error);
      toast({
        title: "Erro ao vincular imagens",
        description: error.message,
        variant: "destructive"
      });
      return [];
    }
  }, [tempImages]);

  const removeImage = useCallback((imageId: string) => {
    if (options.caseId) {
      // Para imagens salvas, usar o método do hook principal
      // (implementar se necessário)
    } else {
      // Para imagens temporárias, remover da lista local
      setTempImages(prev => prev.filter(img => img.id !== imageId));
    }
  }, [options.caseId]);

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
