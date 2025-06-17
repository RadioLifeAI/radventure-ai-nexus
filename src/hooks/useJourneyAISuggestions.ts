
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface JourneyAIAutoFill {
  title: string;
  description: string;
  objectives: string[];
  suggestedFilters: {
    specialty?: string;
    modality?: string;
    subtype?: string;
    difficulty?: string;
    patientAge?: string;
    patientGender?: string;
    symptomsDuration?: string;
  };
  estimatedDuration: number;
  recommendedCaseCount: number;
}

export function useJourneyAISuggestions() {
  const [loading, setLoading] = useState(false);

  const getAutoFill = async (filters: any, context?: string): Promise<JourneyAIAutoFill | null> => {
    setLoading(true);
    try {
      console.log("Requesting Journey AI auto-fill with:", { filters, context });
      
      const { data, error } = await supabase.functions.invoke('journey-ai-suggestions', {
        body: {
          type: 'autofill',
          filters,
          context: context || 'Criar uma jornada de aprendizado personalizada'
        }
      });

      if (error) {
        console.error("Error from edge function:", error);
        throw error;
      }

      console.log("Journey AI auto-fill response:", data);

      // Validação robusta de campos obrigatórios
      const requiredFields = ['title', 'description', 'objectives'];
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

      // Validação adicional de objetivos
      if (!Array.isArray(data.objectives) || data.objectives.length === 0) {
        console.warn("No objectives provided by AI or invalid format");
        data.objectives = ['Aprender conceitos fundamentais'];
      }

      // Sucesso total
      toast({
        title: '🎉 Jornada preenchida pela IA!',
        description: 'Todos os campos foram preenchidos com sugestões inteligentes',
        className: 'bg-purple-50 border-purple-200'
      });
      
      return data as JourneyAIAutoFill;

    } catch (error: any) {
      console.error('Error getting Journey AI autofill:', error);
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
    getAutoFill
  };
}
