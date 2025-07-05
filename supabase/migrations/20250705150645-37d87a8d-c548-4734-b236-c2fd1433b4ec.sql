-- FINALIZAR CORREÇÃO EMERGENCIAL
-- Distribuir prêmios pendentes manualmente
DO $$
DECLARE
    finished_event RECORD;
    distribution_result jsonb;
BEGIN
    RAISE NOTICE '🏆 DISTRIBUINDO PRÊMIOS PENDENTES';
    
    FOR finished_event IN
        SELECT e.id, e.name 
        FROM events e
        WHERE e.status = 'FINISHED'
          AND NOT EXISTS (
              SELECT 1 FROM event_final_rankings efr 
              WHERE efr.event_id = e.id
          )
    LOOP
        RAISE NOTICE '💰 Processando evento: %', finished_event.name;
        
        BEGIN
            SELECT public.distribute_event_prizes(finished_event.id) INTO distribution_result;
            RAISE NOTICE '✅ Resultado: %', distribution_result;
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG '❌ ERRO: %', SQLERRM;
        END;
    END LOOP;
END;
$$;

-- Validação final completa
SELECT validate_event_system();