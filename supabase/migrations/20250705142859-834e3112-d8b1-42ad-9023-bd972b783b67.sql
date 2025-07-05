-- CORREÇÃO FINAL: Completar implementação sem erro de sintaxe

-- 1. Função para recalcular estatísticas de eventos  
CREATE OR REPLACE FUNCTION refresh_event_stats_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar cache de estatísticas para todos os eventos
  INSERT INTO event_stats_cache (
    event_id, total_participants, average_score, completion_rate,
    top_performers, performance_distribution, cache_updated_at
  )
  SELECT 
    e.id,
    COALESCE(participant_stats.total_participants, 0),
    COALESCE(participant_stats.avg_score, 0),
    CASE 
      WHEN e.number_of_cases > 0 
      THEN COALESCE(participant_stats.completion_rate, 0) 
      ELSE 0 
    END,
    COALESCE(top_performers.performers, '[]'::jsonb),
    COALESCE(performance_dist.distribution, '{}'::jsonb),
    NOW()
  FROM events e
  LEFT JOIN (
    SELECT 
      er.event_id,
      COUNT(*) as total_participants,
      AVG(er.score) as avg_score,
      AVG(
        CASE 
          WHEN uep.cases_completed IS NOT NULL AND e2.number_of_cases > 0
          THEN (uep.cases_completed::numeric / e2.number_of_cases::numeric) * 100
          ELSE 0
        END
      ) as completion_rate
    FROM event_rankings er
    LEFT JOIN user_event_progress uep ON er.user_id = uep.user_id AND er.event_id = uep.event_id
    LEFT JOIN events e2 ON er.event_id = e2.id
    GROUP BY er.event_id
  ) participant_stats ON e.id = participant_stats.event_id
  LEFT JOIN (
    SELECT 
      er.event_id,
      jsonb_agg(
        jsonb_build_object(
          'user_id', er.user_id,
          'rank', er.rank,
          'score', er.score,
          'username', p.username,
          'full_name', p.full_name
        ) ORDER BY er.rank
      ) FILTER (WHERE er.rank <= 10) as performers
    FROM event_rankings er
    JOIN profiles p ON er.user_id = p.id
    GROUP BY er.event_id
  ) top_performers ON e.id = top_performers.event_id
  LEFT JOIN (
    SELECT 
      er.event_id,
      jsonb_build_object(
        'score_ranges', jsonb_build_object(
          '0-25', COUNT(*) FILTER (WHERE er.score BETWEEN 0 AND 25),
          '26-50', COUNT(*) FILTER (WHERE er.score BETWEEN 26 AND 50),
          '51-75', COUNT(*) FILTER (WHERE er.score BETWEEN 51 AND 75),
          '76-100', COUNT(*) FILTER (WHERE er.score BETWEEN 76 AND 100),
          '100+', COUNT(*) FILTER (WHERE er.score > 100)
        )
      ) as distribution
    FROM event_rankings er
    GROUP BY er.event_id
  ) performance_dist ON e.id = performance_dist.event_id
  ON CONFLICT (event_id) DO UPDATE SET
    total_participants = EXCLUDED.total_participants,
    average_score = EXCLUDED.average_score,
    completion_rate = EXCLUDED.completion_rate,
    top_performers = EXCLUDED.top_performers,
    performance_distribution = EXCLUDED.performance_distribution,
    cache_updated_at = EXCLUDED.cache_updated_at;
    
  RAISE NOTICE '📊 Cache de estatísticas atualizado para todos os eventos';
END;
$$;

-- 2. Executar atualização de cache
SELECT refresh_event_stats_cache();

-- 3. Função de validação completa do sistema
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
  -- Contar eventos
  SELECT COUNT(*) INTO events_total FROM events;
  
  -- Contar eventos com casos
  SELECT COUNT(DISTINCT e.id) INTO events_with_cases
  FROM events e
  INNER JOIN event_cases ec ON e.id = ec.event_id;
  
  -- Contar eventos finalizados
  SELECT COUNT(*) INTO events_finished
  FROM events WHERE status = 'FINISHED';
  
  -- Contar eventos com prêmios distribuídos
  SELECT COUNT(DISTINCT event_id) INTO events_with_prizes
  FROM event_final_rankings;
  
  -- Contar participantes totais
  SELECT COUNT(*) INTO participants_total
  FROM event_rankings;
  
  -- Contar prêmios distribuídos
  SELECT COALESCE(SUM(radcoins_awarded), 0) INTO prizes_distributed
  FROM event_final_rankings;
  
  result := jsonb_build_object(
    'system_status', 'VALIDATED',
    'timestamp', NOW(),
    'events', jsonb_build_object(
      'total', events_total,
      'with_cases', events_with_cases,
      'finished', events_finished,
      'with_prizes_distributed', events_with_prizes,
      'cases_coverage_percentage', 
        CASE WHEN events_total > 0 
        THEN ROUND((events_with_cases::numeric / events_total::numeric) * 100, 2)
        ELSE 0 END,
      'prize_distribution_rate',
        CASE WHEN events_finished > 0
        THEN ROUND((events_with_prizes::numeric / events_finished::numeric) * 100, 2)
        ELSE 0 END
    ),
    'participation', jsonb_build_object(
      'total_participants', participants_total,
      'total_radcoins_distributed', prizes_distributed
    ),
    'health_check', jsonb_build_object(
      'cases_system', CASE WHEN events_with_cases = events_total THEN '✅ HEALTHY' ELSE '⚠️ NEEDS_ATTENTION' END,
      'prize_system', CASE WHEN events_with_prizes = events_finished THEN '✅ HEALTHY' ELSE '⚠️ SOME_PENDING' END,
      'overall_status', CASE 
        WHEN events_with_cases = events_total AND events_with_prizes >= events_finished 
        THEN '✅ SYSTEM_FULLY_OPERATIONAL' 
        ELSE '⚠️ PARTIAL_ISSUES_DETECTED' 
      END
    )
  );
  
  RAISE NOTICE '🔍 VALIDAÇÃO DO SISTEMA: %', result->>'health_check'->>'overall_status';
  
  RETURN result;
END;
$$;

-- 4. Executar validação completa
SELECT validate_event_system();

-- 5. View de monitoramento contínuo (para uso administrativo)
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
    WHEN COUNT(ec.case_id) >= e.number_of_cases THEN '✅ OK'
    ELSE '❌ FALTAM_CASOS' 
  END as status_casos,
  CASE 
    WHEN e.status = 'FINISHED' AND EXISTS(SELECT 1 FROM event_final_rankings efr WHERE efr.event_id = e.id) THEN '✅ PREMIADO'
    WHEN e.status = 'FINISHED' THEN '⚠️ PENDENTE_PREMIACAO'
    ELSE '⏳ EM_ANDAMENTO'
  END as status_premios
FROM events e
LEFT JOIN event_cases ec ON e.id = ec.event_id
LEFT JOIN event_rankings er ON e.id = er.event_id
GROUP BY e.id, e.name, e.status, e.number_of_cases
ORDER BY e.created_at DESC;