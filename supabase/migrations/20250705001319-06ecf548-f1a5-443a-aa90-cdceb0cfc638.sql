-- CORREÇÃO EMERGENCIAL: Adicionar constraint único em event_rankings
-- Primeiro, limpar dados duplicados se existirem
DELETE FROM public.event_rankings er1 
WHERE EXISTS (
  SELECT 1 FROM public.event_rankings er2 
  WHERE er2.event_id = er1.event_id 
    AND er2.user_id = er1.user_id 
    AND er2.id > er1.id
);

-- Adicionar constraint único para evitar duplicatas
ALTER TABLE public.event_rankings 
DROP CONSTRAINT IF EXISTS unique_event_user_ranking;

ALTER TABLE public.event_rankings 
ADD CONSTRAINT unique_event_user_ranking 
UNIQUE (event_id, user_id);

-- Corrigir função update_event_progress para usar UPSERT seguro
CREATE OR REPLACE FUNCTION public.update_event_progress(p_event_id uuid, p_case_correct boolean, p_points_earned integer, p_time_spent integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  progress_record RECORD;
  new_rank integer;
  result jsonb;
BEGIN
  -- Buscar progresso atual
  SELECT * INTO progress_record
  FROM public.user_event_progress
  WHERE user_id = auth.uid() AND event_id = p_event_id AND status = 'in_progress';
  
  IF progress_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Progress not found or event not started');
  END IF;
  
  -- Atualizar progresso
  UPDATE public.user_event_progress
  SET 
    cases_completed = cases_completed + 1,
    cases_correct = cases_correct + CASE WHEN p_case_correct THEN 1 ELSE 0 END,
    current_score = current_score + p_points_earned,
    time_spent_seconds = time_spent_seconds + p_time_spent,
    current_case_index = current_case_index + 1,
    last_activity_at = now(),
    updated_at = now()
  WHERE id = progress_record.id;
  
  -- CORREÇÃO: UPSERT seguro no ranking
  INSERT INTO public.event_rankings (event_id, user_id, score, updated_at)
  VALUES (p_event_id, auth.uid(), progress_record.current_score + p_points_earned, now())
  ON CONFLICT (event_id, user_id) DO UPDATE SET
    score = EXCLUDED.score,
    updated_at = now();
  
  -- Recalcular ranks para todos os usuários do evento
  WITH ranked_users AS (
    SELECT user_id, 
           ROW_NUMBER() OVER (ORDER BY score DESC, updated_at ASC) as new_rank
    FROM public.event_rankings
    WHERE event_id = p_event_id
  )
  UPDATE public.event_rankings er
  SET rank = ru.new_rank
  FROM ranked_users ru
  WHERE er.event_id = p_event_id AND er.user_id = ru.user_id;
  
  -- Buscar novo rank do usuário
  SELECT rank INTO new_rank
  FROM public.event_rankings
  WHERE event_id = p_event_id AND user_id = auth.uid();
  
  -- Retornar resultado
  result := jsonb_build_object(
    'success', true,
    'cases_completed', progress_record.cases_completed + 1,
    'cases_correct', progress_record.cases_correct + CASE WHEN p_case_correct THEN 1 ELSE 0 END,
    'new_score', progress_record.current_score + p_points_earned,
    'new_rank', COALESCE(new_rank, 999),
    'points_earned', p_points_earned
  );
  
  RETURN result;
END;
$$;