
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useContact() {
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async (name: string, email: string, message: string) => {
    setIsSending(true);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name,
          email,
          message
        });

      if (error) throw error;

      toast.success('Mensagem enviada com sucesso! Responderemos em breve. 📧');
      return true;
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return { sendMessage, isSending };
}
