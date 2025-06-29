
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SpecializedImage {
  id: string;
  original_url: string;
  thumbnail_url?: string;
  legend?: string;
  sequence_order: number;
  specialty_code?: string;
  modality_prefix?: string;
  bucket_path?: string;
  processing_status?: string;
  original_filename?: string;
  file_size_bytes?: number;
}

// Alias para compatibilidade com componentes existentes
export type SpecializedCaseImage = SpecializedImage;

export function useSpecializedCaseImages(caseId?: string) {
  const [images, setImages] = useState<SpecializedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

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

  const uploadSpecializedImage = async (file: File, options: any): Promise<SpecializedImage | null> => {
    setUploading(true);
    try {
      // Implementação básica de upload
      console.log('Upload de imagem especializada:', file.name, options);
      await fetchImages(); // Recarregar após upload
      return null; // Retornar resultado real na implementação completa
    } catch (err: any) {
      console.error('Erro no upload:', err);
      setError(err.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const processZipSpecialized = async (file: File, options: any): Promise<SpecializedImage[] | null> => {
    setProcessing(true);
    try {
      // Implementação básica de processamento ZIP
      console.log('Processamento ZIP especializado:', file.name, options);
      await fetchImages(); // Recarregar após processamento
      return []; // Retornar resultado real na implementação completa
    } catch (err: any) {
      console.error('Erro no processamento ZIP:', err);
      setError(err.message);
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
      await fetchImages();
    } catch (err: any) {
      console.error('Erro ao deletar imagem:', err);
      setError(err.message);
    }
  };

  const updateLegend = async (imageId: string, legend: string) => {
    try {
      const { error } = await supabase
        .from('case_images')
        .update({ legend })
        .eq('id', imageId);

      if (error) throw error;
      await fetchImages();
    } catch (err: any) {
      console.error('Erro ao atualizar legenda:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [caseId]);

  const refetch = () => {
    fetchImages();
  };

  return {
    images,
    loading,
    error,
    uploading,
    processing,
    uploadSpecializedImage,
    processZipSpecialized,
    deleteImage,
    updateLegend,
    refetch
  };
}
