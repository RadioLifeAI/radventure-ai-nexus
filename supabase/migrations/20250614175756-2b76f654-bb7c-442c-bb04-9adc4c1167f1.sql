
-- 1. Adiciona city e state no profile do usuário
ALTER TABLE public.profiles
  ADD COLUMN city text,
  ADD COLUMN state text;

-- 2. Função/trigger: Quando usuário resolver um caso, só aumenta pontos/statísticas, nunca RadCoin direto.
-- Esta função deve ser chamada via backend/workflow ou manualmente ao resolver o caso:

CREATE OR REPLACE FUNCTION public.process_case_completion(
  p_user_id uuid,
  p_case_id uuid,
  p_points integer DEFAULT 1 -- Pontos padrão ganhos na resolução do caso
)
RETURNS void AS $$
DECLARE
  already_answered integer;
BEGIN
  -- Verifica se já respondeu o caso para evitar duplicação
  SELECT COUNT(*) INTO already_answered
    FROM user_case_history
    WHERE user_id = p_user_id AND case_id = p_case_id;

  IF already_answered > 0 THEN
    RAISE NOTICE 'Usuário já respondeu este caso.';
    RETURN;
  END IF;

  -- Registra o histórico da resposta
  INSERT INTO user_case_history (user_id, case_id, is_correct, points)
    VALUES (p_user_id, p_case_id, true, p_points);

  -- Atualiza o total de pontos e desempenho no perfil
  UPDATE profiles
    SET total_points = total_points + p_points,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

