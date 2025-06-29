
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface UploadOptions {
  caseId?: string;
  categoryId?: number;
  modality?: string;
  legend?: string;
  sequenceOrder?: number;
}

export interface ProcessedImageResult {
  id: string;
  original_url: string;
  specialty_code?: string;
  modality_prefix?: string;
  bucket_path?: string;
  organization_metadata?: any;
}

export function useSpecializedImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const uploadSpecializedImage = async (
    file: File, 
    options: UploadOptions
  ): Promise<ProcessedImageResult | null> => {
    try {
      setUploading(true);
      
      // 1. Upload para storage temporário (preserva fluxo existente)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `temp-uploads/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('case-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('case-images')
        .getPublicUrl(filePath);

      console.log('📤 Upload concluído, iniciando processamento especializado:', {
        publicUrl,
        categoryId: options.categoryId,
        modality: options.modality
      });

      // 3. Processar com organização especializada
      setProcessing(true);
      const { data: processResult, error: processError } = await supabase.functions
        .invoke('image-processor-specialized', {
          body: {
            imageUrl: publicUrl,
            caseId: options.caseId || 'temp',
            filename: fileName,
            legend: options.legend,
            sequenceOrder: options.sequenceOrder,
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

  const processZipSpecialized = async (
    zipFile: File,
    options: UploadOptions
  ): Promise<ProcessedImageResult[] | null> => {
    try {
      setProcessing(true);

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

      console.log('📦 ZIP uploaded, processando com organização especializada...');

      // Processar ZIP com organização
      const { data: processResult, error: processError } = await supabase.functions
        .invoke('zip-processor-specialized', {
          body: {
            caseId: options.caseId || 'temp',
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

  return {
    uploading,
    processing,
    uploadSpecializedImage,
    processZipSpecialized
  };
}
