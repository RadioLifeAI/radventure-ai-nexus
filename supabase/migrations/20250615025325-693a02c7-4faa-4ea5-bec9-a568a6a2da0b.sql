
-- 1. Adiciona coluna category_id se não existir (tipo integer)
ALTER TABLE public.medical_cases
ADD COLUMN IF NOT EXISTS category_id integer;

-- 2. Cria foreign key para tabela de especialidades
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'medical_cases_category_id_fkey'
  ) THEN
    ALTER TABLE public.medical_cases
    ADD CONSTRAINT medical_cases_category_id_fkey
    FOREIGN KEY (category_id)
    REFERENCES public.medical_specialties (id);
  END IF;
END$$;

-- 3. Adiciona/garante coluna case_number
ALTER TABLE public.medical_cases
ADD COLUMN IF NOT EXISTS case_number integer;

-- 4. (Opcional) Índice combinado para busca rápida
CREATE INDEX IF NOT EXISTS idx_medical_cases_category_modality
  ON public.medical_cases (category_id, modality);

-- 5. Trigger SQL corrigida para atualizar numeração só se category_id existir
CREATE OR REPLACE FUNCTION public.update_case_numbers_after_delete()
RETURNS TRIGGER AS $$
BEGIN
  WITH ordered AS (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY category_id, modality
        ORDER BY created_at ASC, id ASC
      ) AS rn
    FROM public.medical_cases
    WHERE category_id = OLD.category_id AND modality = OLD.modality
  )
  UPDATE public.medical_cases mc
  SET case_number = ordered.rn
  FROM ordered
  WHERE mc.id = ordered.id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_case_numbers_after_delete ON public.medical_cases;

CREATE TRIGGER trg_update_case_numbers_after_delete
AFTER DELETE ON public.medical_cases
FOR EACH ROW
EXECUTE FUNCTION public.update_case_numbers_after_delete();
