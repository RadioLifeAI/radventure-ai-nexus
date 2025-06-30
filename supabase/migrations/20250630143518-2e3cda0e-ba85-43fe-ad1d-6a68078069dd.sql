
-- 1. Primeiro, adicionar o enum que está faltando para evitar erros silenciosos
DO $$ BEGIN
    -- Verificar se o tipo radcoin_tx_type existe e adicionar valores se necessário
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'radcoin_tx_type') THEN
        -- Adicionar 'ai_chat_usage' se não existir
        BEGIN
            ALTER TYPE radcoin_tx_type ADD VALUE IF NOT EXISTS 'ai_chat_usage';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    ELSE
        -- Criar o tipo se não existir
        CREATE TYPE radcoin_tx_type AS ENUM (
            'case_completion', 
            'event_reward', 
            'subscription_purchase', 
            'admin_bonus', 
            'penalty',
            'daily_login',
            'ai_chat_usage'
        );
    END IF;
END $$;

-- 2. Remover funções duplicadas de process_case_completion (manter apenas a mais recente)
DROP FUNCTION IF EXISTS public.process_case_completion(uuid, integer, boolean);
DROP FUNCTION IF EXISTS public.process_case_completion(uuid, integer);

-- 3. Criar a versão final e limpa da função process_case_completion
-- Esta versão dará APENAS pontos para casos, ZERO RadCoins
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
$$;

-- 4. Função para sincronizar pontos totais (caso haja inconsistências)
CREATE OR REPLACE FUNCTION public.sync_user_total_points(p_user_id uuid DEFAULT NULL)
RETURNS TABLE(user_id uuid, old_points integer, new_points integer, difference integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record record;
BEGIN
  -- Se não especificar usuário, processar todos
  FOR user_record IN 
    SELECT p.id, p.total_points as current_points,
           COALESCE(SUM(uch.points), 0) as calculated_points
    FROM profiles p
    LEFT JOIN user_case_history uch ON p.id = uch.user_id
    WHERE (p_user_id IS NULL OR p.id = p_user_id)
    GROUP BY p.id, p.total_points
  LOOP
    -- Só atualizar se houver diferença
    IF user_record.current_points != user_record.calculated_points THEN
      UPDATE profiles 
      SET total_points = user_record.calculated_points,
          updated_at = NOW()
      WHERE id = user_record.id;
      
      -- Retornar resultado
      RETURN QUERY SELECT 
        user_record.id,
        user_record.current_points,
        user_record.calculated_points,
        (user_record.calculated_points - user_record.current_points);
    END IF;
  END LOOP;
END;
$$;

-- 5. Função para verificar integridade do sistema de pontos
CREATE OR REPLACE FUNCTION public.validate_points_system()
RETURNS TABLE(
  check_name text,
  status text,
  details text,
  count_affected integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check 1: Usuários com pontos inconsistentes
  RETURN QUERY
  SELECT 
    'Pontos Inconsistentes'::text,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'PROBLEMA' END::text,
    'Usuários com total_points diferente da soma do histórico'::text,
    COUNT(*)::integer
  FROM (
    SELECT p.id
    FROM profiles p
    LEFT JOIN (
      SELECT user_id, SUM(points) as total_from_history
      FROM user_case_history 
      GROUP BY user_id
    ) h ON p.id = h.user_id
    WHERE p.total_points != COALESCE(h.total_from_history, 0)
  ) inconsistent;
  
  -- Check 2: Casos com pontos mas não corretos
  RETURN QUERY
  SELECT 
    'Pontos sem Acerto'::text,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'PROBLEMA' END::text,
    'Histórico com pontos mas is_correct = false'::text,
    COUNT(*)::integer
  FROM user_case_history 
  WHERE points > 0 AND is_correct = false;
  
  -- Check 3: Revisões com pontos
  RETURN QUERY
  SELECT 
    'Revisões com Pontos'::text,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'PROBLEMA' END::text,
    'Revisões que deram pontos (deveria ser 0)'::text,
    COUNT(*)::integer
  FROM user_case_history 
  WHERE review_count > 0 AND points > 0;
END;
$$;
