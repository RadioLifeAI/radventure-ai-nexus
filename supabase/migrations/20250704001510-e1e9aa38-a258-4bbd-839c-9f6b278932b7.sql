-- Criar tabelas para sistema de controle de desafios diários

-- Tabela de controle de prompts para geração automática
CREATE TABLE public.quiz_prompt_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('fácil', 'médio', 'difícil')),
  modality TEXT NOT NULL,
  prompt_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  usage_count INTEGER DEFAULT 0,
  success_rate NUMERIC(5,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de questões geradas (rascunhos e publicadas)
CREATE TABLE public.daily_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_control_id UUID REFERENCES public.quiz_prompt_controls(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  correct_answer BOOLEAN NOT NULL,
  explanation TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'rejected', 'published')),
  generated_by_ai BOOLEAN DEFAULT false,
  reviewed_by UUID,
  published_date DATE,
  ai_confidence NUMERIC(3,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de log detalhado de interações dos usuários
CREATE TABLE public.daily_quiz_user_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  challenge_id UUID REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.daily_quiz_questions(id) ON DELETE SET NULL,
  user_answer BOOLEAN NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER,
  device_info JSONB DEFAULT '{}',
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_quiz_prompt_controls_active ON public.quiz_prompt_controls(is_active);
CREATE INDEX idx_quiz_prompt_controls_category ON public.quiz_prompt_controls(category);
CREATE INDEX idx_daily_quiz_questions_status ON public.daily_quiz_questions(status);
CREATE INDEX idx_daily_quiz_questions_published_date ON public.daily_quiz_questions(published_date);
CREATE INDEX idx_daily_quiz_user_log_user_id ON public.daily_quiz_user_log(user_id);
CREATE INDEX idx_daily_quiz_user_log_challenge_id ON public.daily_quiz_user_log(challenge_id);

-- RLS Policies
ALTER TABLE public.quiz_prompt_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quiz_user_log ENABLE ROW LEVEL SECURITY;

-- Políticas para quiz_prompt_controls
CREATE POLICY "Admins can manage prompt controls" 
ON public.quiz_prompt_controls 
FOR ALL 
USING (get_user_type(auth.uid()) = 'ADMIN'::profile_type);

-- Políticas para daily_quiz_questions
CREATE POLICY "Admins can manage quiz questions" 
ON public.daily_quiz_questions 
FOR ALL 
USING (get_user_type(auth.uid()) = 'ADMIN'::profile_type);

CREATE POLICY "Users can view published questions" 
ON public.daily_quiz_questions 
FOR SELECT 
USING (status = 'published');

-- Políticas para daily_quiz_user_log
CREATE POLICY "Admins can view all user logs" 
ON public.daily_quiz_user_log 
FOR ALL 
USING (get_user_type(auth.uid()) = 'ADMIN'::profile_type);

CREATE POLICY "Users can view own logs" 
ON public.daily_quiz_user_log 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs" 
ON public.daily_quiz_user_log 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_quiz_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_quiz_prompt_controls_updated_at
  BEFORE UPDATE ON public.quiz_prompt_controls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_quiz_updated_at();

CREATE TRIGGER update_daily_quiz_questions_updated_at
  BEFORE UPDATE ON public.daily_quiz_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_quiz_updated_at();

-- Função para gerar estatísticas de desafio
CREATE OR REPLACE FUNCTION public.get_challenge_analytics(p_date_from DATE DEFAULT CURRENT_DATE - 30, p_date_to DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_questions', (SELECT COUNT(*) FROM public.daily_quiz_questions WHERE status = 'published'),
    'total_responses', (SELECT COUNT(*) FROM public.daily_quiz_user_log WHERE answered_at::date BETWEEN p_date_from AND p_date_to),
    'correct_responses', (SELECT COUNT(*) FROM public.daily_quiz_user_log WHERE is_correct = true AND answered_at::date BETWEEN p_date_from AND p_date_to),
    'engagement_rate', (
      SELECT ROUND(
        (COUNT(DISTINCT user_id)::DECIMAL / (SELECT COUNT(*) FROM public.profiles WHERE type = 'USER')) * 100, 2
      )
      FROM public.daily_quiz_user_log 
      WHERE answered_at::date BETWEEN p_date_from AND p_date_to
    ),
    'avg_response_time', (
      SELECT ROUND(AVG(time_spent_seconds), 2) 
      FROM public.daily_quiz_user_log 
      WHERE answered_at::date BETWEEN p_date_from AND p_date_to AND time_spent_seconds IS NOT NULL
    ),
    'daily_stats', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', date_stat,
          'responses', response_count,
          'correct', correct_count,
          'accuracy', accuracy_rate
        )
      )
      FROM (
        SELECT 
          answered_at::date as date_stat,
          COUNT(*) as response_count,
          COUNT(*) FILTER (WHERE is_correct = true) as correct_count,
          ROUND((COUNT(*) FILTER (WHERE is_correct = true)::DECIMAL / COUNT(*)) * 100, 2) as accuracy_rate
        FROM public.daily_quiz_user_log
        WHERE answered_at::date BETWEEN p_date_from AND p_date_to
        GROUP BY answered_at::date
        ORDER BY answered_at::date
      ) daily_data
    )
  ) INTO result;
  
  RETURN result;
END;
$$;