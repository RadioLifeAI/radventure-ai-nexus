
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
      console.log("Requesting AI suggestions with:", { filters, context });
      
      const { data, error } = await supabase.functions.invoke('event-ai-suggestions', {
        body: {
          type: 'suggest',
          filters,
          context
        }
      });

      if (error) {
        console.error("Error from edge function:", error);
        throw error;
      }

      console.log("AI suggestions response:", data);

      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
        toast({
          title: '✨ Sugestões geradas!',
          description: `${data.suggestions.length} sugestões criadas pela IA com dados reais`,
          className: 'bg-blue-50 border-blue-200'
        });
        return data.suggestions;
      } else {
        throw new Error("Formato de resposta inválido da IA");
      }

    } catch (error: any) {
      console.error('Error getting AI suggestions:', error);
      toast({
        title: 'Erro ao gerar sugestões',
        description: error.message || 'Falha na comunicação com a IA',
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
      console.log("Requesting AI auto-fill with:", { filters, context });
      
      const { data, error } = await supabase.functions.invoke('event-ai-suggestions', {
        body: {
          type: 'autofill',
          filters,
          context
        }
      });

      if (error) {
        console.error("Error from edge function:", error);
        throw error;
      }

      console.log("AI auto-fill response:", data);

      // Validação robusta de campos obrigatórios
      const requiredFields = ['name', 'description', 'scheduled_start', 'scheduled_end', 'numberOfCases', 'durationMinutes'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        console.error("Missing required fields:", missingFields);
        toast({
          title: 'Preenchimento incompleto',
          description: `IA não preencheu campos obrigatórios: ${missingFields.join(', ')}`,
          variant: 'destructive'
        });
        return null;
      }

      // Validação adicional de dados
      if (!data.caseFilters || Object.keys(data.caseFilters).length === 0) {
        console.warn("No case filters provided by AI");
      }

      if (!data.prize_distribution || !Array.isArray(data.prize_distribution)) {
        console.warn("No prize distribution provided by AI");
      }

      // Sucesso total
      toast({
        title: '🎉 Formulário preenchido completamente!',
        description: 'IA preencheu todos os campos com dados inteligentes e validados',
        className: 'bg-green-50 border-green-200'
      });
      
      return data as AIAutoFill;

    } catch (error: any) {
      console.error('Error getting AI autofill:', error);
      toast({
        title: 'Erro no preenchimento automático',
        description: error.message || 'Falha na comunicação com a IA',
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
