
-- Adicionar campo para controlar revisões na tabela user_case_history
ALTER TABLE public.user_case_history 
ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;

-- Criar função para verificar se um caso já foi resolvido pelo usuário
CREATE OR REPLACE FUNCTION public.check_case_review_status(p_user_id uuid, p_case_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  history_record record;
  result jsonb;
BEGIN
  -- Buscar histórico do caso para o usuário
  SELECT * INTO history_record
  FROM public.user_case_history
  WHERE user_id = p_user_id AND case_id = p_case_id
  ORDER BY answered_at DESC
  LIMIT 1;
  
  IF history_record IS NULL THEN
    -- Caso nunca foi resolvido
    result := jsonb_build_object(
      'is_review', false,
      'first_attempt', true,
      'previous_answer', null,
      'previous_correct', null,
      'previous_points', null,
      'review_count', 0
    );
  ELSE
    -- Caso já foi resolvido
    result := jsonb_build_object(
      'is_review', true,
      'first_attempt', false,
      'previous_answer', history_record.details->'selected_index',
      'previous_correct', history_record.is_correct,
      'previous_points', history_record.points,
      'review_count', COALESCE(history_record.review_count, 0),
      'answered_at', history_record.answered_at
    );
  END IF;
  
  RETURN result;
END;
$$;

-- Modificar função process_case_completion para suportar revisões
CREATE OR REPLACE FUNCTION public.process_case_completion(p_user_id uuid, p_case_id uuid, p_points integer DEFAULT 1, p_is_correct boolean DEFAULT true)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_history record;
  is_review boolean := false;
  new_review_count integer := 0;
BEGIN
  -- Verificar se já existe histórico para este caso
  SELECT * INTO existing_history
  FROM user_case_history
  WHERE user_id = p_user_id AND case_id = p_case_id
  ORDER BY answered_at DESC
  LIMIT 1;
  
  IF existing_history IS NOT NULL THEN
    is_review := true;
    new_review_count := COALESCE(existing_history.review_count, 0) + 1;
  END IF;

  -- Registra o histórico da resposta
  INSERT INTO user_case_history (user_id, case_id, is_correct, points, review_count)
  VALUES (p_user_id, p_case_id, p_is_correct, 
    CASE WHEN is_review THEN 0 ELSE p_points END, -- Zero pontos em revisões
    new_review_count);

  -- Atualiza pontos no perfil apenas se não for revisão
  IF NOT is_review AND p_points > 0 THEN
    UPDATE profiles
    SET total_points = total_points + p_points,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Dar RadCoins apenas se não for revisão
    IF p_is_correct THEN
      PERFORM award_radcoins(
        p_user_id,
        p_points,
        'case_completion',
        jsonb_build_object('case_id', p_case_id, 'review', false)
      );
    END IF;
  END IF;
END;
$$;
