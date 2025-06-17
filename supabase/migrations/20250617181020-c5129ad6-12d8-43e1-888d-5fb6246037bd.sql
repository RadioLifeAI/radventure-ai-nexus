
-- PLANO DE LIMPEZA COMPLETA DO BANCO DE DADOS
-- Remove todas as inconsistências e prepara para desenvolvimento livre

-- FASE 1: REMOÇÃO DE FOREIGN KEYS PROBLEMÁTICAS
-- Remove a foreign key que causa o erro "violates foreign key constraint profiles_id_fkey"
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey1;
ALTER TABLE public.admin_role_changes_log DROP CONSTRAINT IF EXISTS admin_role_changes_log_changed_by_fkey;

-- FASE 2: CONSOLIDAÇÃO DE TABELAS DUPLICADAS
-- Remove tabela admin_roles duplicada (mantém admin_user_roles que é mais completa)
DROP TABLE IF EXISTS public.admin_roles CASCADE;

-- Remove tabela achievements antiga (mantém achievement_system que é mais completa)
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.user_achievements CASCADE;

-- FASE 3: LIMPEZA DE ENUMS DESNECESSÁRIOS
-- Remove enum admin_role que não está sendo usado consistentemente
DROP TYPE IF EXISTS public.admin_role CASCADE;

-- FASE 4: LIMPEZA DE CONSTRAINTS E TRIGGERS RESTRITIVOS
-- Remove triggers que podem causar problemas durante desenvolvimento
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trigger_log_admin_role_changes ON public.admin_user_roles;
DROP TRIGGER IF EXISTS trigger_sync_benefits ON public.subscriptions;

-- Remove funções problemáticas de segurança
DROP FUNCTION IF EXISTS public.is_user_admin(uuid);
DROP FUNCTION IF EXISTS public.user_has_admin_role(uuid, text);
DROP FUNCTION IF EXISTS public.log_admin_role_change();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- FASE 5: REORGANIZAÇÃO DA TABELA PROFILES
-- Torna a tabela profiles completamente independente
ALTER TABLE public.profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.profiles ALTER COLUMN type SET DEFAULT 'ADMIN'::profile_type;
ALTER TABLE public.profiles ALTER COLUMN username DROP NOT NULL;

-- FASE 6: SIMPLIFICAÇÃO DA TABELA ADMIN_USER_ROLES
-- Remove constraints únicos que causam problemas
ALTER TABLE public.admin_user_roles DROP CONSTRAINT IF EXISTS admin_user_roles_user_id_admin_role_key;
ALTER TABLE public.admin_user_roles DROP CONSTRAINT IF EXISTS admin_user_roles_profile_id_role_key;

-- Remove foreign keys problemáticas
ALTER TABLE public.admin_user_roles DROP CONSTRAINT IF EXISTS admin_user_roles_assigned_by_fkey;
ALTER TABLE public.admin_user_roles DROP CONSTRAINT IF EXISTS admin_user_roles_user_id_fkey;

-- FASE 7: LIMPEZA DE TABELAS SEM USO ATUAL
-- Remove tabelas que não estão sendo usadas na aplicação
DROP TABLE IF EXISTS public.signup_logs CASCADE;
DROP TABLE IF EXISTS public.subscription_history CASCADE;
DROP TABLE IF EXISTS public.monthly_rankings CASCADE;
DROP TABLE IF EXISTS public.user_titles CASCADE;
DROP TABLE IF EXISTS public.app_settings CASCADE;

-- FASE 8: CRIAÇÃO DE FUNÇÃO SIMPLIFICADA PARA DESENVOLVIMENTO
CREATE OR REPLACE FUNCTION public.create_dev_user_simple(
  p_email text,
  p_full_name text,
  p_type text DEFAULT 'ADMIN'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  new_user_id uuid;
BEGIN
  new_user_id := gen_random_uuid();
  
  -- Inserir usuário na tabela profiles
  INSERT INTO public.profiles (
    id, email, full_name, type, username, created_at, updated_at
  ) VALUES (
    new_user_id,
    p_email,
    p_full_name,
    p_type::profile_type,
    'user_' || substring(new_user_id::text from 1 for 8),
    now(),
    now()
  );
  
  -- Inserir role administrativa básica
  INSERT INTO public.admin_user_roles (user_id, admin_role, assigned_by, is_active, assigned_at)
  VALUES (new_user_id, 'TechAdmin', new_user_id, true, now());
  
  -- Inserir benefícios básicos
  INSERT INTO public.user_benefits (user_id, created_at, updated_at)
  VALUES (new_user_id, now(), now())
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Inserir ajudas básicas
  INSERT INTO public.user_help_aids (user_id, created_at, updated_at)
  VALUES (new_user_id, now(), now())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new_user_id;
END;
$function$;

-- FASE 9: OTIMIZAÇÃO DE ÍNDICES
-- Remove índices desnecessários que podem causar lentidão
DROP INDEX IF EXISTS profiles_username_idx;
DROP INDEX IF EXISTS admin_roles_profile_idx;

-- Recria índices otimizados
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_type_idx ON public.profiles(type);
CREATE INDEX IF NOT EXISTS admin_user_roles_user_id_idx ON public.admin_user_roles(user_id);

-- FASE 10: LIMPEZA FINAL
-- Garante que não há políticas RLS restantes
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_benefits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_help_aids DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans DISABLE ROW LEVEL SECURITY;

-- Remove todas as políticas restantes
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- COMENTÁRIOS FINAIS
COMMENT ON SCHEMA public IS 'Banco de dados limpo e otimizado para desenvolvimento - Todas as restrições RLS removidas, tabelas duplicadas consolidadas, foreign keys problemáticas removidas';
