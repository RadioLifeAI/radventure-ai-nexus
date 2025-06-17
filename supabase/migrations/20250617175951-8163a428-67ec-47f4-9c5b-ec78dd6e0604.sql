
-- REMOVER TODAS AS POLÍTICAS RLS PARA DESENVOLVIMENTO
-- Este script remove todas as restrições para facilitar o desenvolvimento

-- 1. Desabilitar RLS em todas as tabelas principais
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_role_changes_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_benefits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_usage_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_system DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_help_aids DISABLE ROW LEVEL SECURITY;

-- 2. Dropar todas as políticas existentes que estão causando problemas
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.admin_user_roles;
DROP POLICY IF EXISTS "Admins can view roles" ON public.admin_user_roles;
DROP POLICY IF EXISTS "Users can view own benefits" ON public.user_benefits;
DROP POLICY IF EXISTS "Admins can manage benefits" ON public.user_benefits;
DROP POLICY IF EXISTS "Admins can view all benefits" ON public.user_benefits;
DROP POLICY IF EXISTS "Admins can manage all benefits" ON public.user_benefits;
DROP POLICY IF EXISTS "Admins can manage AI tutor configs" ON public.ai_tutor_config;
DROP POLICY IF EXISTS "Users can view their own AI tutor logs" ON public.ai_tutor_usage_logs;
DROP POLICY IF EXISTS "Admins can view all AI tutor logs" ON public.ai_tutor_usage_logs;
DROP POLICY IF EXISTS "Anyone can view subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Admins can manage subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievement_system;
DROP POLICY IF EXISTS "Admins can manage achievements" ON public.achievement_system;
DROP POLICY IF EXISTS "Users can view their own achievement progress" ON public.user_achievements_progress;
DROP POLICY IF EXISTS "Admins can view all achievement progress" ON public.user_achievements_progress;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.admin_user_roles;

-- 3. Modificar a coluna type da tabela profiles para aceitar ADMIN como padrão para desenvolvimento
ALTER TABLE public.profiles ALTER COLUMN type SET DEFAULT 'ADMIN'::profile_type;

-- 4. Criar uma função simples para setup de primeiro admin sem restrições
CREATE OR REPLACE FUNCTION public.setup_dev_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NOT NULL THEN
    -- Garantir que o usuário atual é ADMIN
    UPDATE public.profiles 
    SET type = 'ADMIN'::profile_type, updated_at = now()
    WHERE id = current_user_id;
    
    -- Adicionar role DEV para desenvolvimento
    INSERT INTO public.admin_user_roles (user_id, admin_role, assigned_by, is_active)
    VALUES (current_user_id, 'DEV', current_user_id, true)
    ON CONFLICT (user_id, admin_role) DO UPDATE SET 
      is_active = true,
      assigned_at = now();
      
    RAISE NOTICE 'Dev admin configurado para usuário: %', current_user_id;
  END IF;
END;
$function$;

-- 5. Executar setup para usuário atual
SELECT public.setup_dev_admin();

-- 6. Criar função para permitir criação de usuários em desenvolvimento
CREATE OR REPLACE FUNCTION public.create_dev_user(
  p_email text,
  p_password text,
  p_full_name text,
  p_role text DEFAULT 'ADMIN'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  new_user_data json;
  new_user_id uuid;
BEGIN
  -- Esta função é apenas para desenvolvimento
  -- Em produção, deve ser removida
  
  RAISE NOTICE 'Tentando criar usuário de desenvolvimento: %', p_email;
  
  -- Inserir diretamente na tabela profiles (simulando criação)
  new_user_id := gen_random_uuid();
  
  INSERT INTO public.profiles (
    id, email, full_name, type, username, created_at, updated_at
  ) VALUES (
    new_user_id,
    p_email,
    p_full_name,
    p_role::profile_type,
    'dev_' || substring(new_user_id::text from 1 for 8),
    now(),
    now()
  );
  
  -- Adicionar role administrativo
  INSERT INTO public.admin_user_roles (user_id, admin_role, assigned_by, is_active)
  VALUES (new_user_id, 'DEV', auth.uid(), true);
  
  new_user_data := json_build_object(
    'id', new_user_id,
    'email', p_email,
    'full_name', p_full_name,
    'type', p_role
  );
  
  RETURN new_user_data;
END;
$function$;
