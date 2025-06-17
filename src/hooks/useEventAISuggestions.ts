
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AISuggestion {
  name: string;
  description: string;
  specialty: string;
  modality: string;
  subtype?: string;
  numberOfCases: number;
  durationMinutes: number;
  difficulty?: number;
  target: string;
  prizeRadcoins: number;
}

interface AIAutoFill {
  name: string;
  description: string;
  scheduled_start: string;
  scheduled_end: string;
  numberOfCases: number;
  durationMinutes: number;
  prizeRadcoins: number;
  maxParticipants?: number;
  bannerUrl?: string;
  autoStart: boolean;
  prize_distribution: Array<{ position: number; prize: number }>;
  caseFilters: {
    specialty?: string[];
    modality?: string[];
    subtype?: string[];
    difficulty?: number[];
  };
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
          description: `${data.suggestions.length} sugestões criadas pela IA com dados reais`
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

      // Validar se todos os campos essenciais foram preenchidos
      if (data && data.name && data.scheduled_start && data.scheduled_end) {
        toast({
          title: 'Formulário preenchido completamente!',
          description: 'IA preencheu todos os campos com dados inteligentes',
          className: 'bg-green-50 border-green-200'
        });
        return data;
      } else {
        toast({
          title: 'Preenchimento incompleto',
          description: 'Alguns campos não foram preenchidos pela IA',
          variant: 'destructive'
        });
        return null;
      }
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
