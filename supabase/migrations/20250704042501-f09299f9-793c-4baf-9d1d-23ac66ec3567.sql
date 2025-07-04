-- FASE 1: CONFIGURAÇÃO DE AUTOMAÇÃO
-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Função para auto-agendamento inteligente de questões
CREATE OR REPLACE FUNCTION auto_schedule_daily_questions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  questions_needed INTEGER := 0;
  question_record RECORD;
  schedule_date DATE;
  days_ahead INTEGER := 1;
BEGIN
  -- Verificar quantas questões precisamos agendar (próximos 7 dias)
  FOR i IN 1..7 LOOP
    schedule_date := CURRENT_DATE + i;
    
    -- Verificar se já existe questão agendada para esta data
    IF NOT EXISTS (
      SELECT 1 FROM daily_quiz_questions 
      WHERE published_date = schedule_date
    ) THEN
      questions_needed := questions_needed + 1;
    END IF;
  END LOOP;
  
  -- Agendar questões aprovadas para as datas sem questões
  IF questions_needed > 0 THEN
    FOR question_record IN (
      SELECT * FROM daily_quiz_questions 
      WHERE status = 'approved' 
        AND published_date IS NULL 
      ORDER BY ai_confidence DESC, created_at ASC
      LIMIT questions_needed
    ) LOOP
      -- Encontrar próxima data disponível
      schedule_date := CURRENT_DATE + days_ahead;
      WHILE EXISTS (
        SELECT 1 FROM daily_quiz_questions 
        WHERE published_date = schedule_date
      ) LOOP
        days_ahead := days_ahead + 1;
        schedule_date := CURRENT_DATE + days_ahead;
      END LOOP;
      
      -- Agendar questão
      UPDATE daily_quiz_questions 
      SET published_date = schedule_date,
          status = 'scheduled'
      WHERE id = question_record.id;
      
      days_ahead := days_ahead + 1;
    END LOOP;
  END IF;
  
  -- Log da operação
  RAISE NOTICE 'Auto-agendamento: % questões agendadas', questions_needed;
END;
$$;

-- Função para auto-publicação diária
CREATE OR REPLACE FUNCTION auto_publish_daily_challenge()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  question_record RECORD;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Verificar se já existe desafio para hoje
  IF EXISTS (
    SELECT 1 FROM daily_challenges 
    WHERE challenge_date = today_date AND is_active = true
  ) THEN
    RAISE NOTICE 'Desafio já existe para hoje: %', today_date;
    RETURN;
  END IF;
  
  -- Buscar questão agendada para hoje
  SELECT * INTO question_record
  FROM daily_quiz_questions 
  WHERE published_date = today_date 
    AND status IN ('scheduled', 'approved')
  ORDER BY ai_confidence DESC
  LIMIT 1;
  
  IF question_record IS NOT NULL THEN
    -- Publicar na tabela daily_challenges
    INSERT INTO daily_challenges (
      external_id,
      question,
      correct_answer,
      explanation,
      challenge_date,
      community_stats,
      is_active
    ) VALUES (
      'auto-' || question_record.id,
      question_record.question,
      question_record.correct_answer,
      question_record.explanation,
      today_date,
      '{"total_responses": 0, "correct_responses": 0}'::jsonb,
      true
    );
    
    -- Marcar questão como publicada
    UPDATE daily_quiz_questions 
    SET status = 'published'
    WHERE id = question_record.id;
    
    RAISE NOTICE 'Desafio publicado automaticamente: %', question_record.question;
  ELSE
    RAISE WARNING 'Nenhuma questão disponível para publicar hoje: %', today_date;
  END IF;
END;
$$;

-- Função para manter pool de questões sempre abastecido
CREATE OR REPLACE FUNCTION maintain_question_pool()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  approved_count INTEGER;
  generation_needed INTEGER;
  specialties TEXT[] := ARRAY['Cardiologia', 'Pneumologia', 'Neurologia', 'Radiologia', 'Dermatologia'];
  specialty TEXT;
BEGIN
  -- Contar questões aprovadas disponíveis
  SELECT COUNT(*) INTO approved_count
  FROM daily_quiz_questions 
  WHERE status = 'approved' AND published_date IS NULL;
  
  -- Se temos menos de 5 questões, precisamos gerar mais
  IF approved_count < 5 THEN
    generation_needed := 10 - approved_count; -- Manter pool de 10 questões
    
    -- Gerar questões balanceadas por especialidade
    FOR i IN 1..generation_needed LOOP
      specialty := specialties[((i - 1) % array_length(specialties, 1)) + 1];
      
      -- Chamar função de geração via HTTP (será implementada)
      PERFORM net.http_post(
        url := 'https://zyrbkxkxdznyhrpudhrk.supabase.co/functions/v1/generate-daily-challenge',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5cmJreGt4ZHpueWhycHVkaHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MjA5NjgsImV4cCI6MjA2NTQ5Njk2OH0.iq9Guu8t_0Z3dtqtm-q0lCOAEwBTXACfZ79FPoOKQoc"}'::jsonb,
        body := jsonb_build_object(
          'mode', 'auto',
          'category', specialty
        )
      );
    END LOOP;
    
    RAISE NOTICE 'Pool de questões: gerando % novas questões', generation_needed;
  END IF;
END;
$$;

-- Configurar cron jobs para automação
-- Auto-agendamento diário às 23:00 (gerar questões para próximos dias)
SELECT cron.schedule(
  'auto-schedule-questions',
  '0 23 * * *',
  'SELECT auto_schedule_daily_questions();'
);

-- Auto-publicação diária às 06:00 (publicar questão do dia)
SELECT cron.schedule(
  'auto-publish-challenge',
  '0 6 * * *',
  'SELECT auto_publish_daily_challenge();'
);

-- Manutenção do pool às 22:00 (gerar novas questões se necessário)
SELECT cron.schedule(
  'maintain-question-pool',
  '0 22 * * *',
  'SELECT maintain_question_pool();'
);

-- Tabela para logs de automação
CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_type TEXT NOT NULL,
  status TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para logging de automação
CREATE OR REPLACE FUNCTION log_automation(
  p_operation_type TEXT,
  p_status TEXT,
  p_details JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO automation_logs (operation_type, status, details)
  VALUES (p_operation_type, p_status, p_details);
END;
$$;