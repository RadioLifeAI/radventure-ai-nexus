-- ETAPA 1: LIMPEZA DA FUNÇÃO SQL
-- Remover versão antiga da função process_case_completion se existir
-- e manter apenas a versão correta com 4 parâmetros

DROP FUNCTION IF EXISTS public.process_case_completion(uuid, uuid, integer);

-- Garantir que temos apenas a versão correta com 4 parâmetros
-- Esta é a versão que deve ser mantida:
CREATE OR REPLACE FUNCTION public.process_case_completion(
  p_user_id uuid, 
  p_case_id uuid, 
  p_points integer DEFAULT 1, 
  p_is_correct boolean DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  existing_history record;
  is_review boolean := false;
  new_review_count integer := 0;
  points_to_award integer := 0;
BEGIN
  -- Log da execução
  RAISE NOTICE 'Processando caso: user=%, case=%, points=%, correct=%', p_user_id, p_case_id, p_points, p_is_correct;
  
  -- Verificar se já existe histórico para este caso
  SELECT * INTO existing_history
  FROM user_case_history
  WHERE user_id = p_user_id AND case_id = p_case_id
  ORDER BY answered_at DESC
  LIMIT 1;
  
  IF existing_history IS NOT NULL THEN
    is_review := true;
    new_review_count := COALESCE(existing_history.review_count, 0) + 1;
    points_to_award := 0; -- ZERO pontos em revisões
    RAISE NOTICE 'Caso em revisão - zero pontos creditados';
  ELSE
    points_to_award := CASE WHEN p_is_correct THEN p_points ELSE 0 END;
    RAISE NOTICE 'Primeira tentativa - % pontos creditados', points_to_award;
  END IF;

  -- Registrar no histórico
  INSERT INTO user_case_history (user_id, case_id, is_correct, points, review_count)
  VALUES (p_user_id, p_case_id, p_is_correct, points_to_award, new_review_count);

  -- Atualizar pontos no perfil APENAS se não for revisão E acertou
  IF NOT is_review AND p_is_correct AND points_to_award > 0 THEN
    UPDATE profiles
    SET total_points = total_points + points_to_award,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RAISE NOTICE 'Perfil atualizado: +% pontos', points_to_award;
  END IF;
  
  -- IMPORTANTE: REMOVIDO COMPLETAMENTE award_radcoins
  -- RadCoins devem vir APENAS de eventos, perfil, login diário, etc.
  -- Casos médicos dão APENAS pontos
END;
$function$;