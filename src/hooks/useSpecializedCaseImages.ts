
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SpecializedImage {
  id: string;
  original_url: string;
  thumbnail_url?: string;
  legend?: string;
  sequence_order: number;
  specialty_code?: string;
  modality_prefix?: string;
  bucket_path?: string;
}

export function useSpecializedCaseImages(caseId?: string) {
  const [images, setImages] = useState<SpecializedImage[]>([]);
  const [loading, setLoading] = useState(false);
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

  const refetch = () => {
    fetchImages();
  };

  return {
    images,
    loading,
    error,
    refetch
  };
}
