-- Debug da função get_daily_challenge_for_user
CREATE OR REPLACE FUNCTION public.get_daily_challenge_for_user_debug(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_challenge RECORD;
  user_challenge RECORD;
  result JSON;
BEGIN
  RAISE LOG 'DEBUG: Iniciando busca para usuário %', p_user_id;
  
  -- Buscar desafio de hoje
  SELECT * INTO today_challenge
  FROM public.daily_challenges
  WHERE challenge_date = CURRENT_DATE
    AND is_active = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  RAISE LOG 'DEBUG: Desafio encontrado: %', today_challenge.id;
  
  -- Se não há desafio de hoje, retornar null
  IF today_challenge IS NULL THEN
    RAISE LOG 'DEBUG: Nenhum desafio encontrado para hoje';
    RETURN NULL;
  END IF;
  
  -- Verificar se usuário já respondeu hoje
  SELECT * INTO user_challenge
  FROM public.user_daily_challenges
  WHERE user_id = p_user_id
    AND challenge_id = today_challenge.id;
  
  RAISE LOG 'DEBUG: User challenge: answered=%, exists=%', user_challenge.answered, (user_challenge IS NOT NULL);
  
  -- Se já respondeu, retornar null
  IF user_challenge.answered = true THEN
    RAISE LOG 'DEBUG: Usuário já respondeu';
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
  
  RAISE LOG 'DEBUG: Resultado construído: %', result;
  
  -- Criar registro se não existir
  IF user_challenge IS NULL THEN
    RAISE LOG 'DEBUG: Criando registro user_challenge';
    INSERT INTO public.user_daily_challenges (user_id, challenge_id)
    VALUES (p_user_id, today_challenge.id);
  END IF;
  
  RETURN result;
END;
$$;