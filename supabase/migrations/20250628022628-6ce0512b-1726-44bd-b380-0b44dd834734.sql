
-- FASE 1: Correção das Políticas RLS - Versão Corrigida

-- 1. Dropar TODAS as políticas existentes na tabela profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- 2. Criar políticas corrigidas com nomes únicos
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR auth.uid() IS NULL);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin_select_all" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "profiles_admin_update_all" ON public.profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- 3. Atualizar função handle_new_user para melhor tratamento do Google Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RAISE LOG 'Iniciando criação de perfil para usuário: % com email: %', NEW.id, NEW.email;
  
  -- Inserir perfil com tratamento especial para dados do Google
  INSERT INTO public.profiles (
    id, 
    email, 
    type, 
    username, 
    full_name, 
    created_at, 
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    'USER'::profile_type,
    COALESCE(
      NEW.raw_user_meta_data->>'preferred_username',
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1),
      'user_' || substring(NEW.id::text from 1 for 8)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      CASE 
        WHEN NEW.raw_user_meta_data->>'given_name' IS NOT NULL 
        THEN TRIM(COALESCE(NEW.raw_user_meta_data->>'given_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'family_name', ''))
        ELSE ''
      END
    ),
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE 
      WHEN LENGTH(TRIM(COALESCE(EXCLUDED.full_name, ''))) > 0 
      THEN EXCLUDED.full_name 
      ELSE profiles.full_name 
    END,
    updated_at = NOW();
  
  -- Inserir benefícios iniciais
  INSERT INTO public.user_benefits (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Inserir ajudas iniciais
  INSERT INTO public.user_help_aids (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  RAISE LOG 'Perfil criado com sucesso para usuário: % (email: %)', NEW.id, NEW.email;
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'ERRO na criação do perfil para usuário % (email: %): %', NEW.id, NEW.email, SQLERRM;
  RETURN NEW;
END;
$$;

-- 4. Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
