
-- FASE 1: Correções Críticas de Segurança - RadVenture Auth System (Corrigido)

-- 1. Habilitar RLS nas tabelas críticas se não estiver habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_help_aids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radcoin_transactions_log ENABLE ROW LEVEL SECURITY;

-- 2. Dropar políticas existentes e recriar (método seguro)
DO $$
BEGIN
  -- Políticas para PROFILES
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

  CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

  CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

  CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin(auth.uid()));

  CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.is_admin(auth.uid()));

  -- Políticas para USER_BENEFITS
  DROP POLICY IF EXISTS "Users can view own benefits" ON public.user_benefits;
  DROP POLICY IF EXISTS "Users can update own benefits" ON public.user_benefits;
  DROP POLICY IF EXISTS "Admins can manage all benefits" ON public.user_benefits;

  CREATE POLICY "Users can view own benefits" ON public.user_benefits
    FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "Users can update own benefits" ON public.user_benefits
    FOR UPDATE USING (auth.uid() = user_id);

  CREATE POLICY "Admins can manage all benefits" ON public.user_benefits
    FOR ALL USING (public.is_admin(auth.uid()));

  -- Políticas para USER_HELP_AIDS
  DROP POLICY IF EXISTS "Users can view own help aids" ON public.user_help_aids;
  DROP POLICY IF EXISTS "Users can update own help aids" ON public.user_help_aids;
  DROP POLICY IF EXISTS "Admins can manage all help aids" ON public.user_help_aids;

  CREATE POLICY "Users can view own help aids" ON public.user_help_aids
    FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "Users can update own help aids" ON public.user_help_aids
    FOR UPDATE USING (auth.uid() = user_id);

  CREATE POLICY "Admins can manage all help aids" ON public.user_help_aids
    FOR ALL USING (public.is_admin(auth.uid()));

  -- Políticas para RADCOIN_TRANSACTIONS_LOG
  DROP POLICY IF EXISTS "Users can view own transactions" ON public.radcoin_transactions_log;
  DROP POLICY IF EXISTS "Admins can view all transactions" ON public.radcoin_transactions_log;

  CREATE POLICY "Users can view own transactions" ON public.radcoin_transactions_log
    FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "Admins can view all transactions" ON public.radcoin_transactions_log
    FOR SELECT USING (public.is_admin(auth.uid()));
END $$;

-- 3. Correção no trigger handle_new_user para ser mais robusto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir perfil básico
  INSERT INTO public.profiles (
    id, email, type, username, full_name, created_at, updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    'USER'::profile_type,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text from 1 for 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Inserir benefícios iniciais
  INSERT INTO public.user_benefits (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Inserir ajudas iniciais
  INSERT INTO public.user_help_aids (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log do erro mas não falha o processo de criação do usuário
  RAISE LOG 'Erro na criação do perfil para usuário %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- 4. Garantir que o trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Função para setup do primeiro admin
CREATE OR REPLACE FUNCTION public.setup_initial_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  admin_count integer;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar se já existem admins
  SELECT COUNT(*) INTO admin_count FROM public.profiles WHERE type = 'ADMIN';
  
  -- Se não há admins, promover o usuário atual
  IF admin_count = 0 THEN
    UPDATE public.profiles 
    SET type = 'ADMIN', updated_at = NOW()
    WHERE id = current_user_id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- 6. Popular achievement_system com conquistas básicas
INSERT INTO public.achievement_system (code, name, description, conditions, rewards, rarity, points_required)
VALUES 
  ('first_login', 'Primeiro Acesso', 'Bem-vindo ao RadVenture!', '{"login_count": 1}', '{"radcoins": 10}', 'common', 0),
  ('streak_3', 'Persistente', '3 dias seguidos de acesso', '{"daily_streak": 3}', '{"radcoins": 25}', 'uncommon', 0),
  ('streak_7', 'Dedicado', '7 dias seguidos de acesso', '{"daily_streak": 7}', '{"radcoins": 50}', 'rare', 0),
  ('first_case', 'Primeiro Diagnóstico', 'Complete seu primeiro caso', '{"cases_completed": 1}', '{"radcoins": 15}', 'common', 0),
  ('cases_10', 'Estudante', '10 casos completados', '{"cases_completed": 10}', '{"radcoins": 100}', 'uncommon', 0)
ON CONFLICT (code) DO NOTHING;

-- 7. Função para dar RadCoins por login diário
CREATE OR REPLACE FUNCTION public.award_daily_login_bonus(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_login_date date;
  current_streak integer;
  bonus_radcoins integer := 5;
  streak_bonus integer := 0;
  result jsonb;
BEGIN
  -- Buscar último login e streak atual
  SELECT 
    COALESCE((preferences->>'last_login_date')::date, CURRENT_DATE - 1),
    current_streak
  INTO last_login_date, current_streak
  FROM public.profiles 
  WHERE id = p_user_id;
  
  -- Se não logou hoje ainda
  IF last_login_date < CURRENT_DATE THEN
    -- Calcular novo streak
    IF last_login_date = CURRENT_DATE - 1 THEN
      current_streak := current_streak + 1;
    ELSE
      current_streak := 1;
    END IF;
    
    -- Bonus por streak
    IF current_streak >= 7 THEN
      streak_bonus := 15;
    ELSIF current_streak >= 3 THEN
      streak_bonus := 5;
    END IF;
    
    -- Atualizar perfil
    UPDATE public.profiles 
    SET 
      current_streak = current_streak,
      preferences = COALESCE(preferences, '{}'::jsonb) || jsonb_build_object('last_login_date', CURRENT_DATE::text),
      updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Dar RadCoins
    PERFORM public.award_radcoins(
      p_user_id, 
      bonus_radcoins + streak_bonus, 
      'daily_login',
      jsonb_build_object('streak', current_streak, 'date', CURRENT_DATE)
    );
    
    result := jsonb_build_object(
      'awarded', true,
      'radcoins', bonus_radcoins + streak_bonus,
      'streak', current_streak,
      'message', CASE 
        WHEN streak_bonus > 0 THEN 'Bonus de streak: +' || streak_bonus || ' RadCoins!'
        ELSE 'Login diário: +' || bonus_radcoins || ' RadCoins!'
      END
    );
  ELSE
    result := jsonb_build_object('awarded', false, 'message', 'Já recebeu o bônus hoje!');
  END IF;
  
  RETURN result;
END;
$$;
