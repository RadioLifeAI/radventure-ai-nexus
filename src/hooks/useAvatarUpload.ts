
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useAvatarUpload() {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadAvatar = async (file: File, userId: string) => {
    try {
      setUploading(true);
      console.log('📤 Processando avatar para usuário:', userId.slice(0, 8));

      // Validar arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Arquivo deve ser uma imagem');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new Error('Imagem deve ter no máximo 10MB');
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
      const { data, error } = await supabase.functions.invoke('image-processor-avatar', {
        body: {
          file: base64File,
          userId: userId,
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

      console.log('✅ Avatar processado e otimizado');

      toast({
        title: 'Avatar atualizado',
        description: 'Sua foto de perfil foi otimizada e atualizada com sucesso.',
      });

      return data.avatar_url;
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
    uploadAvatar,
    uploading
  };
}
