
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PromptConfig {
  prompt_template: string;
  model_name: string;
  max_tokens: number;
  temperature: number;
  config_id: string;
}

export function usePromptManager() {
  const getActivePrompt = async (functionType: string, category: string = 'general'): Promise<PromptConfig | null> => {
    try {
      const { data, error } = await supabase.rpc('get_active_prompt', {
        p_function_type: functionType,
        p_category: category
      });

      if (error) {
        console.error('Erro ao buscar prompt:', error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Erro na busca do prompt:', error);
      return null;
    }
  };

  const logPromptUsage = async (
    configId: string,
    tokensUsed: number,
    responseTimeMs: number,
    success: boolean = true,
    costEstimate: number = 0
  ) => {
    try {
      await supabase.rpc('log_ai_prompt_usage', {
        p_config_id: configId,
        p_tokens_used: tokensUsed,
        p_response_time_ms: responseTimeMs,
        p_success: success,
        p_cost_estimate: costEstimate
      });
    } catch (error) {
      console.error('Erro ao registrar uso do prompt:', error);
    }
  };

  const { data: promptStats } = useQuery({
    queryKey: ["prompt-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_tutor_config")
        .select("ai_function_type, usage_stats")
        .eq("is_active", true);

      if (error) throw error;

      // Agregar estatísticas por tipo de função
      const stats = data.reduce((acc: any, config: any) => {
        const type = config.ai_function_type;
        const usage = config.usage_stats || {};
        
        if (!acc[type]) {
          acc[type] = {
            total_calls: 0,
            total_cost: 0,
            avg_success_rate: 0,
            avg_response_time: 0,
            configs_count: 0
          };
        }
        
        acc[type].total_calls += usage.total_calls || 0;
        acc[type].total_cost += usage.total_cost || 0;
        acc[type].avg_success_rate += usage.success_rate || 0;
        acc[type].avg_response_time += usage.avg_response_time || 0;
        acc[type].configs_count += 1;
        
        return acc;
      }, {});

      // Calcular médias
      Object.keys(stats).forEach(type => {
        const count = stats[type].configs_count;
        if (count > 0) {
          stats[type].avg_success_rate = stats[type].avg_success_rate / count;
          stats[type].avg_response_time = stats[type].avg_response_time / count;
        }
      });

      return stats;
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  return {
    getActivePrompt,
    logPromptUsage,
    promptStats
  };
}
