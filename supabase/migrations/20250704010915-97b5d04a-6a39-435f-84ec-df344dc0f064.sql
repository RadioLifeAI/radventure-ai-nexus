-- Função para buscar desafio diário para um usuário
CREATE OR REPLACE FUNCTION public.get_daily_challenge_for_user(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_challenge RECORD;
  user_challenge RECORD;
  result JSON;
BEGIN
  -- Buscar desafio de hoje
  SELECT * INTO today_challenge
  FROM public.daily_challenges
  WHERE challenge_date = CURRENT_DATE
    AND is_active = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Se não há desafio de hoje, retornar null
  IF today_challenge IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Verificar se usuário já respondeu hoje
  SELECT * INTO user_challenge
  FROM public.user_daily_challenges
  WHERE user_id = p_user_id
    AND challenge_id = today_challenge.id;
  
  -- Se já respondeu, retornar null
  IF user_challenge.answered = true THEN
    RETURN NULL;
  END IF;
  
  -- Construir resultado
  result := json_build_object(
    'id', today_challenge.id,
    'question', today_challenge.question,
    'explanation', today_challenge.explanation,
    'community_stats', today_challenge.community_stats,
    'challenge_date', today_challenge.challenge_date
  );
  
  -- Criar registro se não existir
  IF user_challenge IS NULL THEN
    INSERT INTO public.user_daily_challenges (user_id, challenge_id)
    VALUES (p_user_id, today_challenge.id);
  END IF;
  
  RETURN result;
END;
$$;