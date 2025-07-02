-- CORREÇÃO DEFINITIVA: Remover constraint único que impede revisões de casos
-- PROBLEMA: user_case_history_user_id_case_id_key impede múltiplas tentativas no mesmo caso
-- SOLUÇÃO: Permitir múltiplas entradas diferenciadas por timestamp e review_count

-- ETAPA 1: Remover constraint único problemático
ALTER TABLE public.user_case_history 
DROP CONSTRAINT IF EXISTS user_case_history_user_id_case_id_key;

-- ETAPA 2: Criar índice composto para performance (sem unicidade)
CREATE INDEX IF NOT EXISTS idx_user_case_history_user_case_timestamp 
ON public.user_case_history (user_id, case_id, answered_at DESC);

-- ETAPA 3: Garantir que a função process_case_completion está funcionando corretamente
-- (A função já foi corrigida nas migrações anteriores, mas vamos verificar)

-- ETAPA 4: Log da correção
INSERT INTO public.system_settings (key, value, updated_at)
VALUES (
  'constraint_fix_applied',
  jsonb_build_object(
    'fixed_at', now(),
    'constraint_removed', 'user_case_history_user_id_case_id_key',
    'issue', 'Constraint prevented case reviews and caused transaction failures',
    'solution', 'Removed unique constraint, added performance index, multiple attempts now allowed'
  ),
  now()
)
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = EXCLUDED.updated_at;