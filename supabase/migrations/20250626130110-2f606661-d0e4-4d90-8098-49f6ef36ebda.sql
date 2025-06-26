
-- FASE 1: LIMPEZA CRÍTICA E CORREÇÃO DO ERRO GOOGLE OAUTH
-- =====================================================

-- 1. CORRIGIR FUNÇÃO handle_new_user() - ERRO CRÍTICO GOOGLE OAUTH
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Inserir perfil básico com ENUM correto
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
  );
  
  -- Inserir benefícios iniciais
  INSERT INTO public.user_benefits (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Inserir ajudas iniciais
  INSERT INTO public.user_help_aids (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 2. REMOVER TABELAS DUPLICADAS E ÓRFÃS (usuarios_*)
DROP TABLE IF EXISTS public.usuarios_sessoes CASCADE;
DROP TABLE IF EXISTS public.usuarios_beneficios CASCADE;
DROP TABLE IF EXISTS public.usuarios_ajudas CASCADE;
DROP TABLE IF EXISTS public.usuarios_admin_roles CASCADE;
DROP TABLE IF EXISTS public.usuarios_app CASCADE;

-- 3. LIMPAR FUNÇÕES ÓRFÃS RELACIONADAS
DROP FUNCTION IF EXISTS public.inicializar_usuario_dados() CASCADE;
DROP FUNCTION IF EXISTS public.limpar_sessoes_expiradas() CASCADE;
DROP FUNCTION IF EXISTS public.atualizar_updated_at() CASCADE;

-- 4. IMPLEMENTAR RLS BÁSICO PARA SEGURANÇA CRÍTICA
-- Profiles (já tem algumas políticas, vamos garantir consistência)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem próprio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Política para usuários atualizarem próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Política para admins verem todos os perfis
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.type = 'ADMIN'
    )
  );

-- Admin User Roles - RLS básico
ALTER TABLE public.admin_user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage roles" ON public.admin_user_roles;
CREATE POLICY "Admins can manage roles"
  ON public.admin_user_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.type = 'ADMIN'
    )
  );

-- User Benefits - RLS
ALTER TABLE public.user_benefits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own benefits" ON public.user_benefits;
CREATE POLICY "Users can view own benefits"
  ON public.user_benefits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- User Help Aids - RLS
ALTER TABLE public.user_help_aids ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own help aids" ON public.user_help_aids;
CREATE POLICY "Users can view own help aids"
  ON public.user_help_aids FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own help aids" ON public.user_help_aids;
CREATE POLICY "Users can update own help aids"
  ON public.user_help_aids FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. GARANTIR INTEGRIDADE DOS DADOS EXISTENTES
-- Verificar se há usuários sem benefícios/ajudas e corrigir
INSERT INTO public.user_benefits (user_id, created_at, updated_at)
SELECT p.id, NOW(), NOW()
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_benefits ub WHERE ub.user_id = p.id
);

INSERT INTO public.user_help_aids (user_id, created_at, updated_at)
SELECT p.id, NOW(), NOW()
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_help_aids uha WHERE uha.user_id = p.id
);

-- 6. LOG DE LIMPEZA
DO $$
BEGIN
  RAISE NOTICE 'FASE 1 CONCLUÍDA:';
  RAISE NOTICE '✅ Função handle_new_user() corrigida (resolve erro Google OAuth)';
  RAISE NOTICE '✅ 5 tabelas usuarios_* removidas';
  RAISE NOTICE '✅ 3 funções órfãs removidas';
  RAISE NOTICE '✅ RLS básico implementado em 4 tabelas críticas';
  RAISE NOTICE '✅ Integridade de dados verificada e corrigida';
END $$;
