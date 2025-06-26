
-- Criar os ENUMs que estão faltando no banco de dados (usando IF NOT EXISTS)
DO $$ BEGIN
    CREATE TYPE profile_type AS ENUM ('USER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE radcoin_tx_type AS ENUM ('case_completion', 'event_reward', 'subscription_purchase', 'admin_bonus', 'penalty');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_status AS ENUM ('SCHEDULED', 'ACTIVE', 'FINISHED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('Free', 'Pro', 'Plus');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Corrigir a função handle_new_user() que estava falhando
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Inserir perfil básico
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
  
  -- Inserir benefícios iniciais (com ON CONFLICT para evitar duplicação)
  INSERT INTO public.user_benefits (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Inserir ajudas iniciais (com ON CONFLICT para evitar duplicação)
  INSERT INTO public.user_help_aids (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que o trigger está ativo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();
