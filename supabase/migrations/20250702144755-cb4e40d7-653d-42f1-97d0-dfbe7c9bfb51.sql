-- CORREÇÃO DEFINITIVA DO SISTEMA UNIFICADO DE PROMPTS IA

-- 1. CORRIGIR FUNÇÃO get_active_prompt para não depender exclusivamente de is_default
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
  -- Primeiro: Buscar por categoria específica e ativa
  RETURN QUERY
  SELECT 
    cfg.prompt_template,
    cfg.model_name,
    cfg.max_tokens,
    cfg.temperature,
    cfg.id
  FROM public.ai_tutor_config cfg
  WHERE cfg.ai_function_type = p_function_type
    AND cfg.prompt_category = p_category
    AND cfg.is_active = true
  ORDER BY cfg.is_default DESC, cfg.created_at DESC
  LIMIT 1;
  
  -- Se não encontrou, buscar por categoria geral
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      cfg.prompt_template,
      cfg.model_name,
      cfg.max_tokens,
      cfg.temperature,
      cfg.id
    FROM public.ai_tutor_config cfg
    WHERE cfg.ai_function_type = p_function_type
      AND cfg.prompt_category = 'general'
      AND cfg.is_active = true
    ORDER BY cfg.is_default DESC, cfg.created_at DESC
    LIMIT 1;
  END IF;
  
  -- Se ainda não encontrou, buscar qualquer configuração ativa da função
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      cfg.prompt_template,
      cfg.model_name,
      cfg.max_tokens,
      cfg.temperature,
      cfg.id
    FROM public.ai_tutor_config cfg
    WHERE cfg.ai_function_type = p_function_type
      AND cfg.is_active = true
    ORDER BY cfg.is_default DESC, cfg.created_at DESC
    LIMIT 1;
  END IF;
END;
$$;

-- 2. DEFINIR PROMPTS PADRÃO PARA CADA CATEGORIA CRÍTICA
UPDATE public.ai_tutor_config 
SET is_default = true, updated_at = NOW()
WHERE config_name IN (
  'Case Autofill - Structured Complete',
  'Case Autofill - Basic Complete', 
  'Case Autofill - Quiz Complete',
  'Case Autofill - Explanation Complete',
  'Case Autofill - Advanced Config'
) AND ai_function_type = 'case_autofill';

-- 3. GARANTIR QUE APENAS UM PROMPT POR CATEGORIA SEJA DEFAULT
-- Primeiro, remover is_default de todos os outros
UPDATE public.ai_tutor_config 
SET is_default = false, updated_at = NOW()
WHERE ai_function_type = 'case_autofill' 
AND config_name NOT IN (
  'Case Autofill - Structured Complete',
  'Case Autofill - Basic Complete', 
  'Case Autofill - Quiz Complete',
  'Case Autofill - Explanation Complete',
  'Case Autofill - Advanced Config'
);

-- 4. VERIFICAR SE TODAS AS CONFIGURAÇÕES ESTÃO ATIVAS
UPDATE public.ai_tutor_config 
SET is_active = true, updated_at = NOW()
WHERE ai_function_type = 'case_autofill';