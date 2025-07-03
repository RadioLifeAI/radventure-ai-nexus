
-- CORREÇÃO DEFINITIVA: Função get_case_images_unified sem conflito de variáveis
CREATE OR REPLACE FUNCTION public.get_case_images_unified(p_case_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  case_images_result jsonb;
  image_url_result jsonb;
  final_result jsonb;
  image_item jsonb;
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
    
    -- CORREÇÃO CRÍTICA: Normalizar sistema legado para formato estruturado
    IF image_url_result IS NOT NULL AND jsonb_typeof(image_url_result) = 'array' THEN
      -- Converter cada item do array legado para formato estruturado
      SELECT jsonb_agg(
        CASE 
          WHEN jsonb_typeof(image_item) = 'object' THEN
            -- Se já é objeto, garantir estrutura padrão
            jsonb_build_object(
              'url', COALESCE(image_item->>'url', image_item::text),
              'legend', COALESCE(image_item->>'legend', ''),
              'sequence_order', COALESCE((image_item->>'sequence_order')::integer, 0)
            )
          ELSE
            -- Se é string simples, converter para objeto estruturado
            jsonb_build_object(
              'url', image_item::text,
              'legend', '',
              'sequence_order', 0
            )
        END
      ) INTO final_result
      FROM jsonb_array_elements(image_url_result) AS image_item
      WHERE image_item IS NOT NULL 
      AND (
        (jsonb_typeof(image_item) = 'object' AND image_item ? 'url') OR
        (jsonb_typeof(image_item) = 'string' AND length(image_item::text) > 0)
      );
    ELSE
      final_result := '[]'::jsonb;
    END IF;
  ELSE
    final_result := case_images_result;
  END IF;
  
  -- Garantir que o resultado final é sempre um array válido
  RETURN COALESCE(final_result, '[]'::jsonb);
END;
$$;
