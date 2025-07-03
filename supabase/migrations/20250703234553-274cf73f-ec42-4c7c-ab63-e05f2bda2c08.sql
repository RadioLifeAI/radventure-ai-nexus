-- Criar tabelas para o sistema de Desafio do Dia

-- Tabela de desafios diários únicos
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL,
  question TEXT NOT NULL,
  correct_answer BOOLEAN NOT NULL,
  explanation TEXT NOT NULL,
  challenge_date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  community_stats JSONB DEFAULT '{"total_responses": 0, "correct_responses": 0}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Tabela de relacionamento usuário-desafio
CREATE TABLE IF NOT EXISTS public.user_daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_user_challenge_date ON public.user_daily_challenges(user_id, answered_at);
CREATE INDEX IF NOT EXISTS idx_challenge_created_at ON public.daily_challenges(created_at);
CREATE INDEX IF NOT EXISTS idx_challenge_date ON public.daily_challenges(challenge_date);
CREATE INDEX IF NOT EXISTS idx_user_challenge_user_id ON public.user_daily_challenges(user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_daily_challenges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_daily_challenges_updated_at
  BEFORE UPDATE ON public.daily_challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_daily_challenges_updated_at();

-- Função para buscar desafio do dia para usuário
CREATE OR REPLACE FUNCTION public.get_daily_challenge_for_user(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_challenge RECORD;
  user_challenge RECORD;
  result JSON;
BEGIN
  -- Buscar desafio de hoje
  SELECT * INTO today_challenge
  FROM public.daily_challenges
  WHERE challenge_date = CURRENT_DATE
    AND is_active = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Se não há desafio de hoje, retornar null
  IF today_challenge IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Verificar se usuário já respondeu hoje
  SELECT * INTO user_challenge
  FROM public.user_daily_challenges
  WHERE user_id = p_user_id
    AND challenge_id = today_challenge.id;
  
  -- Se já respondeu, retornar null
  IF user_challenge.answered = true THEN
    RETURN NULL;
  END IF;
  
  -- Construir resultado
  result := json_build_object(
    'id', today_challenge.id,
    'question', today_challenge.question,
    'explanation', today_challenge.explanation,
    'community_stats', today_challenge.community_stats,
    'challenge_date', today_challenge.challenge_date
  );
  
  -- Criar registro se não existir
  IF user_challenge IS NULL THEN
    INSERT INTO public.user_daily_challenges (user_id, challenge_id)
    VALUES (p_user_id, today_challenge.id);
  END IF;
  
  RETURN result;
END;
$$;

-- Função para submeter resposta do desafio
CREATE OR REPLACE FUNCTION public.submit_daily_challenge(
  p_user_id UUID,
  p_challenge_id UUID,
  p_user_answer BOOLEAN
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  challenge_data RECORD;
  user_challenge RECORD;
  is_correct BOOLEAN;
  new_stats JSONB;
  result JSON;
BEGIN
  -- Buscar dados do desafio
  SELECT * INTO challenge_data
  FROM public.daily_challenges
  WHERE id = p_challenge_id AND is_active = true;
  
  IF challenge_data IS NULL THEN
    RAISE EXCEPTION 'Desafio não encontrado';
  END IF;
  
  -- Verificar se usuário já respondeu
  SELECT * INTO user_challenge
  FROM public.user_daily_challenges
  WHERE user_id = p_user_id AND challenge_id = p_challenge_id;
  
  IF user_challenge IS NULL THEN
    RAISE EXCEPTION 'Registro de usuário não encontrado';
  END IF;
  
  IF user_challenge.answered = true THEN
    RAISE EXCEPTION 'Usuário já respondeu este desafio';
  END IF;
  
  -- Verificar se resposta está correta
  is_correct := (p_user_answer = challenge_data.correct_answer);
  
  -- Atualizar registro do usuário
  UPDATE public.user_daily_challenges
  SET 
    answered = true,
    answered_at = NOW(),
    was_correct = is_correct,
    user_answer = p_user_answer,
    reward_given = false  -- Será atualizado depois de dar a recompensa
  WHERE user_id = p_user_id AND challenge_id = p_challenge_id;
  
  -- Atualizar estatísticas da comunidade
  new_stats := challenge_data.community_stats;
  new_stats := jsonb_set(
    new_stats, 
    '{total_responses}', 
    to_jsonb((new_stats->>'total_responses')::int + 1)
  );
  
  IF is_correct THEN
    new_stats := jsonb_set(
      new_stats, 
      '{correct_responses}', 
      to_jsonb((new_stats->>'correct_responses')::int + 1)
    );
  END IF;
  
  UPDATE public.daily_challenges
  SET community_stats = new_stats
  WHERE id = p_challenge_id;
  
  -- Dar recompensa RadCoins (5 RadCoins independente do acerto)
  PERFORM public.award_radcoins(
    p_user_id,
    5,
    'daily_challenge',
    jsonb_build_object(
      'challenge_id', p_challenge_id,
      'was_correct', is_correct,
      'challenge_date', challenge_data.challenge_date
    )
  );
  
  -- Marcar recompensa como dada
  UPDATE public.user_daily_challenges
  SET reward_given = true
  WHERE user_id = p_user_id AND challenge_id = p_challenge_id;
  
  -- Construir resultado
  result := json_build_object(
    'was_correct', is_correct,
    'correct_answer', challenge_data.correct_answer,
    'explanation', challenge_data.explanation,
    'community_stats', new_stats,
    'radcoins_awarded', 5
  );
  
  RETURN result;
END;
$$;

-- RLS Policies
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_challenges ENABLE ROW LEVEL SECURITY;

-- Políticas para daily_challenges
CREATE POLICY "Anyone can view active challenges" 
ON public.daily_challenges 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Only admins can manage challenges" 
ON public.daily_challenges 
FOR ALL 
USING (get_user_type(auth.uid()) = 'ADMIN'::profile_type);

-- Políticas para user_daily_challenges
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