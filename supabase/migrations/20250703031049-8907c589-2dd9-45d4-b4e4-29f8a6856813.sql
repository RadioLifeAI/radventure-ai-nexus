-- CORREÇÃO DEFINITIVA 1: Corrigir função get_case_images_unified
-- Remove ambiguidade de variáveis e garante retorno estruturado

DROP FUNCTION IF EXISTS public.get_case_images_unified(uuid);

CREATE OR REPLACE FUNCTION public.get_case_images_unified(p_case_id uuid)
RETURNS jsonb[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  case_images_result jsonb[];
  legacy_images_result jsonb[];
BEGIN
  -- MÉTODO 1: Buscar da tabela case_images (sistema novo)
  SELECT array_agg(
    jsonb_build_object(
      'url', ci.original_url,
      'filename', ci.original_filename,
      'sequence_order', ci.sequence_order,
      'legend', COALESCE(ci.legend, ''),
      'source', 'case_images_table'
    ) ORDER BY ci.sequence_order
  ) INTO case_images_result
  FROM public.case_images ci
  WHERE ci.case_id = p_case_id 
    AND ci.processing_status = 'completed'
    AND ci.original_url IS NOT NULL
    AND ci.original_url != '';

  -- Se encontrou imagens na tabela case_images, retornar essas
  IF case_images_result IS NOT NULL AND array_length(case_images_result, 1) > 0 THEN
    RETURN case_images_result;
  END IF;

  -- MÉTODO 2: Fallback para campo image_url (sistema legado)
  SELECT array_agg(
    CASE 
      WHEN jsonb_typeof(img_element) = 'object' THEN
        img_element || jsonb_build_object('source', 'legacy_field')
      ELSE
        jsonb_build_object(
          'url', img_element,
          'filename', 'legacy_image.jpg',
          'sequence_order', ordinality - 1,
          'legend', '',
          'source', 'legacy_field'
        )
    END
  ) INTO legacy_images_result
  FROM public.medical_cases mc
  CROSS JOIN jsonb_array_elements(mc.image_url) WITH ORDINALITY AS t(img_element, ordinality)
  WHERE mc.id = p_case_id
    AND mc.image_url IS NOT NULL
    AND jsonb_array_length(mc.image_url) > 0;

  -- Retornar imagens legadas ou array vazio
  RETURN COALESCE(legacy_images_result, ARRAY[]::jsonb[]);
END;
$$;

-- CORREÇÃO DEFINITIVA 2: Função para sincronizar case_images -> image_url
CREATE OR REPLACE FUNCTION public.sync_case_images_to_legacy(p_case_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  images_data jsonb;
BEGIN
  -- Buscar URLs das imagens da tabela case_images
  SELECT jsonb_agg(ci.original_url ORDER BY ci.sequence_order)
  INTO images_data
  FROM public.case_images ci
  WHERE ci.case_id = p_case_id 
    AND ci.processing_status = 'completed'
    AND ci.original_url IS NOT NULL
    AND ci.original_url != '';
  
  -- Atualizar campo image_url no caso
  IF images_data IS NOT NULL THEN
    UPDATE public.medical_cases 
    SET image_url = images_data,
        updated_at = NOW()
    WHERE id = p_case_id;
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- CORREÇÃO DEFINITIVA 3: Trigger automático para sincronização
CREATE OR REPLACE FUNCTION public.trigger_sync_case_images()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Sincronizar após insert/update/delete na tabela case_images
  PERFORM public.sync_case_images_to_legacy(
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.case_id
      ELSE NEW.case_id
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Aplicar trigger na tabela case_images
DROP TRIGGER IF EXISTS sync_case_images_trigger ON public.case_images;
CREATE TRIGGER sync_case_images_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.case_images
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_sync_case_images();

-- LIMPEZA: Remover imagens órfãs e paths incorretos
DELETE FROM public.case_images 
WHERE case_id NOT IN (SELECT id FROM public.medical_cases);

-- Log da correção
INSERT INTO public.system_settings (key, value, updated_at)
VALUES ('image_system_unified', jsonb_build_object(
  'timestamp', now(),
  'action', 'definitive_correction_applied',
  'functions_fixed', true,
  'auto_sync_enabled', true,
  'cleanup_completed', true
), now())
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = EXCLUDED.updated_at;