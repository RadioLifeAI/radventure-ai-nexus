
-- 1. Remover trigger de update de numeração após delete (deixa o número fixo e randomico)
DROP TRIGGER IF EXISTS trg_update_case_numbers_after_delete ON public.medical_cases;
DROP FUNCTION IF EXISTS public.update_case_numbers_after_delete();

-- 2. Ajustar função de título para usar um número aleatório de 6 dígitos em vez de sequencial
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
  -- Gera número randômico de 6 dígitos se não existir
  IF NEW.case_number IS NULL THEN
    rnd_num := floor(100000 + random() * 900000);
    NEW.case_number := rnd_num;
  ELSE
    rnd_num := NEW.case_number;
  END IF;
  -- Gera o título do caso com o número fixo de 6 dígitos
  NEW.title := 'Caso ' || abrev || ' ' || rnd_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Garantir comentários sobre campos
COMMENT ON COLUMN public.medical_cases.title IS 'Título no formato: Caso [AbreviaçãoEspecialidade] [6d], ex: "Caso Neuro 234567"';
COMMENT ON COLUMN public.medical_cases.case_number IS 'ID numérico ALEATÓRIO de 6 dígitos (fixo, não sequencial/deletável) por caso';

