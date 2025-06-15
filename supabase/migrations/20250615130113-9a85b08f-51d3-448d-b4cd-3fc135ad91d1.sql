
-- Tabela já possui campo case_number, mas vamos garantir comentários e exemplos e possível trigger futuramente
COMMENT ON COLUMN public.medical_cases.title IS 'Título no formato: Caso [AbreviaçãoEspecialidade] [case_number], ex: "Caso Neuro 23453"';
COMMENT ON COLUMN public.medical_cases.case_number IS 'ID de identificação numérico sequencial da especialidade/modalidade.';

-- Exemplo de trigger para gerar título automático ao inserir caso
CREATE OR REPLACE FUNCTION public.generate_case_title()
RETURNS trigger AS $$
DECLARE
  catname text;
  abrev text;
BEGIN
  -- Busca o nome da especialidade/categoria
  SELECT name INTO catname FROM public.medical_specialties WHERE id = NEW.category_id;
  -- Gera abreviação simples (aqui, pode ser customizado conforme mapping futuro)
  abrev := left(regexp_replace(catname, '[^[:alnum:]]', '', 'g'), 5);
  -- Se conhecido, pode mapear 'Neurologia' => 'Neuro', etc. (simplificado aqui)
  IF catname ILIKE '%neuro%' THEN abrev := 'Neuro';
  ELSIF catname ILIKE '%cardio%' THEN abrev := 'Cardio';
  ELSIF catname ILIKE '%derma%' THEN abrev := 'Derma';
  END IF;
  -- Gera o título do caso (sempre no formato padrão)
  NEW.title := 'Caso ' || abrev || ' ' || COALESCE(NEW.case_number::text, '---');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cria trigger no insert para gerar o título automático
DROP TRIGGER IF EXISTS trg_generate_case_title ON public.medical_cases;
CREATE TRIGGER trg_generate_case_title
BEFORE INSERT ON public.medical_cases
FOR EACH ROW EXECUTE FUNCTION public.generate_case_title();
