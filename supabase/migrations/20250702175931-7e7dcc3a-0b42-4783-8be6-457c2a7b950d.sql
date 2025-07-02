-- LIMPEZA SEGURA: Remover casos teste do sistema legado
-- Manter apenas casos que usam o sistema novo (case_images)

-- Primeiro, remover registros relacionados dos casos legados
DELETE FROM public.event_cases 
WHERE case_id IN (
  SELECT mc.id 
  FROM public.medical_cases mc
  LEFT JOIN public.case_images ci ON mc.id = ci.case_id
  WHERE ci.case_id IS NULL 
  AND (mc.image_url IS NOT NULL AND jsonb_array_length(mc.image_url) > 0)
);

DELETE FROM public.user_case_history 
WHERE case_id IN (
  SELECT mc.id 
  FROM public.medical_cases mc
  LEFT JOIN public.case_images ci ON mc.id = ci.case_id
  WHERE ci.case_id IS NULL 
  AND (mc.image_url IS NOT NULL AND jsonb_array_length(mc.image_url) > 0)
);

-- Remover casos teste que usam apenas sistema legado (image_url)
-- Manter apenas casos que têm registros na tabela case_images
DELETE FROM public.medical_cases 
WHERE id IN (
  SELECT mc.id 
  FROM public.medical_cases mc
  LEFT JOIN public.case_images ci ON mc.id = ci.case_id
  WHERE ci.case_id IS NULL 
  AND (mc.image_url IS NOT NULL AND jsonb_array_length(mc.image_url) > 0)
);

-- Limpar campo image_url dos casos restantes para forçar uso do sistema novo
UPDATE public.medical_cases 
SET image_url = '[]'::jsonb 
WHERE image_url IS NOT NULL AND jsonb_array_length(image_url) > 0;

-- Limpar imagens órfãs na tabela case_images (caso existam)
DELETE FROM public.case_images 
WHERE case_id NOT IN (SELECT id FROM public.medical_cases);

-- Log da limpeza
INSERT INTO public.system_settings (key, value, updated_at)
VALUES ('last_legacy_cleanup', jsonb_build_object(
  'timestamp', now(),
  'action', 'removed_legacy_test_cases',
  'system_unified', true
), now())
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = EXCLUDED.updated_at;