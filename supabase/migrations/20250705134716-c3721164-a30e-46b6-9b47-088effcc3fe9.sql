-- MIGRAÇÃO PARA CORREÇÃO DO SISTEMA DE EVENTOS E PONTUAÇÃO

-- 1. Criar função para popular casos de eventos existentes
CREATE OR REPLACE FUNCTION populate_event_cases_from_filters()
RETURNS TABLE(
  event_id uuid,
  event_name text,
  cases_added integer,
  success boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_record RECORD;
  selected_cases RECORD[];
  case_record RECORD;
  case_count integer := 0;
  total_added integer := 0;
BEGIN
  -- Para cada evento que tem filtros mas não tem casos pré-selecionados
  FOR event_record IN 
    SELECT e.id, e.name, e.case_filters, e.number_of_cases
    FROM events e
    LEFT JOIN event_cases ec ON e.id = ec.event_id
    WHERE e.case_filters IS NOT NULL 
      AND ec.event_id IS NULL
    GROUP BY e.id, e.name, e.case_filters, e.number_of_cases
  LOOP
    case_count := 0;
    
    -- Selecionar casos baseado nos filtros
    FOR case_record IN
      SELECT mc.id, ROW_NUMBER() OVER (ORDER BY RANDOM()) as rn
      FROM medical_cases mc
      WHERE (
        event_record.case_filters->>'category' IS NULL OR
        (event_record.case_filters->'category' ? mc.specialty::text)
      )
      AND (
        event_record.case_filters->>'modality' IS NULL OR
        (event_record.case_filters->'modality' ? mc.modality::text)
      )
      AND (
        event_record.case_filters->>'difficulty' IS NULL OR
        (event_record.case_filters->'difficulty' ? mc.difficulty_level::text)
      )
      LIMIT COALESCE(event_record.number_of_cases, 10)
    LOOP
      -- Inserir na tabela event_cases
      INSERT INTO event_cases (event_id, case_id, sequence)
      VALUES (event_record.id, case_record.id, case_count + 1);
      
      case_count := case_count + 1;
    END LOOP;
    
    total_added := total_added + case_count;
    
    -- Retornar resultado para este evento
    RETURN QUERY SELECT 
      event_record.id,
      event_record.name,
      case_count,
      case_count > 0;
  END LOOP;
  
  RAISE NOTICE '✅ MIGRAÇÃO CONCLUÍDA: % casos adicionados em % eventos', total_added, 
    (SELECT COUNT(DISTINCT e.id) FROM events e 
     LEFT JOIN event_cases ec ON e.id = ec.event_id 
     WHERE e.case_filters IS NOT NULL AND ec.event_id IS NULL);
END;
$$;

-- 2. Criar função para recalcular pontuação baseada na dificuldade real
CREATE OR REPLACE FUNCTION recalculate_event_scores()
RETURNS TABLE(
  user_id uuid,
  event_id uuid, 
  old_score integer,
  new_score integer,
  updated boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  progress_record RECORD;
  case_record RECORD;
  calculated_score integer := 0;
  correct_answers integer := 0;
BEGIN
  -- Para cada progresso de usuário em eventos
  FOR progress_record IN
    SELECT uep.id, uep.user_id, uep.event_id, uep.current_score, 
           uep.cases_completed, uep.cases_correct
    FROM user_event_progress uep
    WHERE uep.current_score > 0
  LOOP
    calculated_score := 0;
    correct_answers := progress_record.cases_correct;
    
    -- Buscar casos do evento em ordem de sequência
    FOR case_record IN
      SELECT mc.points, mc.difficulty_level
      FROM event_cases ec
      JOIN medical_cases mc ON ec.case_id = mc.id
      WHERE ec.event_id = progress_record.event_id
      ORDER BY ec.sequence
      LIMIT progress_record.cases_completed
    LOOP
      -- Se temos respostas corretas restantes, adicionar pontos do caso
      IF correct_answers > 0 THEN
        calculated_score := calculated_score + COALESCE(case_record.points, 10);
        correct_answers := correct_answers - 1;
      END IF;
    END LOOP;
    
    -- Atualizar pontuação apenas se diferente
    IF calculated_score != progress_record.current_score THEN
      UPDATE user_event_progress
      SET current_score = calculated_score,
          updated_at = NOW()
      WHERE id = progress_record.id;
      
      -- Atualizar ranking também
      UPDATE event_rankings
      SET score = calculated_score,
          updated_at = NOW()
      WHERE user_id = progress_record.user_id 
        AND event_id = progress_record.event_id;
      
      RETURN QUERY SELECT 
        progress_record.user_id,
        progress_record.event_id,
        progress_record.current_score,
        calculated_score,
        true;
    END IF;
  END LOOP;
END;
$$;

-- 3. Criar função para corrigir funções RPC de pontuação
CREATE OR REPLACE FUNCTION update_event_progress(
  p_event_id uuid,
  p_case_correct boolean,
  p_points_earned integer,
  p_time_spent integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  progress_record RECORD;
  ranking_record RECORD;
  new_score integer;
  new_rank integer := 999;
  result jsonb;
BEGIN
  -- Buscar progresso atual
  SELECT * INTO progress_record
  FROM user_event_progress
  WHERE user_id = auth.uid() AND event_id = p_event_id;
  
  IF progress_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Progress not found');
  END IF;
  
  -- CORREÇÃO: Usar pontos reais dos casos em vez de fixo
  new_score := progress_record.current_score;
  IF p_case_correct THEN
    new_score := new_score + p_points_earned;
  END IF;
  
  -- Atualizar progresso
  UPDATE user_event_progress
  SET 
    cases_completed = cases_completed + 1,
    cases_correct = cases_correct + (CASE WHEN p_case_correct THEN 1 ELSE 0 END),
    current_score = new_score,
    time_spent_seconds = time_spent_seconds + p_time_spent,
    current_case_index = current_case_index + 1,
    last_activity_at = NOW(),
    updated_at = NOW()
  WHERE id = progress_record.id;
  
  -- Atualizar ou inserir ranking
  INSERT INTO event_rankings (event_id, user_id, score, updated_at)
  VALUES (p_event_id, auth.uid(), new_score, NOW())
  ON CONFLICT (event_id, user_id) 
  DO UPDATE SET 
    score = new_score,
    updated_at = NOW();
  
  -- Recalcular ranks
  WITH ranked_users AS (
    SELECT user_id, 
           ROW_NUMBER() OVER (ORDER BY score DESC, updated_at ASC) as new_rank
    FROM event_rankings
    WHERE event_id = p_event_id
  )
  UPDATE event_rankings er
  SET rank = ru.new_rank,
      updated_at = NOW()
  FROM ranked_users ru
  WHERE er.event_id = p_event_id 
    AND er.user_id = ru.user_id;
  
  -- Buscar novo rank
  SELECT rank INTO new_rank
  FROM event_rankings
  WHERE event_id = p_event_id AND user_id = auth.uid();
  
  result := jsonb_build_object(
    'success', true,
    'cases_completed', progress_record.cases_completed + 1,
    'cases_correct', progress_record.cases_correct + (CASE WHEN p_case_correct THEN 1 ELSE 0 END),
    'new_score', new_score,
    'new_rank', COALESCE(new_rank, 999),
    'points_earned', CASE WHEN p_case_correct THEN p_points_earned ELSE 0 END
  );
  
  RETURN result;
END;
$$;

-- 4. Executar migração de dados
SELECT * FROM populate_event_cases_from_filters();

-- 5. Recalcular pontuações existentes
SELECT * FROM recalculate_event_scores();