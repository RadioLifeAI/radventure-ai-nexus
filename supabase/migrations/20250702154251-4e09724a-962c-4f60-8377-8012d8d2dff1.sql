
-- CORREÇÃO DEFINITIVA DO SISTEMA DE REVISÃO
-- ETAPA 1: CORRIGIR FUNÇÃO check_case_review_status

CREATE OR REPLACE FUNCTION public.check_case_review_status(p_user_id uuid, p_case_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  history_record record;
  result jsonb;
BEGIN
  -- CORREÇÃO CRÍTICA: Buscar apenas histórico VÁLIDO e COMPLETO
  SELECT * INTO history_record
  FROM public.user_case_history
  WHERE user_id = p_user_id 
    AND case_id = p_case_id
    AND is_correct IS NOT NULL  -- Garantir que a resposta foi registrada completamente
    AND points IS NOT NULL      -- Garantir que os pontos foram processados
  ORDER BY answered_at DESC
  LIMIT 1;
  
  IF history_record IS NULL THEN
    -- PRIMEIRA TENTATIVA: Caso nunca foi completado corretamente
    result := jsonb_build_object(
      'is_review', false,
      'first_attempt', true,
      'previous_answer', null,
      'previous_correct', null,
      'previous_points', null,
      'review_count', 0
    );
    
    RAISE NOTICE 'PRIMEIRA TENTATIVA detectada para user=% case=%', p_user_id, p_case_id;
  ELSE
    -- REVISÃO: Caso já foi completado anteriormente
    result := jsonb_build_object(
      'is_review', true,
      'first_attempt', false,
      'previous_answer', history_record.details->'selected_index',
      'previous_correct', history_record.is_correct,
      'previous_points', history_record.points,
      'review_count', COALESCE(history_record.review_count, 0),
      'answered_at', history_record.answered_at
    );
    
    RAISE NOTICE 'REVISÃO detectada para user=% case=% (review_count=%)', p_user_id, p_case_id, COALESCE(history_record.review_count, 0);
  END IF;
  
  RETURN result;
END;
$$;

-- ETAPA 2: AJUSTAR FUNÇÃO process_case_completion

CREATE OR REPLACE FUNCTION public.process_case_completion(
  p_user_id uuid, 
  p_case_id uuid, 
  p_points integer DEFAULT 1, 
  p_is_correct boolean DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_history record;
  is_review boolean := false;
  new_review_count integer := 0;
  points_to_award integer := 0;
BEGIN
  -- Log detalhado da execução
  RAISE NOTICE '🎯 INICIANDO process_case_completion: user=%, case=%, points=%, correct=%', p_user_id, p_case_id, p_points, p_is_correct;
  
  -- CORREÇÃO CRÍTICA: Verificar histórico VÁLIDO e COMPLETO
  SELECT * INTO existing_history
  FROM user_case_history
  WHERE user_id = p_user_id 
    AND case_id = p_case_id
    AND is_correct IS NOT NULL    -- Garantir resposta válida
    AND points IS NOT NULL        -- Garantir processamento completo
  ORDER BY answered_at DESC
  LIMIT 1;
  
  IF existing_history IS NOT NULL THEN
    -- CASO EM REVISÃO
    is_review := true;
    new_review_count := COALESCE(existing_history.review_count, 0) + 1;
    points_to_award := 0; -- ZERO pontos em revisões
    
    RAISE NOTICE '📝 REVISÃO DETECTADA: review_count anterior=%, novo=%, zero pontos', 
      COALESCE(existing_history.review_count, 0), new_review_count;
  ELSE
    -- PRIMEIRA TENTATIVA
    is_review := false;
    new_review_count := 0;
    points_to_award := CASE WHEN p_is_correct THEN p_points ELSE 0 END;
    
    RAISE NOTICE '⭐ PRIMEIRA TENTATIVA: % pontos creditados', points_to_award;
  END IF;

  -- Registrar no histórico com dados completos
  INSERT INTO user_case_history (
    user_id, case_id, is_correct, points, review_count,
    details, help_used
  ) VALUES (
    p_user_id, p_case_id, p_is_correct, points_to_award, new_review_count,
    jsonb_build_object(
      'is_review', is_review,
      'processed_at', NOW(),
      'points_calculation', jsonb_build_object(
        'base_points', p_points,
        'awarded_points', points_to_award,
        'is_correct', p_is_correct
      )
    ),
    '{}'::jsonb
  );

  -- Atualizar pontos no perfil APENAS se primeira tentativa E acertou
  IF NOT is_review AND p_is_correct AND points_to_award > 0 THEN
    UPDATE profiles
    SET total_points = total_points + points_to_award,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RAISE NOTICE '💰 PONTOS CREDITADOS: +% pontos no perfil', points_to_award;
  ELSE
    RAISE NOTICE '❌ PONTOS NÃO CREDITADOS: is_review=%, is_correct=%, points=%', is_review, p_is_correct, points_to_award;
  END IF;
  
  RAISE NOTICE '✅ PROCESSAMENTO CONCLUÍDO com sucesso';
END;
$$;

-- ETAPA 3: LIMPEZA DE DADOS INCONSISTENTES

-- Corrigir registros com review_count inconsistente
UPDATE user_case_history 
SET review_count = (
  SELECT COUNT(*) - 1 
  FROM user_case_history h2 
  WHERE h2.user_id = user_case_history.user_id 
    AND h2.case_id = user_case_history.case_id 
    AND h2.answered_at <= user_case_history.answered_at
    AND h2.is_correct IS NOT NULL
    AND h2.points IS NOT NULL
)
WHERE review_count IS NULL 
   OR review_count < 0;

-- Log de correção
INSERT INTO public.system_settings (key, value, updated_at)
VALUES (
  'review_system_fixed',
  jsonb_build_object(
    'fixed_at', now(),
    'changes', 'Fixed check_case_review_status and process_case_completion logic, cleaned inconsistent data'
  ),
  now()
)
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = EXCLUDED.updated_at;
