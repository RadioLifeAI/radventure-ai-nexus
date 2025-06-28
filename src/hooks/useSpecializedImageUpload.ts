
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

// Hook unificado e otimizado para upload especializado
export function useSpecializedImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Função de validação anti-duplicação
  const validateImageUpload = async (file: File, caseId?: string): Promise<boolean> => {
    if (!caseId) return true; // Permite upload temporário sem caseId
    
    try {
      // Verificar se já existe arquivo com mesmo nome para este caso
      const { data: existingImages, error } = await supabase
        .from('case_images')
        .select('id, original_filename')
        .eq('case_id', caseId)
        .eq('original_filename', file.name);

      if (error) {
        console.warn('Erro na validação de duplicação:', error);
        return true; // Permite upload em caso de erro de validação
      }

      if (existingImages && existingImages.length > 0) {
        toast({
          title: "⚠️ Arquivo Duplicado",
          description: `Já existe uma imagem com o nome "${file.name}" neste caso.`,
          variant: "destructive"
        });
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Erro na validação:', error);
      return true; // Em caso de erro, permite o upload
    }
  };

  const uploadSpecializedImage = async (
    file: File, 
    options: UploadOptions
  ): Promise<ProcessedImageResult | null> => {
    try {
      setUploading(true);
      
      // Validação anti-duplicação
      const isValid = await validateImageUpload(file, options.caseId);
      if (!isValid) {
        return null;
      }
      
      console.log('🚀 Iniciando upload especializado integrado:', {
        filename: file.name,
        categoryId: options.categoryId,
        modality: options.modality,
        caseId: options.caseId
      });
      
      // 1. Upload para storage temporário
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

      // 3. Processar com organização especializada INTEGRADA
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
            modality: options.modality,
            // Dados adicionais para integração perfeita
            integrationSource: 'case_creation_wizard',
            timestamp: new Date().toISOString()
          }
        });

      if (processError) throw processError;

      if (processResult?.success) {
        console.log('✅ Processamento especializado integrado concluído:', {
          organization: processResult.organization,
          bucketPath: processResult.caseImage?.bucket_path
        });
        
        toast({
          title: "🎯 Upload Integrado Concluído!",
          description: `Organizado em ${processResult.organization.specialty_code}/${processResult.organization.modality_prefix}`,
          duration: 3000
        });

        return processResult.caseImage;
      } else {
        throw new Error(processResult?.error || 'Erro no processamento especializado');
      }

    } catch (error: any) {
      console.error('❌ Erro no upload especializado integrado:', error);
      toast({
        title: "Erro no Upload Integrado",
        description: error.message || 'Erro desconhecido',
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

      console.log('📦 Iniciando processamento ZIP especializado integrado:', {
        filename: zipFile.name,
        categoryId: options.categoryId,
        modality: options.modality
      });

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

      // Processar ZIP com organização especializada integrada
      const { data: processResult, error: processError } = await supabase.functions
        .invoke('zip-processor-specialized', {
          body: {
            caseId: options.caseId || 'temp',
            zipFileUrl: publicUrl,
            userId: (await supabase.auth.getUser()).data.user?.id,
            categoryId: options.categoryId,
            modality: options.modality,
            // Dados adicionais para integração
            integrationSource: 'case_creation_wizard',
            batchSize: 50, // Controle de lote para evitar sobrecarga
            timestamp: new Date().toISOString()
          }
        });

      if (processError) throw processError;

      if (processResult?.success) {
        console.log('✅ ZIP processado e organizado com integração:', {
          imagesCount: processResult.images.length,
          organization: processResult.organization
        });
        
        toast({
          title: "🗂️ ZIP Processado com Integração!",
          description: `${processResult.images.length} imagens organizadas em ${processResult.organization.specialty_code}/${processResult.organization.modality_prefix}`,
          duration: 4000
        });

        return processResult.images;
      } else {
        throw new Error(processResult?.error || 'Erro no processamento ZIP especializado');
      }

    } catch (error: any) {
      console.error('❌ Erro no processamento ZIP especializado integrado:', error);
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

  return {
    uploading,
    processing,
    uploadSpecializedImage,
    processZipSpecialized,
    validateImageUpload
  };
}
