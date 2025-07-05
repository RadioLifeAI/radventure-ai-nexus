-- CORREÇÃO EMERGENCIAL DEFINITIVA
-- Criar o trigger que faltava para distribuição automática
CREATE OR REPLACE TRIGGER auto_distribute_event_prizes
    AFTER UPDATE ON events
    FOR EACH ROW
    WHEN (NEW.status = 'FINISHED' AND (OLD.status IS NULL OR OLD.status != 'FINISHED'))
    EXECUTE FUNCTION trigger_event_prize_distribution();

-- População forçada de casos usando todos os casos disponíveis
DO $$
DECLARE
    target_event RECORD;
    available_cases uuid[];
    cases_needed integer;
    i integer;
BEGIN
    RAISE NOTICE '🚨 INICIANDO POPULAÇÃO FORÇADA DE CASOS';
    
    -- Para cada evento sem casos
    FOR target_event IN
        SELECT e.id, e.name, e.number_of_cases
        FROM events e
        WHERE NOT EXISTS(SELECT 1 FROM event_cases ec WHERE ec.event_id = e.id)
          AND e.number_of_cases > 0
    LOOP
        RAISE NOTICE '📋 Processando evento: % (precisa de % casos)', target_event.name, target_event.number_of_cases;
        
        -- Buscar casos disponíveis (TODOS os casos, sem filtros restritivos)
        SELECT array_agg(id ORDER BY RANDOM()) INTO available_cases
        FROM medical_cases 
        WHERE id IS NOT NULL
        LIMIT target_event.number_of_cases;
        
        cases_needed := target_event.number_of_cases;
        
        -- Inserir casos na tabela event_cases
        FOR i IN 1..LEAST(array_length(available_cases, 1), cases_needed) LOOP
            INSERT INTO event_cases (event_id, case_id, sequence)
            VALUES (target_event.id, available_cases[i], i)
            ON CONFLICT DO NOTHING;
        END LOOP;
        
        RAISE NOTICE '✅ Adicionados % casos para evento %', LEAST(array_length(available_cases, 1), cases_needed), target_event.name;
    END LOOP;
    
    RAISE NOTICE '🎉 POPULAÇÃO FORÇADA CONCLUÍDA';
END;
$$;