-- Função para atualização automática do status dos eventos
CREATE OR REPLACE FUNCTION public.auto_update_event_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  events_started INTEGER := 0;
  events_finished INTEGER := 0;
  result jsonb;
BEGIN
  -- Iniciar eventos agendados que devem começar agora
  UPDATE public.events 
  SET status = 'ACTIVE', updated_at = NOW()
  WHERE status = 'SCHEDULED' 
    AND auto_start = true
    AND scheduled_start <= NOW()
    AND scheduled_end > NOW();
  
  GET DIAGNOSTICS events_started = ROW_COUNT;
  
  -- Finalizar eventos ativos que já passaram do prazo
  UPDATE public.events 
  SET status = 'FINISHED', updated_at = NOW()
  WHERE status = 'ACTIVE' 
    AND scheduled_end <= NOW();
    
  GET DIAGNOSTICS events_finished = ROW_COUNT;
  
  -- Log da operação
  IF events_started > 0 OR events_finished > 0 THEN
    RAISE NOTICE '🤖 AUTOMAÇÃO EVENTOS: % iniciados, % finalizados em %', 
      events_started, events_finished, NOW();
  END IF;
  
  result := jsonb_build_object(
    'events_started', events_started,
    'events_finished', events_finished,
    'timestamp', NOW()
  );
  
  RETURN result;
END;
$$;

-- Agendar execução automática a cada 5 minutos
SELECT cron.schedule(
  'auto-update-events-status',
  '*/5 * * * *', -- A cada 5 minutos
  $$
  SELECT public.auto_update_event_status();
  $$
);

-- Executar uma vez agora para corrigir eventos atrasados
SELECT public.auto_update_event_status();