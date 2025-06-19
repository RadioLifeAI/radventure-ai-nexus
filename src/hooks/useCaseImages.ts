
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface CaseImage {
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
}

export function useCaseImages(caseId?: string) {
  const [images, setImages] = useState<CaseImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Carregar imagens do caso
  const fetchImages = async () => {
    if (!caseId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('case_images')
        .select('*')
        .eq('case_id', caseId)
        .order('sequence_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar imagens:', error);
      toast({
        title: "Erro ao carregar imagens",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Upload e processamento de nova imagem
  const uploadImage = async (file: File, legend?: string, sequenceOrder?: number) => {
    if (!caseId) {
      toast({
        title: "Erro",
        description: "ID do caso não encontrado",
        variant: "destructive",
      });
      return null;
    }

    setUploading(true);
    try {
      // Upload para o Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `case-images/${caseId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('case-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('case-images')
        .getPublicUrl(filePath);

      // Processar imagem via Edge Function
      const { data: processResult, error: processError } = await supabase.functions
        .invoke('image-processor', {
          body: {
            imageUrl: publicUrl,
            caseId,
            filename: file.name,
            legend,
            sequenceOrder: sequenceOrder || images.length
          }
        });

      if (processError) throw processError;

      toast({
        title: "✅ Imagem enviada com sucesso!",
        description: "A imagem está sendo processada em segundo plano.",
      });

      // Recarregar lista de imagens
      await fetchImages();
      
      return processResult.caseImage;

    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Deletar imagem
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
      console.error('Erro ao deletar imagem:', error);
      toast({
        title: "Erro ao deletar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Atualizar ordem das imagens
  const reorderImages = async (reorderedImages: CaseImage[]) => {
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
      console.error('Erro ao reordenar:', error);
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
      console.error('Erro ao atualizar legenda:', error);
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
    uploadImage,
    deleteImage,
    reorderImages,
    updateLegend,
    refetch: fetchImages
  };
}
