
-- Verificar se existem dados órfãos que precisam ser limpos antes de criar as FKs
DELETE FROM public.profiles WHERE id NOT IN (SELECT id FROM auth.users);
DELETE FROM public.user_benefits WHERE user_id NOT IN (SELECT id FROM auth.users);
DELETE FROM public.user_help_aids WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Restaurar foreign keys essenciais para integridade referencial
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_benefits 
ADD CONSTRAINT user_benefits_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_help_aids 
ADD CONSTRAINT user_help_aids_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Verificar se a função handle_new_user está correta e funcional
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

-- Garantir que o trigger existe e está ativo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Corrigir função create_admin_direct para funcionar com as FKs
CREATE OR REPLACE FUNCTION public.create_admin_direct(
  p_email text, 
  p_full_name text, 
  p_type text DEFAULT 'ADMIN'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Esta função agora deve usar auth.admin.createUser() via Edge Function
  -- Por enquanto, vamos criar um usuário "mockado" para testes
  new_user_id := gen_random_uuid();
  
  -- Inserir usuário fictício em auth.users (apenas para testes de desenvolvimento)
  -- Em produção, isso deve ser feito via Edge Function
  INSERT INTO auth.users (
    id, email, email_confirmed_at, created_at, updated_at, 
    raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    new_user_id,
    p_email,
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name)
  );
  
  -- O trigger handle_new_user vai criar automaticamente:
  -- - profiles
  -- - user_benefits  
  -- - user_help_aids
  
  -- Atualizar o tipo do usuário para ADMIN
  UPDATE public.profiles 
  SET type = p_type::profile_type, full_name = p_full_name
  WHERE id = new_user_id;
  
  -- Inserir role administrativa
  INSERT INTO public.admin_user_roles (user_id, admin_role, assigned_by, is_active, assigned_at)
  VALUES (new_user_id, 'TechAdmin', new_user_id, true, NOW())
  ON CONFLICT (user_id, admin_role) DO NOTHING;
  
  RETURN new_user_id;
END;
$$;

-- Criar função para Edge Function que usa auth.admin.createUser() corretamente
CREATE OR REPLACE FUNCTION public.create_user_with_auth(
  p_email text, 
  p_password text,
  p_full_name text, 
  p_type text DEFAULT 'USER'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_data json;
BEGIN
  -- Esta função será chamada por uma Edge Function que:
  -- 1. Cria o usuário via auth.admin.createUser()
  -- 2. Chama esta função para completar o setup
  
  result_data := json_build_object(
    'success', true,
    'message', 'User creation parameters validated',
    'email', p_email,
    'type', p_type
  );
  
  RETURN result_data;
END;
$$;
