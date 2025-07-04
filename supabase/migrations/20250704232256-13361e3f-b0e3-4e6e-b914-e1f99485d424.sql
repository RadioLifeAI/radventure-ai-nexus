-- CORREÇÃO COMPLETA DAS FUNÇÕES DE EVENTOS
-- Corrigir função start_event_participation

CREATE OR REPLACE FUNCTION public.start_event_participation(p_event_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_data RECORD;
  progress_id uuid;
  result jsonb;
BEGIN
  -- Verificar se evento existe e está ativo
  SELECT * INTO event_data
  FROM public.events
  WHERE id = p_event_id AND status IN ('ACTIVE', 'SCHEDULED');
  
  IF event_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Event not found or not available');
  END IF;
  
  -- Verificar se usuário já está participando
  IF EXISTS (
    SELECT 1 FROM public.user_event_progress 
    WHERE user_id = auth.uid() AND event_id = p_event_id AND status = 'in_progress'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already participating in this event');
  END IF;
  
  -- Criar progresso inicial
  INSERT INTO public.user_event_progress (
    user_id, event_id, status, started_at, last_activity_at,
    cases_completed, cases_correct, current_score, time_spent_seconds, current_case_index
  ) VALUES (
    auth.uid(), p_event_id, 'in_progress', now(), now(),
    0, 0, 0, 0, 0
  ) RETURNING id INTO progress_id;
  
  -- Registrar participação se não existir
  INSERT INTO public.event_registrations (user_id, event_id, registered_at)
  VALUES (auth.uid(), p_event_id, now())
  ON CONFLICT (user_id, event_id) DO UPDATE SET
    registered_at = CASE 
      WHEN event_registrations.registered_at IS NULL 
      THEN EXCLUDED.registered_at 
      ELSE event_registrations.registered_at 
    END;
  
  result := jsonb_build_object(
    'success', true,
    'progress_id', progress_id,
    'event_id', p_event_id,
    'message', 'Event participation started successfully'
  );
  
  RETURN result;
END;
$$;

-- Corrigir função update_event_progress
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
  
  -- Atualizar ou inserir ranking
  INSERT INTO public.event_rankings (event_id, user_id, score, updated_at)
  VALUES (p_event_id, auth.uid(), progress_record.current_score + p_points_earned, now())
  ON CONFLICT (event_id, user_id) DO UPDATE SET
    score = EXCLUDED.score,
    updated_at = now();
  
  -- Calcular novo rank
  WITH ranked_users AS (
    SELECT user_id, 
           ROW_NUMBER() OVER (ORDER BY score DESC, updated_at ASC) as rank
    FROM public.event_rankings
    WHERE event_id = p_event_id
  )
  UPDATE public.event_rankings er
  SET rank = ru.rank
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

-- Garantir que a tabela user_event_progress existe
CREATE TABLE IF NOT EXISTS public.user_event_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  cases_completed integer DEFAULT 0,
  cases_correct integer DEFAULT 0,
  current_score integer DEFAULT 0,
  time_spent_seconds integer DEFAULT 0,
  status text DEFAULT 'in_progress',
  current_case_index integer DEFAULT 0,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  last_activity_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- RLS para user_event_progress
ALTER TABLE public.user_event_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own progress" ON public.user_event_progress;
CREATE POLICY "Users can manage their own progress"
  ON public.user_event_progress
  FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all progress" ON public.user_event_progress;
CREATE POLICY "Admins can view all progress"
  ON public.user_event_progress
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND type = 'ADMIN'));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_event_progress_user_event ON public.user_event_progress(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_user_event_progress_event ON public.user_event_progress(event_id);
CREATE INDEX IF NOT EXISTS idx_user_event_progress_status ON public.user_event_progress(status);

-- Garantir que event_rankings tenha constraint única
ALTER TABLE public.event_rankings 
DROP CONSTRAINT IF EXISTS unique_event_user_ranking;

ALTER TABLE public.event_rankings 
ADD CONSTRAINT unique_event_user_ranking 
UNIQUE (event_id, user_id);