
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AISuggestion {
  name: string;
  description: string;
  specialty: string;
  modality: string;
  numberOfCases: number;
  durationMinutes: number;
  target: string;
  prizeRadcoins: number;
}

interface AIAutoFill {
  name: string;
  description: string;
  numberOfCases: number;
  durationMinutes: number;
  prizeRadcoins: number;
  autoStart: boolean;
  caseFilters: any;
}

export function useEventAISuggestions() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);

  const getSuggestions = async (filters?: any, context?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('event-ai-suggestions', {
        body: {
          type: 'suggest',
          filters,
          context
        }
      });

      if (error) throw error;

      if (data.suggestions) {
        setSuggestions(data.suggestions);
        toast({
          title: 'Sugestões geradas!',
          description: `${data.suggestions.length} sugestões criadas pela IA`
        });
      }

      return data.suggestions;
    } catch (error: any) {
      console.error('Error getting AI suggestions:', error);
      toast({
        title: 'Erro ao gerar sugestões',
        description: error.message,
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getAutoFill = async (filters: any, context?: string): Promise<AIAutoFill | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('event-ai-suggestions', {
        body: {
          type: 'autofill',
          filters,
          context
        }
      });

      if (error) throw error;

      toast({
        title: 'Formulário preenchido!',
        description: 'IA preencheu o formulário baseado nos filtros'
      });

      return data;
    } catch (error: any) {
      console.error('Error getting AI autofill:', error);
      toast({
        title: 'Erro no preenchimento automático',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    suggestions,
    getSuggestions,
    getAutoFill
  };
}
