
-- 1. Adicionar constraint única na tabela user_help_aids para resolver ON CONFLICT
ALTER TABLE public.user_help_aids 
ADD CONSTRAINT user_help_aids_user_id_unique UNIQUE (user_id);

-- 2. Criar política INSERT para profiles permitir criação de perfil próprio
CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 3. Recriar o trigger para garantir criação automática de perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Garantir que a função handle_new_user está correta e segura
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
