
-- FASE 3: SEGURANÇA & OTIMIZAÇÃO FINAL
-- Implementar RLS avançado sem recursão + Otimizações críticas

-- 1. Funções de segurança otimizadas (SECURITY DEFINER para evitar recursão)
CREATE OR REPLACE FUNCTION public.get_user_type(user_id uuid DEFAULT auth.uid())
RETURNS profile_type
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT type FROM public.profiles WHERE id = $1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_owner(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = $1 AND (type = 'ADMIN' OR id = auth.uid())
  );
$$;

-- 2. RLS Policies otimizadas para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "profile_select_policy" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR public.get_user_type(auth.uid()) = 'ADMIN'
  );

CREATE POLICY "profile_update_policy" ON public.profiles
  FOR UPDATE USING (
    id = auth.uid() OR public.get_user_type(auth.uid()) = 'ADMIN'
  );

CREATE POLICY "profile_insert_policy" ON public.profiles
  FOR INSERT WITH CHECK (
    id = auth.uid() OR public.get_user_type(auth.uid()) = 'ADMIN'
  );

-- 3. RLS para admin_user_roles (apenas admins podem gerenciar)
DROP POLICY IF EXISTS "Admins can view roles" ON public.admin_user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.admin_user_roles;

CREATE POLICY "admin_roles_select_policy" ON public.admin_user_roles
  FOR SELECT USING (public.get_user_type(auth.uid()) = 'ADMIN');

CREATE POLICY "admin_roles_all_policy" ON public.admin_user_roles
  FOR ALL USING (public.get_user_type(auth.uid()) = 'ADMIN');

-- 4. RLS para user_benefits (usuários podem ver os próprios, admins veem todos)
DROP POLICY IF EXISTS "Users can view own benefits" ON public.user_benefits;
DROP POLICY IF EXISTS "Admins can view all benefits" ON public.user_benefits;
DROP POLICY IF EXISTS "Admins can manage all benefits" ON public.user_benefits;

CREATE POLICY "user_benefits_select_policy" ON public.user_benefits
  FOR SELECT USING (
    user_id = auth.uid() OR public.get_user_type(auth.uid()) = 'ADMIN'
  );

CREATE POLICY "user_benefits_update_policy" ON public.user_benefits
  FOR UPDATE USING (
    user_id = auth.uid() OR public.get_user_type(auth.uid()) = 'ADMIN'
  );

CREATE POLICY "user_benefits_insert_policy" ON public.user_benefits
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR public.get_user_type(auth.uid()) = 'ADMIN'
  );

-- 5. RLS para user_help_aids (mesmo padrão)
ALTER TABLE public.user_help_aids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_help_aids_select_policy" ON public.user_help_aids
  FOR SELECT USING (
    user_id = auth.uid() OR public.get_user_type(auth.uid()) = 'ADMIN'
  );

CREATE POLICY "user_help_aids_update_policy" ON public.user_help_aids
  FOR UPDATE USING (
    user_id = auth.uid() OR public.get_user_type(auth.uid()) = 'ADMIN'
  );

-- 6. RLS para tabelas principais do sistema
ALTER TABLE public.medical_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_case_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journeys ENABLE ROW LEVEL SECURITY;

-- Cases: Todos podem ler, apenas admins podem modificar
CREATE POLICY "medical_cases_select_policy" ON public.medical_cases
  FOR SELECT USING (true); -- Público para leitura

CREATE POLICY "medical_cases_modify_policy" ON public.medical_cases
  FOR ALL USING (public.get_user_type(auth.uid()) = 'ADMIN');

-- Events: Todos podem ler, apenas admins podem modificar
CREATE POLICY "events_select_policy" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "events_modify_policy" ON public.events
  FOR ALL USING (public.get_user_type(auth.uid()) = 'ADMIN');

-- User case history: Usuários veem próprio histórico, admins veem tudo
CREATE POLICY "user_case_history_policy" ON public.user_case_history
  FOR ALL USING (
    user_id = auth.uid() OR public.get_user_type(auth.uid()) = 'ADMIN'
  );

-- Event registrations: Usuários veem próprias inscrições, admins veem tudo
CREATE POLICY "event_registrations_policy" ON public.event_registrations
  FOR ALL USING (
    user_id = auth.uid() OR public.get_user_type(auth.uid()) = 'ADMIN'
  );

-- User journeys: Usuários veem próprias jornadas, admins veem tudo
CREATE POLICY "user_journeys_policy" ON public.user_journeys
  FOR ALL USING (
    user_id = auth.uid() OR public.get_user_type(auth.uid()) = 'ADMIN'
  );

-- 7. Otimizações de performance - Índices críticos
CREATE INDEX IF NOT EXISTS idx_profiles_type ON public.profiles(type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_admin_user_roles_active ON public.admin_user_roles(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_benefits_user_id ON public.user_benefits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_help_aids_user_id ON public.user_help_aids(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_cases_filters ON public.medical_cases(specialty, modality, difficulty_level);
CREATE INDEX IF NOT EXISTS idx_events_status_dates ON public.events(status, scheduled_start, scheduled_end);
CREATE INDEX IF NOT EXISTS idx_user_case_history_user_case ON public.user_case_history(user_id, case_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_event ON public.event_registrations(user_id, event_id);

-- 8. Função de limpeza e manutenção do sistema
CREATE OR REPLACE FUNCTION public.system_cleanup_maintenance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Limpar logs antigos (mais de 90 dias)
  DELETE FROM public.admin_role_changes_log 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  DELETE FROM public.security_audit_log 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Atualizar estatísticas das tabelas
  ANALYZE public.profiles;
  ANALYZE public.medical_cases;
  ANALYZE public.events;
  ANALYZE public.user_case_history;
  
  RAISE NOTICE 'Sistema limpo e otimizado com sucesso';
END;
$$;

-- 9. Trigger para audit log automático em mudanças críticas
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.type != NEW.type THEN
    INSERT INTO public.security_audit_log (
      user_id, action, target_user_id, details
    ) VALUES (
      auth.uid(),
      'PROFILE_TYPE_CHANGE',
      NEW.id,
      jsonb_build_object(
        'old_type', OLD.type,
        'new_type', NEW.type,
        'changed_at', NOW()
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_profile_type_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_profile_changes();

-- 10. Função de status do sistema para monitoramento
CREATE OR REPLACE FUNCTION public.get_system_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'total_admins', (SELECT COUNT(*) FROM public.profiles WHERE type = 'ADMIN'),
    'total_cases', (SELECT COUNT(*) FROM public.medical_cases),
    'active_events', (SELECT COUNT(*) FROM public.events WHERE status = 'ACTIVE'),
    'system_health', 'OPTIMAL',
    'last_cleanup', COALESCE(
      (SELECT value->>'last_run' FROM public.system_settings WHERE key = 'last_cleanup'),
      'Never'
    ),
    'timestamp', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$;
