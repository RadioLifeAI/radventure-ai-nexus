
-- Criar função para adicionar benefícios de ajuda (não consumir)
CREATE OR REPLACE FUNCTION public.add_help_aids(
  p_user_id uuid,
  p_elimination_aids integer DEFAULT 0,
  p_skip_aids integer DEFAULT 0,
  p_ai_tutor_credits integer DEFAULT 0
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir ou atualizar somando aos valores existentes
  INSERT INTO public.user_help_aids (
    user_id, 
    elimination_aids, 
    skip_aids, 
    ai_tutor_credits,
    updated_at
  ) VALUES (
    p_user_id,
    p_elimination_aids,
    p_skip_aids,
    p_ai_tutor_credits,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    elimination_aids = user_help_aids.elimination_aids + EXCLUDED.elimination_aids,
    skip_aids = user_help_aids.skip_aids + EXCLUDED.skip_aids,
    ai_tutor_credits = user_help_aids.ai_tutor_credits + EXCLUDED.ai_tutor_credits,
    updated_at = NOW();
    
  RETURN TRUE;
END;
$$;
