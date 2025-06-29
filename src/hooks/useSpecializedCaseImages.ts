
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface SpecializedImage {
  id: string;
  original_url: string;
  thumbnail_url?: string;
  legend?: string;
  sequence_order: number;
  specialty_code?: string;
  modality_prefix?: string;
  bucket_path?: string;
  original_filename?: string;
  file_size_bytes?: number;
  processing_status?: string;
  case_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SpecializedCaseImage extends SpecializedImage {}

export function useSpecializedCaseImages(caseId?: string) {
  const [images, setImages] = useState<SpecializedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = async () => {
    if (!caseId) {
      setImages([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('case_images')
        .select('*')
        .eq('case_id', caseId)
        .order('sequence_order', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setImages(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar imagens especializadas:', err);
      setError(err.message);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [caseId]);

  const uploadSpecializedImage = async (
    file: File,
    options: {
      caseId?: string;
      categoryId?: number;
      modality?: string;
      legend?: string;
      sequenceOrder?: number;
    }
  ): Promise<SpecializedImage | null> => {
    try {
      setUploading(true);
      
      console.log('🚀 Iniciando upload especializado:', {
        filename: file.name,
        categoryId: options.categoryId,
        modality: options.modality,
        caseId: options.caseId
      });
      
      // 1. Upload para storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `case-images/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('case-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('case-images')
        .getPublicUrl(filePath);

      // 3. Inserir na tabela case_images
      const imageData = {
        case_id: options.caseId || null,
        original_url: publicUrl,
        original_filename: file.name,
        file_size_bytes: file.size,
        legend: options.legend || `Imagem ${(options.sequenceOrder || 0) + 1}`,
        sequence_order: options.sequenceOrder || 0,
        specialty_code: options.categoryId ? `cat_${options.categoryId}` : null,
        modality_prefix: options.modality || null,
        bucket_path: filePath,
        processing_status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: insertedImage, error: insertError } = await supabase
        .from('case_images')
        .insert([imageData])
        .select()
        .single();

      if (insertError) throw insertError;

      console.log('✅ Upload especializado concluído:', insertedImage);
      
      toast({
        title: "🎯 Upload Concluído!",
        description: `Imagem organizada: ${options.modality || 'N/A'}`,
        duration: 3000
      });

      // Atualizar lista local
      setImages(prev => [...prev, insertedImage]);

      return insertedImage;

    } catch (error: any) {
      console.error('❌ Erro no upload especializado:', error);
      toast({
        title: "Erro no Upload",
        description: error.message || 'Erro desconhecido',
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const processZipSpecialized = async (
    zipFile: File,
    options: {
      caseId?: string;
      categoryId?: number;
      modality?: string;
    }
  ): Promise<SpecializedImage[] | null> => {
    try {
      setProcessing(true);

      console.log('📦 Iniciando processamento ZIP:', {
        filename: zipFile.name,
        categoryId: options.categoryId,
        modality: options.modality
      });

      // Para simplificar, vamos processar como upload individual
      // Em produção, seria melhor usar uma Edge Function
      toast({
        title: "🗂️ Processamento ZIP",
        description: "Funcionalidade em desenvolvimento",
        duration: 3000
      });

      return [];

    } catch (error: any) {
      console.error('❌ Erro no processamento ZIP:', error);
      toast({
        title: "Erro no Processamento ZIP",
        description: error.message || 'Erro desconhecido',
        variant: "destructive"
      });
      return null;
    } finally {
      setProcessing(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('case_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      setImages(prev => prev.filter(img => img.id !== imageId));
      
      toast({
        title: "Imagem removida",
        description: "Imagem removida com sucesso",
      });
    } catch (error: any) {
      console.error('Erro ao deletar imagem:', error);
      toast({
        title: "Erro ao remover imagem",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateLegend = async (imageId: string, legend: string) => {
    try {
      const { error } = await supabase
        .from('case_images')
        .update({ legend, updated_at: new Date().toISOString() })
        .eq('id', imageId);

      if (error) throw error;

      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, legend }
          : img
      ));

      toast({
        title: "Legenda atualizada",
        description: "Legenda da imagem atualizada com sucesso",
      });
    } catch (error: any) {
      console.error('Erro ao atualizar legenda:', error);
      toast({
        title: "Erro ao atualizar legenda",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const refetch = () => {
    fetchImages();
  };

  return {
    images,
    loading,
    uploading,
    processing,
    error,
    uploadSpecializedImage,
    processZipSpecialized,
    deleteImage,
    updateLegend,
    refetch
  };
}
