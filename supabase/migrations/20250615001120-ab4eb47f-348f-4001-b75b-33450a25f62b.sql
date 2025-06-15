
-- Adiciona a coluna created_by se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'medical_cases' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.medical_cases
      ADD COLUMN created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Cria a política de UPDATE para limitar à autoria
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update their own cases' AND tablename = 'medical_cases'
  ) THEN
    CREATE POLICY "Admins can update their own cases"
      ON public.medical_cases FOR UPDATE
      USING (created_by = auth.uid());
  END IF;
END $$;
