-- CORREÇÃO: Constraint error fix e melhoria na função start_event_participation
-- Corrigir a função para tratar corretamente o conflict na tabela event_registrations

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
  
  -- Registrar participação se não existir (usar constraint específica)
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