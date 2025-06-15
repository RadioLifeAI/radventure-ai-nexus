
-- Adiciona campo de diagnóstico principal descritivo (preenchido pelo admin), se não existir.
ALTER TABLE public.medical_cases
  ADD COLUMN IF NOT EXISTS diagnosis_internal TEXT;

-- Adiciona o campo descrição da dificuldade (nome), caso queira filtrar por nome, além do número (seguro e útil para trilhas & analytics).
ALTER TABLE public.medical_cases
  ADD COLUMN IF NOT EXISTS difficulty_description TEXT;

-- Garante colunas existentes permitindo textos longos:
ALTER TABLE public.medical_cases
  ALTER COLUMN specialty TYPE TEXT,
  ALTER COLUMN findings TYPE TEXT,
  ALTER COLUMN explanation TYPE TEXT,
  ALTER COLUMN patient_clinical_info TYPE TEXT,
  ALTER COLUMN main_question TYPE TEXT,
  ALTER COLUMN manual_hint TYPE TEXT;

-- Melhora arrays para garantir sempre 4 alternativas/tips/feedbacks (a nível de aplicação).
-- No banco, garantimos apenas tipo ARRAY TEXT já existente.

-- Atualiza comentários do banco para documentação:
COMMENT ON COLUMN public.medical_cases.diagnosis_internal IS 'Diagnóstico principal do caso, visível só para admin e usado para filtros e analytics internos';
COMMENT ON COLUMN public.medical_cases.difficulty_description IS 'Descrição textual do nível de dificuldade do caso (ex: fácil, difícil, infernal...)';

