
-- Adicionar campos organizacionais à tabela case_images para suporte à estrutura especializada
ALTER TABLE public.case_images 
ADD COLUMN IF NOT EXISTS specialty_code TEXT,
ADD COLUMN IF NOT EXISTS modality_prefix TEXT,
ADD COLUMN IF NOT EXISTS bucket_path TEXT,
ADD COLUMN IF NOT EXISTS organization_metadata JSONB DEFAULT '{}'::jsonb;

-- Criar índices para performance otimizada na busca por especialidade e modalidade
CREATE INDEX IF NOT EXISTS idx_case_images_specialty_code ON public.case_images(specialty_code);
CREATE INDEX IF NOT EXISTS idx_case_images_modality_prefix ON public.case_images(modality_prefix);
CREATE INDEX IF NOT EXISTS idx_case_images_bucket_path ON public.case_images(bucket_path);

-- Adicionar campos de mapeamento especialidade/modalidade se não existirem
ALTER TABLE public.medical_specialties 
ADD COLUMN IF NOT EXISTS specialty_code TEXT,
ADD COLUMN IF NOT EXISTS bucket_prefix TEXT;

-- Popular códigos de especialidade padrão
UPDATE public.medical_specialties 
SET 
  specialty_code = CASE 
    WHEN LOWER(name) LIKE '%neuro%' THEN 'NEURO'
    WHEN LOWER(name) LIKE '%cardio%' THEN 'CARDIO'
    WHEN LOWER(name) LIKE '%radio%' THEN 'RADIO'
    WHEN LOWER(name) LIKE '%ortop%' THEN 'ORTHO'
    WHEN LOWER(name) LIKE '%derma%' THEN 'DERMA'
    WHEN LOWER(name) LIKE '%ginec%' THEN 'GINEC'
    WHEN LOWER(name) LIKE '%ped%' THEN 'PEDIA'
    WHEN LOWER(name) LIKE '%pneum%' THEN 'PNEUM'
    WHEN LOWER(name) LIKE '%gastro%' THEN 'GASTRO'
    ELSE UPPER(LEFT(REGEXP_REPLACE(name, '[^A-Za-z]', '', 'g'), 5))
  END,
  bucket_prefix = LOWER(CASE 
    WHEN LOWER(name) LIKE '%neuro%' THEN 'neuro'
    WHEN LOWER(name) LIKE '%cardio%' THEN 'cardio'
    WHEN LOWER(name) LIKE '%radio%' THEN 'radio'
    WHEN LOWER(name) LIKE '%ortop%' THEN 'ortho'
    WHEN LOWER(name) LIKE '%derma%' THEN 'derma'
    WHEN LOWER(name) LIKE '%ginec%' THEN 'ginec'
    WHEN LOWER(name) LIKE '%ped%' THEN 'pedia'
    WHEN LOWER(name) LIKE '%pneum%' THEN 'pneum'
    WHEN LOWER(name) LIKE '%gastro%' THEN 'gastro'
    ELSE LOWER(LEFT(REGEXP_REPLACE(name, '[^A-Za-z]', '', 'g'), 5))
  END)
WHERE specialty_code IS NULL OR bucket_prefix IS NULL;

-- Adicionar mapeamento de modalidades para prefixos
CREATE TABLE IF NOT EXISTS public.modality_mappings (
    id SERIAL PRIMARY KEY,
    modality_name TEXT NOT NULL,
    modality_prefix TEXT NOT NULL,
    bucket_folder TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Popular mapeamentos de modalidade padrão
INSERT INTO public.modality_mappings (modality_name, modality_prefix, bucket_folder) 
VALUES 
    ('Tomografia Computadorizada', 'TC', 'tc'),
    ('Ressonância Magnética', 'RM', 'rm'),
    ('Radiografia', 'RX', 'rx'),
    ('Ultrassonografia', 'US', 'us'),
    ('Mamografia', 'MMG', 'mmg'),
    ('Densitometria', 'DEXA', 'dexa'),
    ('Angiografia', 'ANGIO', 'angio'),
    ('Fluoroscopia', 'FLUORO', 'fluoro'),
    ('PET-CT', 'PET', 'pet')
ON CONFLICT DO NOTHING;
