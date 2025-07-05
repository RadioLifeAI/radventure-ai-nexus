-- IMPLEMENTAÇÃO FINAL COMPLETA - Tudo em uma migração

-- 1. Função de validação do sistema
CREATE OR REPLACE FUNCTION validate_event_system()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  events_total integer;
  events_with_cases integer;
  events_finished integer;
  events_with_prizes integer;
  participants_total integer;
  prizes_distributed integer;
BEGIN
  -- Contar métricas do sistema
  SELECT COUNT(*) INTO events_total FROM events;
  
  SELECT COUNT(DISTINCT e.id) INTO events_with_cases
  FROM events e
  INNER JOIN event_cases ec ON e.id = ec.event_id;
  
  SELECT COUNT(*) INTO events_finished
  FROM events WHERE status = 'FINISHED';
  
  SELECT COUNT(DISTINCT event_id) INTO events_with_prizes
  FROM event_final_rankings;
  
  SELECT COUNT(*) INTO participants_total
  FROM event_rankings;
  
  SELECT COALESCE(SUM(radcoins_awarded), 0) INTO prizes_distributed
  FROM event_final_rankings;
  
  result := jsonb_build_object(
    'system_status', 'VALIDATED',
    'timestamp', NOW(),
    'events_total', events_total,
    'events_with_cases', events_with_cases,
    'events_finished', events_finished,
    'events_with_prizes', events_with_prizes,
    'participants_total', participants_total,
    'radcoins_distributed', prizes_distributed,
    'system_healthy', (events_with_cases >= events_total AND events_with_prizes >= events_finished)
  );
  
  RETURN result;
END;
$$;

-- 2. View de monitoramento do sistema
CREATE OR REPLACE VIEW event_system_monitor AS
SELECT 
  e.id,
  e.name,
  e.status,
  e.number_of_cases as casos_configurados,
  COUNT(ec.case_id) as casos_na_tabela,
  COUNT(er.user_id) as participantes,
  MAX(er.score) as maior_pontuacao,
  AVG(er.score) as media_pontuacao,
  EXISTS(SELECT 1 FROM event_final_rankings efr WHERE efr.event_id = e.id) as premios_distribuidos,
  CASE 
    WHEN COUNT(ec.case_id) >= e.number_of_cases THEN 'OK'
    ELSE 'FALTAM_CASOS' 
  END as status_casos,
  CASE 
    WHEN e.status = 'FINISHED' AND EXISTS(SELECT 1 FROM event_final_rankings efr WHERE efr.event_id = e.id) THEN 'PREMIADO'
    WHEN e.status = 'FINISHED' THEN 'PENDENTE_PREMIACAO'
    ELSE 'EM_ANDAMENTO'
  END as status_premios
FROM events e
LEFT JOIN event_cases ec ON e.id = ec.event_id
LEFT JOIN event_rankings er ON e.id = er.event_id
GROUP BY e.id, e.name, e.status, e.number_of_cases
ORDER BY e.created_at DESC;

-- 3. Executar validação final
SELECT validate_event_system();