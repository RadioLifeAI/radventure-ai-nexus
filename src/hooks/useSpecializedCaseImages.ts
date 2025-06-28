
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface SpecializedCaseImage {
  id: string;
  case_id: string;
  original_filename: string;
  original_url: string;
  thumbnail_url?: string;
  medium_url?: string;
  large_url?: string;
  file_size_bytes?: number;
  dimensions?: {
    width: number;
    height: number;
    aspect_ratio: number;
  };
  formats?: {
    webp_url?: string;
    jpeg_url?: string;
    avif_url?: string;
  };
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: Record<string, any>;
  legend?: string;
  sequence_order: number;
  created_at: string;
  processed_at?: string;
  // Campos especializados
  specialty_code?: string;
  modality_prefix?: string;
  bucket_path?: string;
  organization_metadata?: any;
}

export function useSpecializedCaseImages(caseId?: string) {
  const [images, setImages] = useState<SpecializedCaseImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Função para converter dados do Supabase para SpecializedCaseImage
  const transformDbImageToSpecialized = (dbImage: any): SpecializedCaseImage => {
    return {
      id: dbImage.id,
      case_id: dbImage.case_id,
      original_filename: dbImage.original_filename,
      original_url: dbImage.original_url,
      thumbnail_url: dbImage.thumbnail_url,
      medium_url: dbImage.medium_url,
      large_url: dbImage.large_url,
      file_size_bytes: dbImage.file_size_bytes,
      dimensions: dbImage.dimensions && typeof dbImage.dimensions === 'object' 
        ? dbImage.dimensions as { width: number; height: number; aspect_ratio: number }
        : undefined,
      formats: dbImage.formats && typeof dbImage.formats === 'object'
        ? dbImage.formats as { webp_url?: string; jpeg_url?: string; avif_url?: string }
        : undefined,
      processing_status: dbImage.processing_status as 'pending' | 'processing' | 'completed' | 'failed',
      metadata: dbImage.metadata && typeof dbImage.metadata === 'object'
        ? dbImage.metadata as Record<string, any>
        : undefined,
      legend: dbImage.legend,
      sequence_order: dbImage.sequence_order,
      created_at: dbImage.created_at,
      processed_at: dbImage.processed_at,
      // Campos especializados
      specialty_code: dbImage.specialty_code,
      modality_prefix: dbImage.modality_prefix,
      bucket_path: dbImage.bucket_path,
      organization_metadata: dbImage.organization_metadata,
    };
  };

  // Carregar imagens do caso com busca especializada + fallback
  const fetchImages = async () => {
    if (!caseId) return;
    
    setLoading(true);
    try {
      console.log('🔍 Buscando imagens especializadas para caso:', caseId);
      
      const { data, error } = await supabase
        .from('case_images')
        .select('*')
        .eq('case_id', caseId)
        .order('sequence_order', { ascending: true });

      if (error) throw error;
      
      console.log('✅ Imagens encontradas:', data?.length || 0);
      
      const transformedImages = (data || []).map(transformDbImageToSpecialized);
      setImages(transformedImages);
    } catch (error: any) {
      console.error('❌ Erro ao carregar imagens especializadas:', error);
      toast({
        title: "Erro ao carregar imagens",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Upload especializado de imagem única
  const uploadSpecializedImage = async (
    file: File, 
    options: {
      caseId?: string;
      categoryId?: number;
      modality?: string;
      legend?: string;
      sequenceOrder?: number;
    }
  ) => {
    if (!options.caseId) {
      toast({
        title: "Erro",
        description: "ID do caso não encontrado",
        variant: "destructive",
      });
      return null;
    }

    setUploading(true);
    try {
      console.log('📤 Iniciando upload especializado:', {
        filename: file.name,
        categoryId: options.categoryId,
        modality: options.modality
      });

      // Upload para storage temporário
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `temp-uploads/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('case-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('case-images')
        .getPublicUrl(filePath);

      console.log('📁 URL temporária criada, processando especializado...');

      // Processar com organização especializada
      setProcessing(true);
      const { data: processResult, error: processError } = await supabase.functions
        .invoke('image-processor-specialized', {
          body: {
            imageUrl: publicUrl,
            caseId: options.caseId,
            filename: fileName,
            legend: options.legend,
            sequenceOrder: options.sequenceOrder || images.length,
            categoryId: options.categoryId,
            modality: options.modality
          }
        });

      if (processError) throw processError;

      if (processResult?.success) {
        console.log('✅ Processamento especializado concluído:', processResult.organization);
        
        toast({
          title: "🎯 Imagem Organizada!",
          description: `Classificada em ${processResult.organization.specialty_code}/${processResult.organization.modality_prefix}`
        });

        // Recarregar lista de imagens
        await fetchImages();
        
        return processResult.caseImage;
      } else {
        throw new Error(processResult?.error || 'Erro no processamento');
      }

    } catch (error: any) {
      console.error('❌ Erro no upload especializado:', error);
      toast({
        title: "Erro no Upload",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  // Processamento de ZIP especializado
  const processZipSpecialized = async (
    zipFile: File,
    options: {
      caseId?: string;
      categoryId?: number;
      modality?: string;
    }
  ) => {
    if (!options.caseId) {
      toast({
        title: "Erro",
        description: "ID do caso não encontrado",
        variant: "destructive",
      });
      return null;
    }

    setProcessing(true);
    try {
      console.log('📦 Iniciando processamento ZIP especializado...');

      // Upload ZIP para storage temporário
      const fileName = `zip-${Date.now()}-${zipFile.name}`;
      const filePath = `temp-zips/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('case-images')
        .upload(filePath, zipFile);

      if (uploadError) throw uploadError;

      // Obter URL pública do ZIP
      const { data: { publicUrl } } = supabase.storage
        .from('case-images')
        .getPublicUrl(filePath);

      console.log('📁 ZIP uploaded, processando com organização especializada...');

      // Processar ZIP com organização
      const { data: processResult, error: processError } = await supabase.functions
        .invoke('zip-processor-specialized', {
          body: {
            caseId: options.caseId,
            zipFileUrl: publicUrl,
            userId: (await supabase.auth.getUser()).data.user?.id,
            categoryId: options.categoryId,
            modality: options.modality
          }
        });

      if (processError) throw processError;

      if (processResult?.success) {
        console.log('✅ ZIP processado e organizado:', processResult.organization);
        
        toast({
          title: "🗂️ ZIP Organizado!",
          description: `${processResult.images.length} imagens em ${processResult.organization.specialty_code}/${processResult.organization.modality_prefix}`
        });

        // Recarregar lista de imagens
        await fetchImages();
        
        return processResult.images;
      } else {
        throw new Error(processResult?.error || 'Erro no processamento ZIP');
      }

    } catch (error: any) {
      console.error('❌ Erro no processamento ZIP especializado:', error);
      toast({
        title: "Erro no Processamento ZIP",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setProcessing(false);
    }
  };

  // Deletar imagem especializada
  const deleteImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('case_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast({
        title: "Imagem removida",
        description: "A imagem foi removida com sucesso.",
      });

      await fetchImages();
    } catch (error: any) {
      console.error('❌ Erro ao deletar imagem:', error);
      toast({
        title: "Erro ao deletar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Atualizar ordem das imagens
  const reorderImages = async (reorderedImages: SpecializedCaseImage[]) => {
    try {
      const updates = reorderedImages.map((img, index) => ({
        id: img.id,
        sequence_order: index
      }));

      for (const update of updates) {
        await supabase
          .from('case_images')
          .update({ sequence_order: update.sequence_order })
          .eq('id', update.id);
      }

      await fetchImages();
    } catch (error: any) {
      console.error('❌ Erro ao reordenar:', error);
      toast({
        title: "Erro ao reordenar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Atualizar legenda
  const updateLegend = async (imageId: string, legend: string) => {
    try {
      const { error } = await supabase
        .from('case_images')
        .update({ legend })
        .eq('id', imageId);

      if (error) throw error;

      await fetchImages();
    } catch (error: any) {
      console.error('❌ Erro ao atualizar legenda:', error);
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchImages();
  }, [caseId]);

  return {
    images,
    loading,
    uploading,
    processing,
    uploadSpecializedImage,
    processZipSpecialized,
    deleteImage,
    reorderImages,
    updateLegend,
    refetch: fetchImages
  };
}
