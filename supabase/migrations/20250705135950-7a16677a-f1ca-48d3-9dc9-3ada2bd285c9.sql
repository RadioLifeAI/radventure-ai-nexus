-- Executar migração para eventos restantes
SELECT * FROM populate_event_cases_from_filters();

-- Verificar resultado após migração
SELECT 
  e.name as evento_nome,
  e.number_of_cases as casos_configurados,
  COUNT(ec.case_id) as casos_na_tabela,
  CASE WHEN COUNT(ec.case_id) >= e.number_of_cases THEN '✅' ELSE '❌' END as status_casos
FROM events e
LEFT JOIN event_cases ec ON e.id = ec.event_id
WHERE e.status IN ('ACTIVE', 'SCHEDULED')
GROUP BY e.id, e.name, e.number_of_cases
ORDER BY e.created_at DESC;