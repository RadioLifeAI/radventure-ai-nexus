
-- Primeiro, criar constraint única na coluna config_name
ALTER TABLE public.ai_tutor_config 
ADD CONSTRAINT ai_tutor_config_name_unique UNIQUE (config_name);

-- Expandir a tabela ai_tutor_config para gerenciar todos os tipos de prompts IA
ALTER TABLE public.ai_tutor_config 
ADD COLUMN IF NOT EXISTS ai_function_type text NOT NULL DEFAULT 'ai_tutor',
ADD COLUMN IF NOT EXISTS prompt_category text DEFAULT 'general',
ADD COLUMN IF NOT EXISTS prompt_version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS usage_stats jsonb DEFAULT '{"total_calls": 0, "success_rate": 0, "avg_response_time": 0, "total_cost": 0}'::jsonb,
ADD COLUMN IF NOT EXISTS optimization_data jsonb DEFAULT '{"a_b_test_active": false, "performance_score": 0, "last_optimized": null}'::jsonb;

-- Criar enum para tipos de função IA
DO $$ BEGIN
    CREATE TYPE ai_function_type AS ENUM (
      'ai_tutor', 
      'case_autofill', 
      'event_ai_suggestions', 
      'journey_ai_suggestions', 
      'radbot_chat'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Inserir configurações padrão para todas as funções IA existentes
INSERT INTO public.ai_tutor_config (
  config_name, ai_function_type, prompt_category, api_provider, model_name, 
  max_tokens, temperature, is_active, is_default, prompt_template
) VALUES 
-- RadBot Chat
('RadBot Chat Principal', 'radbot_chat', 'main_chat', 'openai', 'gpt-4o-mini', 1000, 0.7, true, true,
'Você é o RadBot AI, assistente especializado da plataforma RadVenture para estudantes de radiologia médica.

🎯 SUAS 3 FUNÇÕES PRINCIPAIS:
1. **EXPLICAR O FUNCIONAMENTO DO APP RADVENTURE**
2. **ENSINAR CONCEITOS DE RADIOLOGIA MÉDICA** 
3. **INTERAGIR COM O PROGRESSO DO USUÁRIO**

💡 ESTILO DE COMUNICAÇÃO:
- Use emojis médicos: 🩺🔬💊🧬⚡📋🏆
- Linguagem técnica mas acessível
- Respostas concisas e objetivas
- Mantenha tom encorajador e educativo

⚠️ DISCLAIMER OBRIGATÓRIO:
Sempre lembre que suas informações são educacionais e não substituem consulta médica profissional.'),

-- Case Autofill - Smart Autofill
('Case Autofill - Smart', 'case_autofill', 'smart_autofill', 'openai', 'gpt-4o-mini', 800, 0.3, true, true,
'Você é um especialista em radiologia médica responsável por auto-completar casos clínicos de forma inteligente e precisa.

TAREFA: Complete os campos faltantes do caso médico baseado nas informações fornecidas.

DIRETRIZES:
- Use conhecimento médico preciso e atualizado
- Mantenha consistência entre diagnóstico, achados e modalidade
- Seja específico mas educativo
- Foque na correlação clínico-radiológica'),

-- Event AI Suggestions
('Event AI - Suggestions', 'event_ai_suggestions', 'event_creation', 'openai', 'gpt-4o-mini', 600, 0.5, true, true,
'Você é um especialista em gamificação médica responsável por sugerir eventos competitivos baseados em casos reais.

OBJETIVO: Criar sugestões de eventos educativos e engajantes para estudantes de radiologia.

CRITÉRIOS:
- Baseie-se em dados reais de casos disponíveis
- Considere diferentes níveis de dificuldade
- Foque no valor educativo
- Crie eventos atrativos e desafiadores'),

-- Journey AI Suggestions  
('Journey AI - Creation', 'journey_ai_suggestions', 'journey_creation', 'openai', 'gpt-4o-mini', 500, 0.4, true, true,
'Você é um especialista em educação médica responsável por criar jornadas de aprendizado personalizadas.

MISSÃO: Desenvolver sequências educativas progressivas e coerentes para estudantes de radiologia.

PRINCÍPIOS:
- Progressão lógica de dificuldade
- Cobertura abrangente do tópico
- Casos complementares e correlacionados
- Objetivos educacionais claros'),

-- AI Tutor Hint (existente - manter configuração atual)
('AI Tutor - Hint System', 'ai_tutor', 'case_hints', 'openai', 'gpt-4o-mini', 150, 0.7, true, true,
'Você é um tutor especializado em radiologia médica. Forneça dicas educativas sem revelar a resposta diretamente.

OBJETIVO: Guiar o estudante ao raciocínio correto através de pistas pedagógicas.

ABORDAGEM:
- Faça perguntas que levem à reflexão
- Destaque achados importantes
- Oriente o raciocínio diagnóstico
- Mantenha tom encorajador')

ON CONFLICT (config_name) DO NOTHING;

-- Criar função para buscar prompt ativo por tipo
CREATE OR REPLACE FUNCTION public.get_active_prompt(p_function_type text, p_category text DEFAULT 'general')
RETURNS TABLE (
  prompt_template text,
  model_name text,
  max_tokens integer,
  temperature numeric,
  config_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cfg.prompt_template,
    cfg.model_name,
    cfg.max_tokens,
    cfg.temperature,
    cfg.id
  FROM public.ai_tutor_config cfg
  WHERE cfg.ai_function_type = p_function_type
    AND (cfg.prompt_category = p_category OR p_category = 'general')
    AND cfg.is_active = true
    AND cfg.is_default = true
  LIMIT 1;
END;
$$;

-- Criar função para registrar uso de prompt
CREATE OR REPLACE FUNCTION public.log_ai_prompt_usage(
  p_config_id uuid,
  p_tokens_used integer,
  p_response_time_ms integer,
  p_success boolean DEFAULT true,
  p_cost_estimate numeric DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_stats jsonb;
  total_calls integer;
  success_rate numeric;
BEGIN
  -- Buscar estatísticas atuais
  SELECT usage_stats INTO current_stats
  FROM public.ai_tutor_config
  WHERE id = p_config_id;
  
  -- Calcular novas estatísticas
  total_calls := COALESCE((current_stats->>'total_calls')::integer, 0) + 1;
  
  -- Atualizar estatísticas
  UPDATE public.ai_tutor_config
  SET usage_stats = jsonb_build_object(
    'total_calls', total_calls,
    'success_rate', CASE 
      WHEN p_success THEN COALESCE((current_stats->>'success_rate')::numeric * (total_calls - 1) + 100, 100) / total_calls
      ELSE COALESCE((current_stats->>'success_rate')::numeric * (total_calls - 1), 0) / total_calls
    END,
    'avg_response_time', (COALESCE((current_stats->>'avg_response_time')::numeric * (total_calls - 1), 0) + p_response_time_ms) / total_calls,
    'total_cost', COALESCE((current_stats->>'total_cost')::numeric, 0) + p_cost_estimate,
    'last_used', NOW()
  ),
  updated_at = NOW()
  WHERE id = p_config_id;
END;
$$;
