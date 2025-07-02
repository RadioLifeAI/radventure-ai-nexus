
-- CORREÇÃO DEFINITIVA: Corrigir lógica de detecção de primeira tentativa vs revisão
-- PROBLEMA: A função está usando `points IS NOT NULL` que sempre é verdadeiro para registros válidos
-- SOLUÇÃO: Usar contagem de registros anteriores ou review_count para detectar revisão

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
  existing_count integer := 0;
  is_review boolean := false;
  new_review_count integer := 0;
  points_to_award integer := 0;
BEGIN
  -- Log detalhado da execução
  RAISE NOTICE '🎯 INICIANDO process_case_completion: user=%, case=%, points=%, correct=%', p_user_id, p_case_id, p_points, p_is_correct;
  
  -- CORREÇÃO CRÍTICA: Contar registros anteriores VÁLIDOS E COMPLETOS
  SELECT COUNT(*) INTO existing_count
  FROM user_case_history
  WHERE user_id = p_user_id 
    AND case_id = p_case_id
    AND is_correct IS NOT NULL    -- Garantir resposta válida
    AND points IS NOT NULL;       -- Garantir processamento completo
  
  -- LÓGICA CORRIGIDA: Se já existe pelo menos 1 registro válido, é revisão
  IF existing_count > 0 THEN
    -- CASO EM REVISÃO
    is_review := true;
    new_review_count := existing_count;  -- O número atual será o review_count
    points_to_award := 0; -- ZERO pontos em revisões
    
    RAISE NOTICE '📝 REVISÃO DETECTADA: registros anteriores=%, review_count=%, ZERO pontos', existing_count, new_review_count;
  ELSE
    -- PRIMEIRA TENTATIVA
    is_review := false;
    new_review_count := 0;
    points_to_award := CASE WHEN p_is_correct THEN p_points ELSE 0 END;
    
    RAISE NOTICE '⭐ PRIMEIRA TENTATIVA: % pontos serão creditados', points_to_award;
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
      'existing_records_before', existing_count,
      'points_calculation', jsonb_build_object(
        'base_points', p_points,
        'awarded_points', points_to_award,
        'is_correct', p_is_correct,
        'reason', CASE WHEN is_review THEN 'revisao_zero_pontos' ELSE 'primeira_tentativa' END
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
    
    RAISE NOTICE '💰 PONTOS CREDITADOS NO PERFIL: +% pontos', points_to_award;
  ELSE
    RAISE NOTICE '❌ PONTOS NÃO CREDITADOS: is_review=%, is_correct=%, points=%', is_review, p_is_correct, points_to_award;
  END IF;
  
  RAISE NOTICE '✅ PROCESSAMENTO CONCLUÍDO: primeira_tentativa=%, pontos_perfil=%', NOT is_review, points_to_award;
END;
$$;

-- CORREÇÃO COMPLEMENTAR: Ajustar também a função de check para usar a mesma lógica
CREATE OR REPLACE FUNCTION public.check_case_review_status(p_user_id uuid, p_case_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  history_record record;
  existing_count integer := 0;
  result jsonb;
BEGIN
  -- Contar registros válidos anteriores
  SELECT COUNT(*) INTO existing_count
  FROM public.user_case_history
  WHERE user_id = p_user_id 
    AND case_id = p_case_id
    AND is_correct IS NOT NULL
    AND points IS NOT NULL;
  
  -- Buscar o registro mais recente (se existir)
  SELECT * INTO history_record
  FROM public.user_case_history
  WHERE user_id = p_user_id 
    AND case_id = p_case_id
    AND is_correct IS NOT NULL
    AND points IS NOT NULL
  ORDER BY answered_at DESC
  LIMIT 1;
  
  IF existing_count = 0 THEN
    -- PRIMEIRA TENTATIVA: Nenhum registro válido encontrado
    result := jsonb_build_object(
      'is_review', false,
      'first_attempt', true,
      'previous_answer', null,
      'previous_correct', null,
      'previous_points', null,
      'review_count', 0
    );
    
    RAISE NOTICE 'PRIMEIRA TENTATIVA detectada para user=% case=% (count=%)', p_user_id, p_case_id, existing_count;
  ELSE
    -- REVISÃO: Já existe pelo menos 1 registro válido
    result := jsonb_build_object(
      'is_review', true,
      'first_attempt', false,
      'previous_answer', history_record.details->'selected_index',
      'previous_correct', history_record.is_correct,
      'previous_points', history_record.points,
      'review_count', existing_count,
      'answered_at', history_record.answered_at
    );
    
    RAISE NOTICE 'REVISÃO detectada para user=% case=% (count=%, review_count=%)', p_user_id, p_case_id, existing_count, existing_count;
  END IF;
  
  RETURN result;
END;
$$;

-- Log da correção aplicada
INSERT INTO public.system_settings (key, value, updated_at)
VALUES (
  'pontuacao_system_fixed_v2',
  jsonb_build_object(
    'fixed_at', now(),
    'issue', 'Primeira tentativa não creditava pontos devido à lógica incorreta',
    'solution', 'Corrigida detecção usando COUNT(*) em vez de points IS NOT NULL',
    'expected_behavior', 'Primeira tentativa correta = pontos creditados, Revisão = 0 pontos sempre'
  ),
  now()
)
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = EXCLUDED.updated_at;
