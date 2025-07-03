-- CORREÇÃO DEFINITIVA: Limpeza de imagens órfãs e validação do sistema nativo

-- 1. LIMPEZA: Remover imagens órfãs (case_id = NULL)
DELETE FROM public.case_images 
WHERE case_id IS NULL;

-- 2. GARANTIR: Adicionar constraint para case_id obrigatório (futuras inserções)
ALTER TABLE public.case_images 
ALTER COLUMN case_id SET NOT NULL;

-- 3. VALIDAÇÃO: Criar função para verificar sistema nativo
CREATE OR REPLACE FUNCTION public.validate_case_image_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Bloquear inserções com case_id NULL
  IF NEW.case_id IS NULL THEN
    RAISE EXCEPTION 'case_id é obrigatório. Sistema temporário não permitido.';
  END IF;
  
  -- Verificar se o caso existe
  IF NOT EXISTS (SELECT 1 FROM public.medical_cases WHERE id = NEW.case_id) THEN
    RAISE EXCEPTION 'Caso % não existe. Verifique o case_id.', NEW.case_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. APLICAR: Trigger de validação
DROP TRIGGER IF EXISTS validate_case_image_trigger ON public.case_images;
CREATE TRIGGER validate_case_image_trigger
  BEFORE INSERT OR UPDATE ON public.case_images
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_case_image_insert();

-- 5. LOG: Registrar correção aplicada
INSERT INTO public.system_settings (key, value, updated_at)
VALUES ('wizard_native_system_fix', jsonb_build_object(
  'timestamp', now(),
  'action', 'definitive_wizard_fix_applied',
  'orphan_images_cleaned', true,
  'case_id_constraint_added', true,
  'validation_trigger_created', true,
  'temp_system_blocked', true
), now())
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = EXCLUDED.updated_at;