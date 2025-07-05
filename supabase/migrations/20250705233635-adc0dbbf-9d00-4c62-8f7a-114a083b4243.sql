-- Habilitar extensões necessárias para automação
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Limpar cron jobs existentes que possam estar quebrados
SELECT cron.unschedule(jobname) FROM cron.job WHERE jobname LIKE 'daily_%';

-- 1. CRON JOB: Publicar desafio diário às 6:00
SELECT cron.schedule(
  'daily_challenge_publish',
  '0 6 * * *', -- Todos os dias às 6:00
  $$
  SELECT net.http_post(
    url := 'https://zyrbkxkxdznyhrpudhrk.supabase.co/functions/v1/daily-challenge-generator',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5cmJreGt4ZHpueWhycHVkaHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MjA5NjgsImV4cCI6MjA2NTQ5Njk2OH0.iq9Guu8t_0Z3dtqtm-q0lCOAEwBTXACfZ79FPoOKQoc"}'::jsonb,
    body := '{"action": "publish_daily"}'::jsonb
  );
  $$
);

-- 2. CRON JOB: Gerar questões semanalmente aos domingos às 23:00
SELECT cron.schedule(
  'weekly_questions_generation',
  '0 23 * * 0', -- Domingos às 23:00
  $$
  SELECT net.http_post(
    url := 'https://zyrbkxkxdznyhrpudhrk.supabase.co/functions/v1/generate-daily-challenge',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5cmJreGt4ZHpueWhycHVkaHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MjA5NjgsImV4cCI6MjA2NTQ5Njk2OH0.iq9Guu8t_0Z3dtqtm-q0lCOAEwBTXACfZ79FPoOKQoc"}'::jsonb,
    body := '{"action": "weekly_batch", "count": 7}'::jsonb
  );
  $$
);

-- 3. CRON JOB: Manutenção do pool diariamente às 22:00
SELECT cron.schedule(
  'daily_pool_maintenance',
  '0 22 * * *', -- Todos os dias às 22:00
  $$
  SELECT net.http_post(
    url := 'https://zyrbkxkxdznyhrpudhrk.supabase.co/functions/v1/generate-daily-challenge',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5cmJreGt4ZHpueWhycHVkaHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MjA5NjgsImV4cCI6MjA2NTQ5Njk2OH0.iq9Guu8t_0Z3dtqtm-q0lCOAEwBTXACfZ79FPoOKQoc"}'::jsonb,
    body := '{"action": "maintain_pool"}'::jsonb
  );
  $$
);

-- Função para verificar status do pool de questões
CREATE OR REPLACE FUNCTION get_daily_challenge_pool_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  approved_count INTEGER;
  scheduled_count INTEGER;
  last_published DATE;
  result jsonb;
BEGIN
  -- Contar questões aprovadas não publicadas
  SELECT COUNT(*) INTO approved_count
  FROM daily_quiz_questions
  WHERE status = 'approved' 
    AND (published_date IS NULL OR published_date > CURRENT_DATE);
  
  -- Contar desafios já agendados para os próximos dias
  SELECT COUNT(*) INTO scheduled_count
  FROM daily_challenges
  WHERE challenge_date > CURRENT_DATE;
  
  -- Última data de publicação
  SELECT MAX(challenge_date) INTO last_published
  FROM daily_challenges;
  
  result := jsonb_build_object(
    'approved_questions', approved_count,
    'scheduled_challenges', scheduled_count,
    'last_published', COALESCE(last_published, CURRENT_DATE - 1),
    'pool_health', CASE 
      WHEN approved_count >= 7 THEN 'excellent'
      WHEN approved_count >= 5 THEN 'good'  
      WHEN approved_count >= 3 THEN 'warning'
      ELSE 'critical'
    END,
    'next_needed_date', CURRENT_DATE + 1,
    'cron_status', 'active'
  );
  
  RETURN result;
END;
$$;

-- Função para migrar questão aprovada para desafio diário
CREATE OR REPLACE FUNCTION publish_next_daily_challenge()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  question_record RECORD;
  challenge_date DATE := CURRENT_DATE;
  result jsonb;
BEGIN
  -- Verificar se já existe desafio para hoje
  IF EXISTS (SELECT 1 FROM daily_challenges WHERE challenge_date = challenge_date) THEN
    RETURN jsonb_build_object('error', 'Challenge already exists for today');
  END IF;
  
  -- Buscar próxima questão aprovada
  SELECT * INTO question_record
  FROM daily_quiz_questions
  WHERE status = 'approved' 
    AND (published_date IS NULL OR published_date > CURRENT_DATE)
  ORDER BY created_at ASC
  LIMIT 1;
  
  IF question_record IS NULL THEN
    RETURN jsonb_build_object('error', 'No approved questions available');
  END IF;
  
  -- Criar desafio diário
  INSERT INTO daily_challenges (
    external_id,
    question,
    correct_answer,
    explanation,
    challenge_date,
    community_stats
  ) VALUES (
    'auto-' || question_record.id::text,
    question_record.question,
    question_record.correct_answer,
    question_record.explanation,
    challenge_date,
    '{"total_responses": 0, "correct_responses": 0}'
  );
  
  -- Marcar questão como publicada
  UPDATE daily_quiz_questions
  SET published_date = challenge_date,
      status = 'published'
  WHERE id = question_record.id;
  
  -- Log da operação
  INSERT INTO automation_logs (operation_type, status, details)
  VALUES (
    'daily_challenge_publish',
    'success',
    jsonb_build_object(
      'question_id', question_record.id,
      'challenge_date', challenge_date,
      'automated', true
    )
  );
  
  result := jsonb_build_object(
    'success', true,
    'challenge_date', challenge_date,
    'question_id', question_record.id,
    'question', question_record.question
  );
  
  RETURN result;
END;
$$;