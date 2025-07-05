-- CORREÇÃO DA MIGRAÇÃO - REMOVENDO AMBIGUIDADE

-- 1. Corrigir função de recalculação de pontuação
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
      
      -- Atualizar ranking também (corrigindo ambiguidade)
      UPDATE event_rankings er
      SET score = calculated_score,
          updated_at = NOW()
      WHERE er.user_id = progress_record.user_id 
        AND er.event_id = progress_record.event_id;
      
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

-- 2. Executar recalculação de pontuações
SELECT * FROM recalculate_event_scores();