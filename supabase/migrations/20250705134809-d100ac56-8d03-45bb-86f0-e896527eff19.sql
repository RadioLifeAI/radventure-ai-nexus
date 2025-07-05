-- MIGRAÇÃO CORRIGIDA PARA CORREÇÃO DO SISTEMA DE EVENTOS E PONTUAÇÃO

-- 1. Criar função para popular casos de eventos existentes (CORRIGIDA)
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

-- 2. Executar migração de dados
SELECT * FROM populate_event_cases_from_filters();