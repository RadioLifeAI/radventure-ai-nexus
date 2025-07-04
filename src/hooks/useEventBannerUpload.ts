import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useEventBannerUpload() {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // MÉTODO PRIMÁRIO: Upload via Edge Function (otimizado)
  const uploadViaEdgeFunction = async (file: File, eventId: string) => {
    console.log('🚀 Tentando upload via Edge Function...');
    
    // Converter para base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1]; // Remove data:image/...;base64,
        resolve(base64);
      };
      reader.onerror = reject;
    });
    reader.readAsDataURL(file);
    const base64File = await base64Promise;

    // Processar via Edge Function
    const { data, error } = await supabase.functions.invoke('image-processor-event-banner', {
      body: {
        file: base64File,
        eventId: eventId,
        fileName: file.name
      }
    });

    if (error) {
      console.error('❌ Edge Function falhou:', error);
      throw new Error(`Edge Function: ${error.message}`);
    }

    if (!data.success) {
      throw new Error(`Edge Function: ${data.error || 'Falha no processamento'}`);
    }

    console.log('✅ Upload via Edge Function concluído:', data.urls);
    return data;
  };

  // MÉTODO FALLBACK: Upload direto ao bucket
  const uploadDirectToBucket = async (file: File, eventId: string) => {
    console.log('🔄 Iniciando upload direto ao bucket...');
    
    // Upload direto do arquivo original
    const filePath = `${eventId}/direct_${Date.now()}.${file.name.split('.').pop()}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('event-banners')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Upload direto falhou:', uploadError);
      throw new Error(`Upload direto: ${uploadError.message}`);
    }

    console.log('✅ Upload direto concluído:', uploadData);

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from('event-banners')
      .getPublicUrl(filePath);

    // Salvar metadados básicos na tabela
    const { data: bannerData, error: insertError } = await supabase
      .from('event_banner_images')
      .insert({
        event_id: eventId,
        thumb_url: urlData.publicUrl, // Usar a mesma URL para todos os tamanhos
        medium_url: urlData.publicUrl,
        full_url: urlData.publicUrl,
        original_filename: file.name,
        file_size_bytes: file.size,
        processed: false, // Marcar como não processado
        metadata: {
          upload_method: 'direct_fallback',
          processing_timestamp: new Date().toISOString(),
          fallback_reason: 'Edge Function não disponível'
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao salvar metadados fallback:', insertError);
      throw insertError;
    }

    // Atualizar evento com banner URL
    const { error: updateError } = await supabase
      .from('events')
      .update({ 
        banner_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId);

    if (updateError) {
      console.error('❌ Erro ao atualizar evento com fallback:', updateError);
      throw updateError;
    }

    return {
      bannerData,
      urls: {
        thumb_url: urlData.publicUrl,
        medium_url: urlData.publicUrl,
        full_url: urlData.publicUrl
      },
      fallback: true
    };
  };

  const uploadEventBanner = async (file: File, eventId: string) => {
    try {
      setUploading(true);
      console.log('🖼️ Processando banner para evento:', eventId.slice(0, 8));

      // Validar arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Arquivo deve ser uma imagem');
      }

      if (file.size > 15 * 1024 * 1024) { // 15MB
        throw new Error('Imagem deve ter no máximo 15MB');
      }

      let result;
      let usedFallback = false;

      // FASE 3: SISTEMA HÍBRIDO - tentar Edge Function primeiro
      try {
        result = await uploadViaEdgeFunction(file, eventId);
        console.log('✅ Sucesso via Edge Function');
      } catch (edgeFunctionError) {
        console.warn('⚠️ Edge Function falhou, usando fallback:', edgeFunctionError.message);
        
        // FALLBACK: Upload direto
        try {
          result = await uploadDirectToBucket(file, eventId);
          usedFallback = true;
          console.log('✅ Sucesso via upload direto (fallback)');
        } catch (fallbackError) {
          console.error('❌ Ambos os métodos falharam');
          throw new Error(`Upload falhou completamente: Edge Function (${edgeFunctionError.message}) e Fallback (${fallbackError.message})`);
        }
      }

      // FASE 4: FEEDBACK MELHORADO
      toast({
        title: usedFallback ? '⚠️ Banner salvo (modo simplificado)' : '✅ Banner otimizado',
        description: usedFallback 
          ? 'Banner foi salvo com sucesso, mas sem otimização automática.'
          : 'Banner foi otimizado e salvo em múltiplos tamanhos.',
        variant: usedFallback ? 'default' : 'default'
      });

      return result;
    } catch (error: any) {
      console.error('❌ Erro crítico no upload:', error);
      toast({
        title: '❌ Erro no upload',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadEventBanner,
    uploading
  };
}