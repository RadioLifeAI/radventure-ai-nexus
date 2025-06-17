
-- FASE 1: CORREÇÃO COMPLETA DAS ESPECIALIDADES - UNIFICAÇÃO E PADRONIZAÇÃO

-- 1. Limpar e recriar tabela medical_specialties com todas as especialidades unificadas
DELETE FROM public.medical_specialties;

-- 2. Inserir TODAS as especialidades unificadas (sem duplicações)
INSERT INTO public.medical_specialties (name) VALUES
  -- Especialidades Clínicas Principais
  ('Cardiologia'),
  ('Cirurgia'),
  ('Clínica Médica'),
  ('Dermatologia'),
  ('Endocrinologia'),
  ('Gastroenterologia'),  -- UNIFICA: Gastroenterologia + Gastrointestinal
  ('Ginecologia e Obstetrícia'),  -- UNIFICA: Ginecologia + Obstetrícia + Ginecologia e Obstetrícia
  ('Hematologia'),
  ('Infectologia'),
  ('Medicina de Emergência'),
  ('Nefrologia'),
  ('Neurologia'),
  ('Ortopedia'),
  ('Pediatria'),
  ('Pneumologia'),
  ('Psiquiatria'),
  ('Reumatologia'),
  ('Urologia'),
  
  -- Especialidades de Radiologia
  ('Radiologia Geral'),
  ('Neurorradiologia'),
  ('Radiologia Torácica'),  -- UNIFICA: Tórax + Radiologia Torácica
  ('Radiologia Abdominal'), -- UNIFICA: Abdome + Radiologia Abdominal
  ('Radiologia Musculoesquelética'),
  ('Radiologia Mamária'),
  ('Radiologia Pediátrica'),
  ('Radiologia Intervencionista'), -- UNIFICA: Intervencionista + Radiologia Intervencionista
  ('Medicina Nuclear'),
  ('Ultrassonografia'),
  
  -- Categorias Anatômicas/Funcionais Específicas
  ('Cabeça e Pescoço'),
  ('Coluna'),
  ('Hepatobiliar'),
  ('Saúde da Mulher'),
  ('Trauma'),
  ('Vascular'),
  ('Oncologia'),
  ('Outros');

-- 3. Atualizar filtros de eventos que podem conter nomes antigos
UPDATE public.events 
SET case_filters = jsonb_set(
  case_filters,
  '{specialty}',
  (
    SELECT jsonb_agg(
      CASE 
        WHEN value::text = '"Gastrointestinal"' THEN '"Gastroenterologia"'
        WHEN value::text = '"Ginecologia"' THEN '"Ginecologia e Obstetrícia"'
        WHEN value::text = '"Obstetrícia"' THEN '"Ginecologia e Obstetrícia"'
        WHEN value::text = '"Intervencionista"' THEN '"Radiologia Intervencionista"'
        WHEN value::text = '"Tórax"' THEN '"Radiologia Torácica"'
        WHEN value::text = '"Abdome"' THEN '"Radiologia Abdominal"'
        ELSE value
      END
    )
    FROM jsonb_array_elements(case_filters->'specialty')
  )
)
WHERE case_filters ? 'specialty' 
AND case_filters->'specialty' IS NOT NULL;

-- 4. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_medical_specialties_name ON public.medical_specialties(name);

-- 5. Verificar o resultado final
SELECT name FROM public.medical_specialties ORDER BY name;
