
-- FASE 1: Estabilizar títulos - Modificar trigger para não alterar case_number existente
CREATE OR REPLACE FUNCTION public.generate_case_title()
RETURNS trigger AS $$
DECLARE
  catname text;
  abrev text;
  rnd_num integer;
BEGIN
  -- Busca o nome da especialidade/categoria
  SELECT name INTO catname FROM public.medical_specialties WHERE id = NEW.category_id;
  -- Gera abreviação simples (mantém mapeamentos)
  abrev := left(regexp_replace(catname, '[^[:alnum:]]', '', 'g'), 5);
  IF catname ILIKE '%neuro%' THEN abrev := 'Neuro';
  ELSIF catname ILIKE '%cardio%' THEN abrev := 'Cardio';
  ELSIF catname ILIKE '%derma%' THEN abrev := 'Derma';
  END IF;
  
  -- CORREÇÃO PRINCIPAL: Só gera número se não existir (evita regeneração em UPDATEs)
  IF NEW.case_number IS NULL OR NEW.case_number = 0 THEN
    rnd_num := floor(100000 + random() * 900000);
    NEW.case_number := rnd_num;
  ELSE
    -- Preserva o número existente
    rnd_num := NEW.case_number;
  END IF;
  
  -- Gera o título do caso com o número fixo
  NEW.title := 'Caso ' || abrev || ' ' || rnd_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- FASE 2: Função helper para buscar imagens de ambos os sistemas
CREATE OR REPLACE FUNCTION public.get_case_images_unified(p_case_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  case_images_result jsonb;
  image_url_result jsonb;
  final_result jsonb;
BEGIN
  -- Buscar imagens da tabela case_images (sistema novo)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'url', COALESCE(original_url, ''),
      'legend', COALESCE(legend, ''),
      'sequence_order', COALESCE(sequence_order, 0)
    ) ORDER BY sequence_order
  ), '[]'::jsonb) INTO case_images_result
  FROM public.case_images 
  WHERE case_id = p_case_id 
  AND processing_status = 'completed';
  
  -- Se não há imagens no sistema novo, buscar no sistema antigo
  IF jsonb_array_length(case_images_result) = 0 THEN
    SELECT COALESCE(image_url, '[]'::jsonb) INTO image_url_result
    FROM public.medical_cases 
    WHERE id = p_case_id;
    
    -- Normalizar formato do sistema antigo para compatibilidade
    SELECT CASE 
      WHEN jsonb_typeof(image_url_result) = 'array' THEN image_url_result
      ELSE '[]'::jsonb
    END INTO final_result;
  ELSE
    final_result := case_images_result;
  END IF;
  
  RETURN final_result;
END;
$$;

-- FASE 3: Função para sincronizar sistemas de imagem (opcional)
CREATE OR REPLACE FUNCTION public.sync_case_images_to_legacy(p_case_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  images_data jsonb;
BEGIN
  -- Buscar imagens da tabela case_images
  SELECT jsonb_agg(
    jsonb_build_object(
      'url', original_url,
      'legend', COALESCE(legend, '')
    ) ORDER BY sequence_order
  ) INTO images_data
  FROM public.case_images 
  WHERE case_id = p_case_id 
  AND processing_status = 'completed';
  
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
