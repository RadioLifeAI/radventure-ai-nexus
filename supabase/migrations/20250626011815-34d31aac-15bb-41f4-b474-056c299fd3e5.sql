
-- Phase 3: Sistema de Admin Permanente e Modo Emergência
-- Garantir que sempre há pelo menos um admin no sistema

-- 1. Criar tabela para admins permanentes (nunca podem ser removidos)
CREATE TABLE IF NOT EXISTS public.permanent_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  reason text DEFAULT 'Sistema de segurança',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Habilitar RLS na tabela de admins permanentes
ALTER TABLE public.permanent_admins ENABLE ROW LEVEL SECURITY;

-- 3. Apenas super admins podem gerenciar admins permanentes
CREATE POLICY "Only super admins can manage permanent admins"
  ON public.permanent_admins FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.permanent_admins pa
      WHERE pa.user_id = auth.uid()
    )
  );

-- 4. Todos podem ver quem são os admins permanentes (transparência)
CREATE POLICY "Anyone can view permanent admins list"
  ON public.permanent_admins FOR SELECT
  TO authenticated
  USING (true);

-- 5. Função para verificar se usuário é admin permanente
CREATE OR REPLACE FUNCTION public.is_permanent_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.permanent_admins
    WHERE user_id = $1
  );
$$;

-- 6. Função para contar total de admins no sistema
CREATE OR REPLACE FUNCTION public.count_total_admins()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*)::integer FROM public.profiles WHERE type = 'ADMIN';
$$;

-- 7. Função para promover usuário a admin permanente (apenas outros permanentes podem fazer)
CREATE OR REPLACE FUNCTION public.promote_to_permanent_admin(
  target_user_id uuid,
  target_email text,
  promotion_reason text DEFAULT 'Promovido por admin permanente'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Verificar se quem está promovendo é admin permanente
  IF NOT public.is_permanent_admin(current_user_id) THEN
    RAISE EXCEPTION 'Apenas admins permanentes podem promover outros usuários';
  END IF;
  
  -- Garantir que o usuário alvo é admin
  UPDATE public.profiles 
  SET type = 'ADMIN', updated_at = now()
  WHERE id = target_user_id;
  
  -- Adicionar à lista de admins permanentes
  INSERT INTO public.permanent_admins (user_id, email, created_by, reason)
  VALUES (target_user_id, target_email, current_user_id, promotion_reason)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN true;
END;
$$;

-- 8. Função de emergência para recuperar acesso admin
CREATE OR REPLACE FUNCTION public.emergency_admin_recovery()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  total_admins integer;
  recovery_key text;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Contar admins existentes
  SELECT public.count_total_admins() INTO total_admins;
  
  -- Se não há admins, permitir recuperação de emergência
  IF total_admins = 0 OR total_admins IS NULL THEN
    -- Promover usuário atual a admin
    UPDATE public.profiles 
    SET type = 'ADMIN', updated_at = now()
    WHERE id = current_user_id;
    
    -- Adicionar como admin permanente
    INSERT INTO public.permanent_admins (user_id, email, reason)
    VALUES (
      current_user_id, 
      COALESCE((SELECT email FROM public.profiles WHERE id = current_user_id), 'emergency@system.local'),
      'Recuperação de emergência - sistema sem admins'
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    recovery_key := 'EMERGENCY_RECOVERY_' || substring(current_user_id::text from 1 for 8);
    
    RETURN 'Acesso admin recuperado via emergência. Chave: ' || recovery_key;
  ELSE
    RAISE EXCEPTION 'Sistema possui % admin(s). Recuperação de emergência negada.', total_admins;
  END IF;
END;
$$;

-- 9. Configurar o primeiro admin permanente (usuário atual se for admin)
DO $$
DECLARE
  first_admin_id uuid;
  first_admin_email text;
BEGIN
  -- Buscar primeiro usuário ADMIN existente
  SELECT id, email INTO first_admin_id, first_admin_email
  FROM public.profiles 
  WHERE type = 'ADMIN' 
  ORDER BY created_at ASC 
  LIMIT 1;
  
  -- Se encontrou um admin, torna-lo permanente
  IF first_admin_id IS NOT NULL THEN
    INSERT INTO public.permanent_admins (user_id, email, reason)
    VALUES (
      first_admin_id, 
      COALESCE(first_admin_email, 'first@admin.system'),
      'Primeiro admin permanente do sistema'
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Admin permanente configurado: %', first_admin_id;
  END IF;
END $$;

-- 10. Criar log de segurança para ações críticas
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  target_user_id uuid,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS para audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security logs"
  ON public.security_audit_log FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "System can insert security logs"
  ON public.security_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);
