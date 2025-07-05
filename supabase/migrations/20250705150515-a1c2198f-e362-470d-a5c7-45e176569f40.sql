-- CORREÇÃO EMERGENCIAL DO SISTEMA DE EVENTOS
-- FASE 1: Corrigir população de casos faltantes

-- 1. Executar população automática para todos os eventos sem casos
SELECT * FROM populate_event_cases_from_filters();

-- 2. Verificar resultado da população
SELECT 
  e.name,
  e.number_of_cases as configurado,
  COUNT(ec.case_id) as na_tabela,
  CASE WHEN COUNT(ec.case_id) >= e.number_of_cases THEN '✅ OK' ELSE '❌ FALTAM_CASOS' END as status
FROM events e
LEFT JOIN event_cases ec ON e.id = ec.event_id
GROUP BY e.id, e.name, e.number_of_cases
ORDER BY e.name;

-- FASE 2: Distribuir prêmios pendentes para eventos FINISHED
DO $$
DECLARE
    finished_event RECORD;
    distribution_result jsonb;
BEGIN
    RAISE NOTICE '🏆 INICIANDO DISTRIBUIÇÃO DE PRÊMIOS PENDENTES';
    
    FOR finished_event IN
        SELECT e.id, e.name 
        FROM events e
        WHERE e.status = 'FINISHED'
          AND NOT EXISTS (
              SELECT 1 FROM event_final_rankings efr 
              WHERE efr.event_id = e.id
          )
    LOOP
        RAISE NOTICE '💰 Processando evento: % (ID: %)', finished_event.name, finished_event.id;
        
        BEGIN
            SELECT public.distribute_event_prizes(finished_event.id) INTO distribution_result;
            RAISE NOTICE '✅ Resultado: %', distribution_result;
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG '❌ ERRO ao processar evento %: %', finished_event.id, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE '🎉 DISTRIBUIÇÃO DE PRÊMIOS CONCLUÍDA';
END;
$$;

-- FASE 3: Validação final do sistema
SELECT validate_event_system();