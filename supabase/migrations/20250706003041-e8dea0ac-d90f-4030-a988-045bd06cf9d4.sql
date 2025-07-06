-- SISTEMA UNIFICADO DE ANALYTICS DOS DESAFIOS DIÁRIOS
-- Remove duplicação e cria função inteligente única

-- 1. CRIAR FUNÇÃO UNIFICADA
CREATE OR REPLACE FUNCTION get_challenge_analytics_unified(
  p_historical boolean DEFAULT false,
  p_date_from date DEFAULT NULL,
  p_date_to date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  total_questions INTEGER;
  approved_questions INTEGER;
  pending_questions INTEGER;
  published_questions INTEGER;
  avg_confidence NUMERIC;
  total_responses INTEGER;
  correct_responses INTEGER;
  accuracy_rate NUMERIC;
  weekly_generated INTEGER;
  monthly_generated INTEGER;
  pool_health TEXT;
  last_generation DATE;
  next_schedule DATE;
  date_filter_start DATE;
  date_filter_end DATE;
BEGIN
  -- Definir filtros de data
  IF p_historical THEN
    date_filter_start := COALESCE(p_date_from, CURRENT_DATE - INTERVAL '30 days');
    date_filter_end := COALESCE(p_date_to, CURRENT_DATE);
  ELSE
    -- Para dashboard: últimos 30 dias
    date_filter_start := CURRENT_DATE - INTERVAL '30 days';
    date_filter_end := CURRENT_DATE;
  END IF;

  -- Contar questões por status (com filtro opcional)
  SELECT COUNT(*) INTO total_questions 
  FROM daily_quiz_questions 
  WHERE (NOT p_historical OR created_at::date BETWEEN date_filter_start AND date_filter_end);
  
  SELECT COUNT(*) INTO approved_questions 
  FROM daily_quiz_questions 
  WHERE status = 'approved' 
    AND (NOT p_historical OR created_at::date BETWEEN date_filter_start AND date_filter_end);
  
  SELECT COUNT(*) INTO pending_questions 
  FROM daily_quiz_questions 
  WHERE status = 'pending'
    AND (NOT p_historical OR created_at::date BETWEEN date_filter_start AND date_filter_end);
  
  SELECT COUNT(*) INTO published_questions 
  FROM daily_quiz_questions 
  WHERE status = 'published'
    AND (NOT p_historical OR created_at::date BETWEEN date_filter_start AND date_filter_end);
  
  -- Confiança média das questões aprovadas
  SELECT AVG(ai_confidence) INTO avg_confidence 
  FROM daily_quiz_questions 
  WHERE status = 'approved' AND ai_confidence IS NOT NULL
    AND (NOT p_historical OR created_at::date BETWEEN date_filter_start AND date_filter_end);
  
  -- Estatísticas de respostas dos usuários
  SELECT COUNT(*), SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)
  INTO total_responses, correct_responses
  FROM daily_quiz_user_log
  WHERE (NOT p_historical OR answered_at::date BETWEEN date_filter_start AND date_filter_end);
  
  -- Calcular taxa de acerto
  accuracy_rate := CASE 
    WHEN total_responses > 0 THEN (correct_responses::NUMERIC / total_responses) * 100
    ELSE 0 
  END;
  
  -- Questões geradas na última semana e mês
  SELECT COUNT(*) INTO weekly_generated 
  FROM daily_quiz_questions 
  WHERE created_at >= NOW() - INTERVAL '7 days'
    AND (NOT p_historical OR created_at::date BETWEEN date_filter_start AND date_filter_end);
  
  SELECT COUNT(*) INTO monthly_generated 
  FROM daily_quiz_questions 
  WHERE created_at >= NOW() - INTERVAL '30 days'
    AND (NOT p_historical OR created_at::date BETWEEN date_filter_start AND date_filter_end);
  
  -- Status do pool (apenas para dashboard)
  IF NOT p_historical THEN
    pool_health := CASE 
      WHEN approved_questions >= 10 THEN 'excellent'
      WHEN approved_questions >= 5 THEN 'good'
      WHEN approved_questions >= 3 THEN 'warning'
      ELSE 'critical'
    END;
    
    -- Última geração e próximo agendamento
    SELECT MAX(created_at::DATE) INTO last_generation FROM daily_quiz_questions;
    next_schedule := CURRENT_DATE + 1;
  ELSE
    pool_health := 'good'; -- Neutro para histórico
    last_generation := date_filter_end;
    next_schedule := date_filter_end;
  END IF;
  
  -- Montar resultado
  result := jsonb_build_object(
    'total_questions', total_questions,
    'approved_questions', approved_questions,
    'pending_questions', pending_questions,
    'published_questions', published_questions,
    'avg_confidence', COALESCE(avg_confidence, 0),
    'total_responses', total_responses,
    'correct_responses', correct_responses,
    'accuracy_rate', accuracy_rate,
    'weekly_generated', weekly_generated,
    'monthly_generated', monthly_generated,
    'pool_health', pool_health,
    'last_generation', last_generation,
    'next_schedule', next_schedule,
    'generation_trend', jsonb_build_object(
      'this_week', weekly_generated,
      'last_week', (SELECT COUNT(*) FROM daily_quiz_questions 
                   WHERE created_at BETWEEN NOW() - INTERVAL '14 days' 
                   AND NOW() - INTERVAL '7 days'
                   AND (NOT p_historical OR created_at::date BETWEEN date_filter_start AND date_filter_end)),
      'this_month', monthly_generated
    ),
    'automation_status', jsonb_build_object(
      'cron_active', true,
      'last_maintenance', (SELECT MAX(created_at) FROM automation_logs WHERE operation_type = 'pool_maintenance'),
      'next_publish', next_schedule,
      'system_health', pool_health
    ),
    -- Metadados do filtro aplicado
    'filter_metadata', jsonb_build_object(
      'is_historical', p_historical,
      'date_from', date_filter_start,
      'date_to', date_filter_end,
      'generated_at', NOW()
    )
  );
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'ERRO na função get_challenge_analytics_unified: % - %', SQLSTATE, SQLERRM;
  RETURN jsonb_build_object('error', SQLERRM, 'code', SQLSTATE);
END;
$$;

-- 2. REMOVER FUNÇÕES ANTIGAS (DUPLICADAS)
DROP FUNCTION IF EXISTS get_challenge_analytics();
DROP FUNCTION IF EXISTS get_challenge_analytics(date, date);

-- 3. LOG DA OPERAÇÃO
INSERT INTO automation_logs (operation_type, status, details)
VALUES (
  'function_unification',
  'completed',
  jsonb_build_object(
    'action', 'unified_challenge_analytics_functions',
    'old_functions_removed', 2,
    'new_unified_function', 'get_challenge_analytics_unified',
    'timestamp', NOW()
  )
);