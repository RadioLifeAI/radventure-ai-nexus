-- CORREÇÃO: Eliminar ambiguidade da coluna was_correct na função submit_daily_challenge
DROP FUNCTION IF EXISTS public.submit_daily_challenge(uuid, uuid, boolean);

CREATE OR REPLACE FUNCTION public.submit_daily_challenge(
  p_user_id uuid,
  p_challenge_id uuid,
  p_user_answer boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  challenge_data RECORD;
  was_correct boolean;
  radcoins_awarded integer := 5;
  result jsonb;
BEGIN
  -- Buscar dados do desafio
  SELECT * INTO challenge_data
  FROM public.daily_challenges
  WHERE id = p_challenge_id AND is_active = true;
  
  IF challenge_data IS NULL THEN
    RETURN jsonb_build_object('error', 'Challenge not found');
  END IF;
  
  -- Verificar se já respondeu
  IF EXISTS (
    SELECT 1 FROM public.user_daily_challenges 
    WHERE user_id = p_user_id AND challenge_id = p_challenge_id AND answered = true
  ) THEN
    RETURN jsonb_build_object('error', 'Already answered');
  END IF;
  
  -- Verificar se resposta está correta
  was_correct := (p_user_answer = challenge_data.correct_answer);
  
  -- Dar RadCoins apenas se acertou
  IF was_correct THEN
    PERFORM public.award_radcoins(
      p_user_id,
      radcoins_awarded,
      'daily_challenge',
      jsonb_build_object('challenge_id', p_challenge_id, 'date', challenge_data.challenge_date)
    );
  ELSE
    radcoins_awarded := 0;
  END IF;
  
  -- Registrar resposta com campos qualificados explicitamente
  INSERT INTO public.user_daily_challenges (user_id, challenge_id, answered, user_answer, was_correct)
  VALUES (p_user_id, p_challenge_id, true, p_user_answer, was_correct)
  ON CONFLICT (user_id, challenge_id) DO UPDATE SET
    answered = EXCLUDED.answered,
    user_answer = EXCLUDED.user_answer,
    was_correct = EXCLUDED.was_correct,
    answered_at = now();
  
  -- Atualizar estatísticas da comunidade
  UPDATE public.daily_challenges
  SET community_stats = jsonb_build_object(
    'total_responses', 
    COALESCE((community_stats->>'total_responses')::integer, 0) + 1,
    'correct_responses',
    COALESCE((community_stats->>'correct_responses')::integer, 0) + CASE WHEN was_correct THEN 1 ELSE 0 END
  )
  WHERE id = p_challenge_id;
  
  -- Buscar estatísticas atualizadas
  SELECT community_stats INTO challenge_data.community_stats
  FROM public.daily_challenges
  WHERE id = p_challenge_id;
  
  -- Construir resultado
  result := jsonb_build_object(
    'was_correct', was_correct,
    'correct_answer', challenge_data.correct_answer,
    'explanation', challenge_data.explanation,
    'community_stats', challenge_data.community_stats,
    'radcoins_awarded', radcoins_awarded
  );
  
  RETURN result;
END;
$$;