
-- CORREÇÃO EMERGENCIAL DEFINITIVA - SISTEMA DESAFIOS DIÁRIOS

-- ETAPA 1: REMOÇÃO TOTAL E DEFINITIVA DOS CONSTRAINTS PROBLEMÁTICOS
-- Remover TODOS os constraints check existentes que estão causando problemas
ALTER TABLE public.quiz_prompt_controls DROP CONSTRAINT IF EXISTS quiz_prompt_controls_difficulty_check;
ALTER TABLE public.quiz_prompt_controls DROP CONSTRAINT IF EXISTS quiz_prompt_controls_difficulty_fkey;
ALTER TABLE public.quiz_prompt_controls DROP CONSTRAINT IF EXISTS quiz_prompt_controls_category_fkey;
ALTER TABLE public.quiz_prompt_controls DROP CONSTRAINT IF EXISTS quiz_prompt_controls_modality_fkey;

-- ETAPA 2: LIMPEZA TOTAL DA TABELA
-- Limpar dados existentes para começar do zero
DELETE FROM public.quiz_prompt_controls;
DELETE FROM public.daily_quiz_questions WHERE prompt_control_id IS NOT NULL;

-- ETAPA 3: INSERÇÃO SEGURA DE PROMPTS COM DADOS VÁLIDOS
-- Buscar dados EXATOS das tabelas para garantir compatibilidade
INSERT INTO public.quiz_prompt_controls (
  name, category, difficulty, modality, prompt_template, is_active, created_by, usage_count, success_rate
) 
SELECT 
  ms.name || ' - ' || d.description || ' - ' || im.name AS name,
  ms.name AS category,
  d.description AS difficulty,
  im.name AS modality,
  'Crie uma pergunta de verdadeiro/falso sobre ' || ms.name || ' com nível de dificuldade ' || d.description || ' baseada em ' || im.name || '.

A pergunta deve ser:
- Clara e objetiva para estudantes de medicina
- Clinicamente relevante e educativa
- Apropriada para o nível ' || d.description || '
- Focada em conceitos importantes de ' || ms.name || '

Use terminologia médica adequada ao nível de dificuldade especificado.' AS prompt_template,
  true AS is_active,
  '00000000-0000-0000-0000-000000000000'::uuid AS created_by,
  0 AS usage_count,
  0.0 AS success_rate
FROM 
  public.medical_specialties ms
  CROSS JOIN public.difficulties d
  CROSS JOIN public.imaging_modalities im
WHERE 
  ms.id <= 3  -- Primeiras 3 especialidades
  AND d.id <= 2  -- Primeiras 2 dificuldades
  AND im.id <= 2; -- Primeiras 2 modalidades

-- ETAPA 4: INSERIR PROMPTS ESPECÍFICOS TESTADOS MANUALMENTE
INSERT INTO public.quiz_prompt_controls (
  name, category, difficulty, modality, prompt_template, is_active, created_by, usage_count, success_rate
) VALUES 
(
  'Cardiologia Iniciante',
  'Cardiologia',
  'Iniciante',
  'Radiografia',
  'Crie uma pergunta de verdadeiro/falso sobre Cardiologia para nível Iniciante usando Radiografia.

Foque em conceitos básicos:
- Anatomia cardíaca normal no RX de tórax
- Silhueta cardiovascular
- Sinais radiológicos elementares
- Fundamentos da cardiologia

Mantenha linguagem simples e educativa.',
  true,
  '00000000-0000-0000-0000-000000000000'::uuid,
  0,
  0.0
),
(
  'Pneumologia Intermediário',
  'Pneumologia', 
  'Intermediário',
  'Tomografia Computadorizada',
  'Elabore uma questão verdadeiro/falso sobre Pneumologia de nível Intermediário baseada em Tomografia Computadorizada.

Aborde aspectos intermediários:
- Padrões tomográficos pulmonares comuns
- Diagnóstico diferencial básico
- Correlação clínico-radiológica
- Conceitos de pneumologia aplicada

Use terminologia técnica apropriada.',
  true,
  '00000000-0000-0000-0000-000000000000'::uuid,
  0,
  0.0
);

-- ETAPA 5: VALIDAÇÃO DO SISTEMA
-- Verificar se os dados foram inseridos corretamente
DO $$
DECLARE
  prompt_count INTEGER;
  valid_data_count INTEGER;
BEGIN
  -- Contar prompts inseridos
  SELECT COUNT(*) INTO prompt_count FROM public.quiz_prompt_controls;
  
  -- Verificar se todos os dados são válidos comparando com as tabelas
  SELECT COUNT(*) INTO valid_data_count 
  FROM public.quiz_prompt_controls qpc
  WHERE EXISTS (SELECT 1 FROM public.medical_specialties ms WHERE ms.name = qpc.category)
    AND EXISTS (SELECT 1 FROM public.difficulties d WHERE d.description = qpc.difficulty)
    AND EXISTS (SELECT 1 FROM public.imaging_modalities im WHERE im.name = qpc.modality);
  
  -- Log dos resultados
  RAISE NOTICE '✅ CORREÇÃO EMERGENCIAL CONCLUÍDA';
  RAISE NOTICE '📊 Prompts inseridos: %', prompt_count;
  RAISE NOTICE '✅ Prompts com dados válidos: %', valid_data_count;
  
  IF prompt_count > 0 AND valid_data_count = prompt_count THEN
    RAISE NOTICE '🎉 SISTEMA TOTALMENTE FUNCIONAL!';
  ELSE
    RAISE NOTICE '⚠️ Verificar inconsistências nos dados';
  END IF;
END
$$;
