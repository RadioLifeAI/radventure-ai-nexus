
-- FASE 1: Corrigir RLS e criar funções SECURITY DEFINER (versão corrigida)

-- 1. Criar função segura para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND type = 'ADMIN'
  );
$$;

-- 2. Criar função segura para verificar roles específicos
CREATE OR REPLACE FUNCTION public.user_has_admin_role(user_id uuid, role_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_user_roles 
    WHERE user_id = $1 AND admin_role = $2 AND is_active = true
  );
$$;

-- 3. Habilitar RLS nas tabelas críticas se não estiver
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_benefits ENABLE ROW LEVEL SECURITY;

-- 4. Dropar todas as políticas existentes primeiro
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

-- 5. Criar políticas RLS seguras para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_user_admin(auth.uid()));

-- 6. Políticas para admin_user_roles
CREATE POLICY "Admins can view roles" ON public.admin_user_roles
  FOR SELECT USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Admins can manage roles" ON public.admin_user_roles
  FOR ALL USING (public.is_user_admin(auth.uid()));

-- 7. Políticas para user_benefits
CREATE POLICY "Users can view own benefits" ON public.user_benefits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all benefits" ON public.user_benefits
  FOR SELECT USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Admins can manage all benefits" ON public.user_benefits
  FOR ALL USING (public.is_user_admin(auth.uid()));

-- 8. Criar tabela de auditoria para mudanças de roles
CREATE TABLE IF NOT EXISTS public.admin_role_changes_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id uuid NOT NULL,
  admin_role text NOT NULL,
  action text NOT NULL, -- 'GRANTED', 'REVOKED'
  changed_by uuid REFERENCES public.profiles(id),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 9. Função para registrar mudanças de roles
CREATE OR REPLACE FUNCTION public.log_admin_role_change()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.admin_role_changes_log (target_user_id, admin_role, action, changed_by)
    VALUES (NEW.user_id, NEW.admin_role, 'GRANTED', auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_active = true AND NEW.is_active = false THEN
      INSERT INTO public.admin_role_changes_log (target_user_id, admin_role, action, changed_by)
      VALUES (NEW.user_id, NEW.admin_role, 'REVOKED', auth.uid());
    ELSIF OLD.is_active = false AND NEW.is_active = true THEN
      INSERT INTO public.admin_role_changes_log (target_user_id, admin_role, action, changed_by)
      VALUES (NEW.user_id, NEW.admin_role, 'GRANTED', auth.uid());
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Criar trigger para auditoria
DROP TRIGGER IF EXISTS trigger_log_admin_role_changes ON public.admin_user_roles;
CREATE TRIGGER trigger_log_admin_role_changes
  AFTER INSERT OR UPDATE ON public.admin_user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_role_change();
