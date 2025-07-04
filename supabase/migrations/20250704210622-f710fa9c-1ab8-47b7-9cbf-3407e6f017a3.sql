-- SISTEMA COMPLETO DE RESOLUÇÃO DE EVENTOS

-- 1. Criar tabela para tracking de progresso dos usuários em eventos
CREATE TABLE IF NOT EXISTS public.user_event_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  event_id uuid NOT NULL,
  cases_completed integer NOT NULL DEFAULT 0,
  cases_correct integer NOT NULL DEFAULT 0,
  current_score integer NOT NULL DEFAULT 0,
  time_spent_seconds integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'in_progress',  -- 'in_progress', 'completed', 'abandoned'
  current_case_index integer NOT NULL DEFAULT 0,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  last_activity_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- 2. Habilitar RLS
ALTER TABLE public.user_event_progress ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS
CREATE POLICY "Users can view their own event progress"
ON public.user_event_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own event progress"
ON public.user_event_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own event progress"
ON public.user_event_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all event progress"
ON public.user_event_progress
FOR ALL
USING (is_admin(auth.uid()));

-- 4. Trigger para updated_at
CREATE TRIGGER update_user_event_progress_updated_at
BEFORE UPDATE ON public.user_event_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Função para iniciar participação em evento
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
  WHERE id = p_event_id AND status = 'ACTIVE';
  
  IF event_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Event not found or not active');
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
    user_id, event_id, status, started_at, last_activity_at
  ) VALUES (
    auth.uid(), p_event_id, 'in_progress', now(), now()
  ) RETURNING id INTO progress_id;
  
  -- Registrar participação se não existir
  INSERT INTO public.event_registrations (user_id, event_id)
  VALUES (auth.uid(), p_event_id)
  ON CONFLICT (user_id, event_id) DO NOTHING;
  
  result := jsonb_build_object(
    'success', true,
    'progress_id', progress_id,
    'event_id', p_event_id,
    'message', 'Event participation started successfully'
  );
  
  RETURN result;
END;
$$;

-- 6. Função para atualizar progresso do evento
CREATE OR REPLACE FUNCTION public.update_event_progress(
  p_event_id uuid,
  p_case_correct boolean,
  p_points_earned integer DEFAULT 0,
  p_time_spent integer DEFAULT 0
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_progress RECORD;
  new_score integer;
  new_rank integer;
BEGIN
  -- Buscar progresso atual
  SELECT * INTO current_progress
  FROM public.user_event_progress
  WHERE user_id = auth.uid() AND event_id = p_event_id AND status = 'in_progress';
  
  IF current_progress IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Event participation not found');
  END IF;
  
  -- Calcular nova pontuação
  new_score := current_progress.current_score + p_points_earned;
  
  -- Atualizar progresso
  UPDATE public.user_event_progress
  SET 
    cases_completed = cases_completed + 1,
    cases_correct = cases_correct + CASE WHEN p_case_correct THEN 1 ELSE 0 END,
    current_score = new_score,
    time_spent_seconds = time_spent_seconds + p_time_spent,
    current_case_index = current_case_index + 1,
    last_activity_at = now(),
    updated_at = now()
  WHERE user_id = auth.uid() AND event_id = p_event_id;
  
  -- Atualizar ou inserir ranking
  INSERT INTO public.event_rankings (user_id, event_id, score, updated_at)
  VALUES (auth.uid(), p_event_id, new_score, now())
  ON CONFLICT (user_id, event_id) DO UPDATE SET
    score = EXCLUDED.score,
    updated_at = EXCLUDED.updated_at;
  
  -- Recalcular rankings (rank)
  WITH ranked_scores AS (
    SELECT 
      user_id,
      ROW_NUMBER() OVER (ORDER BY score DESC, updated_at ASC) as new_rank
    FROM public.event_rankings
    WHERE event_id = p_event_id
  )
  UPDATE public.event_rankings er
  SET rank = rs.new_rank
  FROM ranked_scores rs
  WHERE er.user_id = rs.user_id AND er.event_id = p_event_id;
  
  -- Buscar novo rank do usuário
  SELECT rank INTO new_rank
  FROM public.event_rankings
  WHERE user_id = auth.uid() AND event_id = p_event_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'new_score', new_score,
    'new_rank', new_rank,
    'cases_completed', current_progress.cases_completed + 1,
    'cases_correct', current_progress.cases_correct + CASE WHEN p_case_correct THEN 1 ELSE 0 END
  );
END;
$$;