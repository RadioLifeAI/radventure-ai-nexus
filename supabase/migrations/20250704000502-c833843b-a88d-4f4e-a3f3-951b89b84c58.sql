-- Corrigir foreign key da tabela user_daily_challenges
-- A foreign key deve referenciar auth.users, não profiles
DROP TABLE IF EXISTS public.user_daily_challenges CASCADE;

-- Recriar tabela com foreign key correta
CREATE TABLE public.user_daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- Remover REFERENCES para usar auth.uid() diretamente
  challenge_id UUID REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  answered BOOLEAN DEFAULT FALSE,
  answered_at TIMESTAMP WITH TIME ZONE,
  was_correct BOOLEAN,
  reward_given BOOLEAN DEFAULT FALSE,
  user_answer BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Índices para performance
CREATE INDEX idx_user_challenge_date ON public.user_daily_challenges(user_id, answered_at);
CREATE INDEX idx_user_challenge_user_id ON public.user_daily_challenges(user_id);

-- RLS Policies
ALTER TABLE public.user_daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenges" 
ON public.user_daily_challenges 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges" 
ON public.user_daily_challenges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges" 
ON public.user_daily_challenges 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user challenges" 
ON public.user_daily_challenges 
FOR ALL 
USING (get_user_type(auth.uid()) = 'ADMIN'::profile_type);