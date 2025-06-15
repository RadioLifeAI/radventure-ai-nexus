
-- Altera o campo image_url na tabela medical_cases para JSONB (usando conversão direta)
ALTER TABLE public.medical_cases
  ALTER COLUMN image_url TYPE jsonb
  USING to_jsonb(image_url);

-- Define valor padrão para evitar nulls (array vazia)
ALTER TABLE public.medical_cases
  ALTER COLUMN image_url SET DEFAULT '[]'::jsonb;
