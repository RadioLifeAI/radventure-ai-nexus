-- Tabela para armazenar respostas dos usuários aos desafios diários
CREATE TABLE IF NOT EXISTS public.user_daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  answered boolean DEFAULT false,
  user_answer boolean,
  is_correct boolean,
  answered_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- RLS policies
ALTER TABLE public.user_daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own challenge responses"
ON public.user_daily_challenges FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenge responses"
ON public.user_daily_challenges FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge responses"
ON public.user_daily_challenges FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all challenge responses"
ON public.user_daily_challenges FOR ALL
USING (get_user_type(auth.uid()) = 'ADMIN'::profile_type);