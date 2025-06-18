
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useAvatarUpload() {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadAvatar = async (file: File, userId: string) => {
    try {
      setUploading(true);

      // Validar arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Arquivo deve ser uma imagem');
      }

      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Imagem deve ter no máximo 2MB');
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Atualizar perfil com nova URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) throw updateError;

      toast({
        title: 'Avatar atualizado',
        description: 'Sua foto de perfil foi atualizada com sucesso.',
      });

      return data.publicUrl;
    } catch (error: any) {
      console.error('Erro no upload:', error);
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
