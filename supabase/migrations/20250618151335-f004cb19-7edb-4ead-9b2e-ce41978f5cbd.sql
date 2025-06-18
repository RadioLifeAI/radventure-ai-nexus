
-- FASE 1: Correção das duplicações e unificação de campos

-- Adicionar novos campos estruturados para radiologia
ALTER TABLE public.medical_cases 
ADD COLUMN IF NOT EXISTS primary_diagnosis text,
ADD COLUMN IF NOT EXISTS secondary_diagnoses text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS case_classification text DEFAULT 'diagnostico',
ADD COLUMN IF NOT EXISTS cid10_code text,
ADD COLUMN IF NOT EXISTS anatomical_regions text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS finding_types text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS laterality text,
ADD COLUMN IF NOT EXISTS main_symptoms text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS vital_signs jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS medical_history text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS learning_objectives text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS pathology_types text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS clinical_presentation_tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS case_complexity_factors text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS search_keywords text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS structured_metadata jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS case_rarity text DEFAULT 'comum',
ADD COLUMN IF NOT EXISTS educational_value integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS clinical_relevance integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS estimated_solve_time integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS prerequisite_cases text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS unlocks_cases text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS achievement_triggers jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_audience text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS medical_subspecialty text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS exam_context text DEFAULT 'rotina',
ADD COLUMN IF NOT EXISTS differential_diagnoses text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS similar_cases_ids text[] DEFAULT '{}';

-- Migrar dados de diagnosis_internal para primary_diagnosis (se existir)
UPDATE public.medical_cases 
SET primary_diagnosis = diagnosis_internal 
WHERE diagnosis_internal IS NOT NULL AND primary_diagnosis IS NULL;

-- Criar índices para otimização de busca
CREATE INDEX IF NOT EXISTS idx_cases_primary_diagnosis ON medical_cases(primary_diagnosis);
CREATE INDEX IF NOT EXISTS idx_cases_anatomical_regions ON medical_cases USING GIN(anatomical_regions);
CREATE INDEX IF NOT EXISTS idx_cases_pathology_types ON medical_cases USING GIN(pathology_types);
CREATE INDEX IF NOT EXISTS idx_cases_search_keywords ON medical_cases USING GIN(search_keywords);
CREATE INDEX IF NOT EXISTS idx_cases_classification ON medical_cases(case_classification);
CREATE INDEX IF NOT EXISTS idx_cases_rarity ON medical_cases(case_rarity);
CREATE INDEX IF NOT EXISTS idx_cases_modality_classification ON medical_cases(modality, case_classification);

-- Comentário sobre os novos campos estruturados:
-- primary_diagnosis: diagnóstico principal unificado
-- secondary_diagnoses: lista de diagnósticos diferenciais
-- anatomical_regions: regiões anatômicas envolvidas
-- finding_types: tipos de achados radiológicos
-- pathology_types: tipos de patologia
-- search_keywords: palavras-chave para busca avançada
-- case_rarity: raridade do caso (comum, raro, muito_raro)
-- educational_value: valor educacional (1-10)
-- clinical_relevance: relevância clínica (1-10)
-- target_audience: público-alvo do caso
