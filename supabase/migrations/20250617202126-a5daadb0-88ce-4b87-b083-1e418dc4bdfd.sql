
-- 1. Restaurar RLS em tabelas críticas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_case_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_help_aids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radcoin_transactions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journeys ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas básicas de segurança para profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_user_roles 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- 3. Criar políticas para user_case_history
CREATE POLICY "Users can view own case history"
  ON public.user_case_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own case history"
  ON public.user_case_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Criar políticas para user_help_aids
CREATE POLICY "Users can view own help aids"
  ON public.user_help_aids FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own help aids"
  ON public.user_help_aids FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. Criar políticas para radcoin_transactions_log
CREATE POLICY "Users can view own transactions"
  ON public.radcoin_transactions_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.radcoin_transactions_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. Criar políticas para user_benefits
CREATE POLICY "Users can view own benefits"
  ON public.user_benefits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own benefits"
  ON public.user_benefits FOR UPDATE
  USING (auth.uid() = user_id);

-- 7. Criar políticas para user_journeys
CREATE POLICY "Users can view own journeys"
  ON public.user_journeys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own journeys"
  ON public.user_journeys FOR ALL
  USING (auth.uid() = user_id);

-- 8. Atualizar trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, type, username, created_at, updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    'USER'::profile_type,
    'user_' || substring(NEW.id::text from 1 for 8),
    NOW(),
    NOW()
  );
  
  -- Criar benefícios iniciais
  INSERT INTO public.user_benefits (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Criar ajudas iniciais
  INSERT INTO public.user_help_aids (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Função para processar RadCoins
CREATE OR REPLACE FUNCTION public.award_radcoins(
  p_user_id uuid,
  p_amount integer,
  p_transaction_type text,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS void AS $$
DECLARE
  current_balance integer;
  new_balance integer;
BEGIN
  -- Buscar saldo atual
  SELECT radcoin_balance INTO current_balance
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Calcular novo saldo
  new_balance := COALESCE(current_balance, 0) + p_amount;
  
  -- Atualizar saldo
  UPDATE public.profiles
  SET radcoin_balance = new_balance,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Registrar transação
  INSERT INTO public.radcoin_transactions_log (
    user_id, tx_type, amount, balance_after, metadata
  ) VALUES (
    p_user_id, p_transaction_type::radcoin_tx_type, p_amount, new_balance, p_metadata
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Atualizar função de completar caso para usar auth real
CREATE OR REPLACE FUNCTION public.process_case_completion(
  p_case_id uuid, 
  p_points integer DEFAULT 1,
  p_is_correct boolean DEFAULT true
)
RETURNS void AS $$
DECLARE
  current_user_id uuid;
  already_answered integer;
BEGIN
  -- Usar usuário autenticado
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Verifica se já respondeu o caso para evitar duplicação
  SELECT COUNT(*) INTO already_answered
    FROM user_case_history
    WHERE user_id = current_user_id AND case_id = p_case_id;

  IF already_answered > 0 THEN
    RAISE NOTICE 'Usuário já respondeu este caso.';
    RETURN;
  END IF;

  -- Registra o histórico da resposta
  INSERT INTO user_case_history (user_id, case_id, is_correct, points)
    VALUES (current_user_id, p_case_id, p_is_correct, p_points);

  -- Atualiza o total de pontos no perfil
  UPDATE profiles
    SET total_points = total_points + p_points,
        updated_at = NOW()
    WHERE id = current_user_id;
    
  -- Dar RadCoins se correto
  IF p_is_correct AND p_points > 0 THEN
    PERFORM award_radcoins(
      current_user_id,
      p_points,
      'case_completion',
      jsonb_build_object('case_id', p_case_id)
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Garantir que o tipo profile_type existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_type') THEN
        CREATE TYPE profile_type AS ENUM ('USER', 'ADMIN');
    END IF;
END $$;

-- 12. Garantir que o tipo radcoin_tx_type existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'radcoin_tx_type') THEN
        CREATE TYPE radcoin_tx_type AS ENUM ('case_completion', 'admin_grant', 'subscription_purchase', 'event_reward', 'achievement_bonus');
    END IF;
END $$;

-- 13. Alterar coluna type da profiles para usar o enum correto
ALTER TABLE public.profiles ALTER COLUMN type SET DEFAULT 'USER'::profile_type;
