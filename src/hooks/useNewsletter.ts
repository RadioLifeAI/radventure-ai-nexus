
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useNewsletter() {
  const [isSubscribing, setIsSubscribing] = useState(false);

  const subscribe = async (email: string) => {
    setIsSubscribing(true);
    try {
      const { error } = await supabase
        .from('newsletter_leads')
        .insert({
          email,
          source: 'landing_page'
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('Este e-mail já está inscrito na nossa newsletter!');
        } else {
          throw error;
        }
      } else {
        toast.success('Inscrição realizada com sucesso! 🎉');
        return true;
      }
    } catch (error: any) {
      console.error('Erro ao inscrever na newsletter:', error);
      toast.error('Erro ao realizar inscrição. Tente novamente.');
    } finally {
      setIsSubscribing(false);
    }
    return false;
  };

  return { subscribe, isSubscribing };
}
