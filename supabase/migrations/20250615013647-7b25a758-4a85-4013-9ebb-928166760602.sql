
-- 1. Permitido pular questão
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS can_skip boolean DEFAULT true;

-- 2. Máximo de alternativas a eliminar
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS max_elimination smallint DEFAULT 0;

-- 3. AI Hint está ativado?
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS ai_hint_enabled boolean DEFAULT false;

-- 4. Dica manual (Manual Hint)
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS manual_hint text;

-- 5. Penalidade para pular e eliminar alternativa
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS skip_penalty_points integer DEFAULT 0;
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS elimination_penalty_points integer DEFAULT 0;

-- 6. Nível do tutor AI
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS ai_tutor_level text DEFAULT 'desligado';

-- 7. Short tips/meta-dicas nas alternativas (array de texto, igual ao answer_feedbacks)
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS answer_short_tips text[] DEFAULT ARRAY['','','',''];
