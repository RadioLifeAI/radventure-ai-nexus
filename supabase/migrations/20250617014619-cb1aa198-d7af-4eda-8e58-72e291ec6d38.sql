
-- FASE 1: CORRIGIR ESTRUTURA DE DADOS COMPLETA

-- 1. Limpar e recriar tabela imaging_modalities com todas as 9 modalidades principais
DELETE FROM public.imaging_modalities;
INSERT INTO public.imaging_modalities (name) VALUES
  ('Tomografia Computadorizada (TC)'),
  ('Ressonância Magnética (RM)'),
  ('Ultrassonografia (US)'),
  ('Radiografia (RX)'),
  ('Mamografia (MMG)'),
  ('Medicina Nuclear (MN)'),
  ('Radiologia Intervencionista (RI)'),
  ('Fluoroscopia'),
  ('Densitometria Óssea (DMO)');

-- 2. Recriar tabela imaging_subtypes com TODOS os subtipos das imagens
DROP TABLE IF EXISTS public.imaging_subtypes CASCADE;
CREATE TABLE public.imaging_subtypes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  modality_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Inserir TODOS os subtipos baseados nas imagens anexadas
INSERT INTO public.imaging_subtypes (name, modality_name) VALUES
  -- Tomografia Computadorizada (TC)
  ('Angio-TC de Crânio', 'Tomografia Computadorizada (TC)'),
  ('Angio-TC de Pescoço e Carótidas', 'Tomografia Computadorizada (TC)'),
  ('Angio-TC de Tórax', 'Tomografia Computadorizada (TC)'),
  ('Angio-TC de Aorta', 'Tomografia Computadorizada (TC)'),
  ('Angio-TC de Artérias Coronárias', 'Tomografia Computadorizada (TC)'),
  ('Angio-TC de Vasos Abdominais', 'Tomografia Computadorizada (TC)'),
  ('Angio-TC de Membros Inferiores/Superiores', 'Tomografia Computadorizada (TC)'),
  ('TC Crânio', 'Tomografia Computadorizada (TC)'),
  ('TC Seios da Face', 'Tomografia Computadorizada (TC)'),
  ('TC Pescoço', 'Tomografia Computadorizada (TC)'),
  ('TC Tórax', 'Tomografia Computadorizada (TC)'),
  ('TC Abdome Total', 'Tomografia Computadorizada (TC)'),
  ('TC Pelve', 'Tomografia Computadorizada (TC)'),
  ('Uro-TC', 'Tomografia Computadorizada (TC)'),
  ('Entero-TC', 'Tomografia Computadorizada (TC)'),
  ('TC Coluna', 'Tomografia Computadorizada (TC)'),
  ('TC Musculoesquelético', 'Tomografia Computadorizada (TC)'),

  -- Ressonância Magnética (RM)
  ('RM Encéfalo', 'Ressonância Magnética (RM)'),
  ('Angio-RM de Crânio', 'Ressonância Magnética (RM)'),
  ('RM Sela Túrcica / Hipófise', 'Ressonância Magnética (RM)'),
  ('RM Órbitas', 'Ressonância Magnética (RM)'),
  ('RM Pescoço', 'Ressonância Magnética (RM)'),
  ('RM Tórax', 'Ressonância Magnética (RM)'),
  ('RM Mama', 'Ressonância Magnética (RM)'),
  ('RM Cardíaca', 'Ressonância Magnética (RM)'),
  ('RM Abdome Superior', 'Ressonância Magnética (RM)'),
  ('Colangio-RM', 'Ressonância Magnética (RM)'),
  ('Entero-RM', 'Ressonância Magnética (RM)'),
  ('RM Pelve', 'Ressonância Magnética (RM)'),
  ('RM Coluna', 'Ressonância Magnética (RM)'),
  ('RM ATM', 'Ressonância Magnética (RM)'),
  ('RM Musculoesquelético', 'Ressonância Magnética (RM)'),
  ('Artro-RM', 'Ressonância Magnética (RM)'),

  -- Ultrassonografia (US)
  ('US Abdominal Total', 'Ultrassonografia (US)'),
  ('US Abdome Superior', 'Ultrassonografia (US)'),
  ('US Rins e Vias Urinárias', 'Ultrassonografia (US)'),
  ('US Pélvico (Suprapúbico)', 'Ultrassonografia (US)'),
  ('US Pélvico Transvaginal', 'Ultrassonografia (US)'),
  ('US Próstata', 'Ultrassonografia (US)'),
  ('US Obstétrico', 'Ultrassonografia (US)'),
  ('US Mama e Axilas', 'Ultrassonografia (US)'),
  ('US Tireoide e Cervical', 'Ultrassonografia (US)'),
  ('US Glândulas Salivares', 'Ultrassonografia (US)'),
  ('US Musculoesquelético', 'Ultrassonografia (US)'),
  ('US Partes Moles', 'Ultrassonografia (US)'),
  ('US Doppler Vascular', 'Ultrassonografia (US)'),
  ('Ecocardiograma Transtorácico', 'Ultrassonografia (US)'),

  -- Radiografia (RX)
  ('RX Tórax', 'Radiografia (RX)'),
  ('RX Abdome Simples e Agudo', 'Radiografia (RX)'),
  ('RX Coluna', 'Radiografia (RX)'),
  ('RX Crânio e Face', 'Radiografia (RX)'),
  ('RX de Extremidades', 'Radiografia (RX)'),
  ('RX Pelve e Bacia', 'Radiografia (RX)'),
  ('RX Escanometria', 'Radiografia (RX)'),
  ('RX Panorâmica de Mandíbula', 'Radiografia (RX)'),

  -- Mamografia (MMG)
  ('Mamografia Digital Bilateral', 'Mamografia (MMG)'),
  ('Mamografia Diagnóstica', 'Mamografia (MMG)'),
  ('Tomossíntese Mamária', 'Mamografia (MMG)'),
  ('Mamografia com Contraste', 'Mamografia (MMG)'),

  -- Medicina Nuclear (MN)
  ('Cintilografia Óssea', 'Medicina Nuclear (MN)'),
  ('Cintilografia Miocárdica', 'Medicina Nuclear (MN)'),
  ('Cintilografia Renal', 'Medicina Nuclear (MN)'),
  ('Cintilografia de Tireoide', 'Medicina Nuclear (MN)'),
  ('PET-CT Oncológico', 'Medicina Nuclear (MN)'),
  ('PET-CT com PSMA', 'Medicina Nuclear (MN)'),
  ('PET-CT com FDG', 'Medicina Nuclear (MN)'),

  -- Radiologia Intervencionista (RI)
  ('Angioplastia e Stent', 'Radiologia Intervencionista (RI)'),
  ('Biópsia Guiada', 'Radiologia Intervencionista (RI)'),
  ('Drenagem de Abscessos', 'Radiologia Intervencionista (RI)'),
  ('Quimioembolização Hepática', 'Radiologia Intervencionista (RI)'),
  ('Ablação por Radiofrequência', 'Radiologia Intervencionista (RI)'),
  ('Vertebroplastia', 'Radiologia Intervencionista (RI)'),

  -- Fluoroscopia
  ('Estudo Contrastado do Esôfago, Estômago e Duodeno (EED)', 'Fluoroscopia'),
  ('Trânsito Intestinal', 'Fluoroscopia'),
  ('Enema Opaco', 'Fluoroscopia'),
  ('Histerossalpingografia (HSG)', 'Fluoroscopia'),
  ('Uretrocistografia Miccional', 'Fluoroscopia'),

  -- Densitometria Óssea (DMO)
  ('Densitometria de Coluna e Fêmur', 'Densitometria Óssea (DMO)'),
  ('Densitometria de Corpo Inteiro', 'Densitometria Óssea (DMO)');

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_imaging_subtypes_modality ON public.imaging_subtypes(modality_name);
CREATE INDEX IF NOT EXISTS idx_medical_cases_filters ON public.medical_cases(specialty, modality, subtype, difficulty_level);

-- 5. Garantir que medical_specialties está populada
INSERT INTO public.medical_specialties (name) VALUES
  ('Radiologia Geral'),
  ('Neurorradiologia'),
  ('Radiologia Torácica'),
  ('Radiologia Abdominal'),
  ('Radiologia Musculoesquelética'),
  ('Radiologia Mamária'),
  ('Radiologia Pediátrica'),
  ('Radiologia Intervencionista'),
  ('Medicina Nuclear'),
  ('Ultrassonografia'),
  ('Cardiologia'),
  ('Neurologia'),
  ('Ortopedia'),
  ('Ginecologia e Obstetrícia'),
  ('Urologia'),
  ('Gastroenterologia'),
  ('Pneumologia'),
  ('Oncologia')
ON CONFLICT (name) DO NOTHING;
