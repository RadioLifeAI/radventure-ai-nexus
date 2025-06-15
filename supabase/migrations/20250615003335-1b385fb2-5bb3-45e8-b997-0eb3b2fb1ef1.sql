
-- Adiciona novos campos para cadastro completo do caso radiológico
ALTER TABLE public.medical_cases
  ADD COLUMN IF NOT EXISTS findings text,
  ADD COLUMN IF NOT EXISTS patient_clinical_info text,
  ADD COLUMN IF NOT EXISTS symptoms_duration text,
  ADD COLUMN IF NOT EXISTS main_question text,
  ADD COLUMN IF NOT EXISTS answer_options text[], -- Opções do quiz A-D
  ADD COLUMN IF NOT EXISTS answer_feedbacks text[], -- Feedbacks por opção (A-D, opcional)
  ADD COLUMN IF NOT EXISTS correct_answer_index integer, -- índice da correta (0-3)
  ADD COLUMN IF NOT EXISTS image_url text, -- Imagem principal 
  ADD COLUMN IF NOT EXISTS explanation text; -- Explicação detalhada da resposta

