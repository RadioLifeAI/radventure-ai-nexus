
-- ETAPA 1 & 2: CORREÇÃO DO SCHEMA E CONSTRAINT
-- Primeiro, vamos remover o constraint problemático se existir
ALTER TABLE public.quiz_prompt_controls DROP CONSTRAINT IF EXISTS quiz_prompt_controls_difficulty_check;

-- Agora vamos garantir que os campos aceitem os valores corretos das tabelas de referência
-- Criar constraint que valida difficulty baseado na tabela difficulties
ALTER TABLE public.quiz_prompt_controls 
ADD CONSTRAINT quiz_prompt_controls_difficulty_fkey 
CHECK (difficulty IN (
  SELECT COALESCE(description, 'Nível ' || level::text) 
  FROM public.difficulties
));

-- Criar constraint que valida category baseado na tabela medical_specialties  
ALTER TABLE public.quiz_prompt_controls 
ADD CONSTRAINT quiz_prompt_controls_category_fkey
CHECK (category IN (
  SELECT name FROM public.medical_specialties
));

-- Criar constraint que valida modality baseado na tabela imaging_modalities
ALTER TABLE public.quiz_prompt_controls 
ADD CONSTRAINT quiz_prompt_controls_modality_fkey
CHECK (modality IN (
  SELECT name FROM public.imaging_modalities
));

-- ETAPA 3: POPULAÇÃO AUTOMÁTICA DE DADOS
-- Limpar dados existentes problemáticos
DELETE FROM public.quiz_prompt_controls;

-- Inserir prompts padrão usando dados reais das tabelas
INSERT INTO public.quiz_prompt_controls (
  name, category, difficulty, modality, prompt_template, is_active, created_by, usage_count, success_rate
)
SELECT 
  ms.name || ' - ' || COALESCE(d.description, 'Nível ' || d.level::text) AS name,
  ms.name AS category,
  COALESCE(d.description, 'Nível ' || d.level::text) AS difficulty,
  im.name AS modality,
  'Crie uma pergunta de verdadeiro/falso sobre ' || ms.name || ' com dificuldade ' || COALESCE(d.description, 'Nível ' || d.level::text) || ' usando ' || im.name || '.

A pergunta deve:
- Ser clara e objetiva
- Ter relevância clínica prática  
- Ser apropriada para estudantes de medicina
- Incluir conceitos importantes da especialidade

Categoria: ' || ms.name || '
Dificuldade: ' || COALESCE(d.description, 'Nível ' || d.level::text) || '
Modalidade: ' || im.name AS prompt_template,
  true AS is_active,
  '00000000-0000-0000-0000-000000000000'::uuid AS created_by,
  0 AS usage_count,
  0.0 AS success_rate
FROM 
  public.medical_specialties ms
  CROSS JOIN public.difficulties d
  CROSS JOIN public.imaging_modalities im
WHERE 
  ms.id <= 5  -- Limitar a 5 especialidades para não criar muitos prompts
  AND d.id <= 3  -- Limitar a 3 dificuldades
  AND im.id <= 3; -- Limitar a 3 modalidades

-- Inserir alguns prompts específicos e bem testados
INSERT INTO public.quiz_prompt_controls (
  name, category, difficulty, modality, prompt_template, is_active, created_by, usage_count, success_rate
) VALUES 
(
  'Cardiologia Básica - Radiografia',
  'Cardiologia',
  'Iniciante', 
  'Radiografia',
  'Crie uma pergunta de verdadeiro/falso sobre Cardiologia básica usando Radiografia.

A pergunta deve abordar:
- Anatomia cardíaca normal
- Silhueta cardiovascular
- Sinais radiológicos básicos
- Conceitos fundamentais

Mantenha linguagem clara e educativa para estudantes iniciantes.',
  true,
  '00000000-0000-0000-0000-000000000000'::uuid,
  0,
  0.0
),
(
  'Pneumologia Intermediária - TC',
  'Pneumologia',
  'Intermediário',
  'Tomografia Computadorizada', 
  'Elabore uma questão verdadeiro/falso sobre Pneumologia de nível intermediário baseada em Tomografia Computadorizada.

Foque em:
- Padrões tomográficos pulmonares
- Diagnóstico diferencial
- Correlação clínico-radiológica
- Aspectos técnicos intermediários

Use terminologia médica apropriada.',
  true,
  '00000000-0000-0000-0000-000000000000'::uuid,
  0,
  0.0
);
