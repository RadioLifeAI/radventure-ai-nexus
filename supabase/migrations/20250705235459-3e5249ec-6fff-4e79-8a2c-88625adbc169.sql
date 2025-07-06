-- Função para analytics reais dos desafios diários
CREATE OR REPLACE FUNCTION get_challenge_analytics()
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
BEGIN
  -- Contar questões por status
  SELECT COUNT(*) INTO total_questions FROM daily_quiz_questions;
  SELECT COUNT(*) INTO approved_questions FROM daily_quiz_questions WHERE status = 'approved';
  SELECT COUNT(*) INTO pending_questions FROM daily_quiz_questions WHERE status = 'pending';
  SELECT COUNT(*) INTO published_questions FROM daily_quiz_questions WHERE status = 'published';
  
  -- Confiança média das questões aprovadas
  SELECT AVG(ai_confidence) INTO avg_confidence 
  FROM daily_quiz_questions 
  WHERE status = 'approved' AND ai_confidence IS NOT NULL;
  
  -- Estatísticas de respostas dos usuários
  SELECT COUNT(*), SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)
  INTO total_responses, correct_responses
  FROM daily_quiz_user_log;
  
  -- Calcular taxa de acerto
  accuracy_rate := CASE 
    WHEN total_responses > 0 THEN (correct_responses::NUMERIC / total_responses) * 100
    ELSE 0 
  END;
  
  -- Questões geradas na última semana e mês
  SELECT COUNT(*) INTO weekly_generated 
  FROM daily_quiz_questions 
  WHERE created_at >= NOW() - INTERVAL '7 days';
  
  SELECT COUNT(*) INTO monthly_generated 
  FROM daily_quiz_questions 
  WHERE created_at >= NOW() - INTERVAL '30 days';
  
  -- Status do pool
  pool_health := CASE 
    WHEN approved_questions >= 10 THEN 'excellent'
    WHEN approved_questions >= 5 THEN 'good'
    WHEN approved_questions >= 3 THEN 'warning'
    ELSE 'critical'
  END;
  
  -- Última geração e próximo agendamento
  SELECT MAX(created_at::DATE) INTO last_generation FROM daily_quiz_questions;
  next_schedule := CURRENT_DATE + 1;
  
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
                   AND NOW() - INTERVAL '7 days'),
      'this_month', monthly_generated
    ),
    'automation_status', jsonb_build_object(
      'cron_active', true,
      'last_maintenance', (SELECT MAX(created_at) FROM automation_logs WHERE operation_type = 'pool_maintenance'),
      'next_publish', next_schedule,
      'system_health', pool_health
    )
  );
  
  RETURN result;
END;
$$;