import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useEventBannerUpload() {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

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
        console.error('❌ Erro no processamento:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Falha no processamento da imagem');
      }

      console.log('✅ Banner processado em 3 tamanhos:', data.urls);

      toast({
        title: 'Banner atualizado',
        description: 'Banner do evento foi otimizado e salvo em múltiplos tamanhos.',
      });

      return {
        bannerData: data.banner_data,
        urls: data.urls
      };
    } catch (error: any) {
      console.error('❌ Erro no upload:', error);
      toast({
        title: 'Erro no upload',
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