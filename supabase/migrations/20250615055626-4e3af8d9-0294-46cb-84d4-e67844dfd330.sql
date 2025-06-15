
-- Adiciona campos que faltam na tabela medical_cases
ALTER TABLE public.medical_cases
  ADD COLUMN IF NOT EXISTS points integer,
  ADD COLUMN IF NOT EXISTS subtype text,
  ADD COLUMN IF NOT EXISTS specialty text;
