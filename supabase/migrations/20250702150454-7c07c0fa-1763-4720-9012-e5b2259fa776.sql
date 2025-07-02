-- CORREÇÃO COMPLETA DO SISTEMA DE CATEGORIZAÇÃO DE CASOS

-- ETAPA 1: SINCRONIZAR SPECIALTY COM CATEGORY_ID PARA CASOS EXISTENTES
UPDATE public.medical_cases 
SET specialty = ms.name, updated_at = NOW()
FROM public.medical_specialties ms
WHERE medical_cases.category_id = ms.id 
  AND (medical_cases.specialty IS NULL OR medical_cases.specialty = '');

-- ETAPA 2: ATUALIZAR TRIGGER PARA PREENCHER AMBOS OS CAMPOS
CREATE OR REPLACE FUNCTION public.generate_case_title()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  catname text;
  abrev text;
  rnd_num integer;
BEGIN
  -- CORREÇÃO CRÍTICA: Se category_id existe mas specialty não, sincronizar
  IF NEW.category_id IS NOT NULL AND (NEW.specialty IS NULL OR NEW.specialty = '') THEN
    SELECT name INTO NEW.specialty 
    FROM public.medical_specialties 
    WHERE id = NEW.category_id;
  END IF;
  
  -- CORREÇÃO INVERSA: Se specialty existe mas category_id não, sincronizar
  IF NEW.specialty IS NOT NULL AND NEW.specialty != '' AND NEW.category_id IS NULL THEN
    SELECT id INTO NEW.category_id 
    FROM public.medical_specialties 
    WHERE name = NEW.specialty;
  END IF;
  
  -- Busca o nome da especialidade/categoria para título
  SELECT name INTO catname FROM public.medical_specialties WHERE id = NEW.category_id;
  
  -- Gera abreviação simples
  abrev := left(regexp_replace(COALESCE(catname, 'Caso'), '[^[:alnum:]]', '', 'g'), 5);
  IF catname ILIKE '%neuro%' THEN abrev := 'Neuro';
  ELSIF catname ILIKE '%cardio%' THEN abrev := 'Cardio';
  ELSIF catname ILIKE '%derma%' THEN abrev := 'Derma';
  END IF;
  
  -- CORREÇÃO: Só gera número se não existir
  IF NEW.case_number IS NULL OR NEW.case_number = 0 THEN
    rnd_num := floor(100000 + random() * 900000);
    NEW.case_number := rnd_num;
  ELSE
    rnd_num := NEW.case_number;
  END IF;
  
  -- Gera o título do caso
  NEW.title := 'Caso ' || abrev || ' ' || rnd_num;
  RETURN NEW;
END;
$function$;

-- ETAPA 3: GARANTIR CONSISTÊNCIA EM INSERÇÕES FUTURAS
CREATE OR REPLACE FUNCTION public.sync_case_category_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Sincronizar specialty com category_id
  IF NEW.category_id IS NOT NULL AND (NEW.specialty IS NULL OR NEW.specialty = '') THEN
    SELECT name INTO NEW.specialty 
    FROM public.medical_specialties 
    WHERE id = NEW.category_id;
  END IF;
  
  -- Sincronizar category_id com specialty
  IF NEW.specialty IS NOT NULL AND NEW.specialty != '' AND NEW.category_id IS NULL THEN
    SELECT id INTO NEW.category_id 
    FROM public.medical_specialties 
    WHERE name = NEW.specialty;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Aplicar trigger de sincronização
DROP TRIGGER IF EXISTS sync_case_category_trigger ON public.medical_cases;
CREATE TRIGGER sync_case_category_trigger
  BEFORE INSERT OR UPDATE ON public.medical_cases
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_case_category_fields();

-- ETAPA 4: LOG DA CORREÇÃO
INSERT INTO public.system_settings (key, value, updated_at)
VALUES (
  'case_categorization_fix',
  jsonb_build_object(
    'fixed_at', now(),
    'issues_resolved', ARRAY[
      'specialty_null_inconsistency',
      'category_id_specialty_sync',
      'dashboard_visibility',
      'filter_robustness'
    ],
    'solution', 'Complete categorization system overhaul with data sync and triggers'
  ),
  now()
)
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = EXCLUDED.updated_at;