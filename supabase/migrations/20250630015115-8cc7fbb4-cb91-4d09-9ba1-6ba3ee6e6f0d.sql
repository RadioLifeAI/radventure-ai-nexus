
-- Tabelas para o RadBot AI
CREATE TABLE public.ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  session_name TEXT DEFAULT 'Chat Session',
  total_messages INTEGER DEFAULT 0,
  total_radcoins_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  message_type TEXT CHECK (message_type IN ('user', 'assistant', 'system')) NOT NULL,
  content TEXT NOT NULL,
  radcoins_cost INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  context_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.ai_generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  chat_message_id UUID REFERENCES public.ai_chat_messages(id),
  report_type TEXT DEFAULT 'ai_generated',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_reports ENABLE ROW LEVEL SECURITY;

-- Users can only see their own chat sessions
CREATE POLICY "Users can view their own chat sessions" 
  ON public.ai_chat_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions" 
  ON public.ai_chat_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" 
  ON public.ai_chat_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can only see their own chat messages
CREATE POLICY "Users can view their own chat messages" 
  ON public.ai_chat_messages 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat messages" 
  ON public.ai_chat_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can only see their own AI generated reports
CREATE POLICY "Users can view their own AI reports" 
  ON public.ai_generated_reports 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI reports" 
  ON public.ai_generated_reports 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_ai_chat_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_chat_sessions_updated_at
  BEFORE UPDATE ON public.ai_chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_chat_sessions_updated_at();

-- Função para cobrar RadCoins do chat AI
CREATE OR REPLACE FUNCTION public.charge_radcoins_for_ai_chat(
  p_user_id UUID,
  p_amount INTEGER
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Verificar saldo atual
  SELECT radcoin_balance INTO current_balance
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Verificar se tem saldo suficiente
  IF current_balance IS NULL OR current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Debitar RadCoins
  UPDATE public.profiles
  SET radcoin_balance = radcoin_balance - p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Registrar transação
  INSERT INTO public.radcoin_transactions_log (
    user_id, tx_type, amount, balance_after, metadata
  ) VALUES (
    p_user_id, 
    'ai_chat_usage',
    -p_amount, 
    current_balance - p_amount,
    jsonb_build_object('service', 'radbot_ai', 'cost_per_message', p_amount)
  );
  
  RETURN TRUE;
END;
$$;
