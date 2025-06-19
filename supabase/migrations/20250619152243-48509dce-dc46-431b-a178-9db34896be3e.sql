
-- Criar sistema de usuários independente
-- Remover dependências problemáticas do auth.users

-- 1. Criar tabela principal de usuários
CREATE TABLE public.usuarios_app (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  senha_hash text NOT NULL,
  nome_completo text,
  username text UNIQUE,
  tipo text NOT NULL DEFAULT 'USER' CHECK (tipo IN ('USER', 'ADMIN', 'SUPER_ADMIN')),
  avatar_url text,
  bio text,
  especialidade_medica text,
  pais text,
  cidade text,
  estado text,
  data_nascimento date,
  radcoin_balance integer NOT NULL DEFAULT 0,
  total_points integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  email_verificado boolean NOT NULL DEFAULT false,
  ultimo_login timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Criar tabela de sessões
CREATE TABLE public.usuarios_sessoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.usuarios_app(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_agent text,
  ip_address inet
);

-- 3. Criar tabela de roles administrativos
CREATE TABLE public.usuarios_admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.usuarios_app(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('TechAdmin', 'ContentAdmin', 'UserAdmin', 'DEV')),
  atribuido_por uuid REFERENCES public.usuarios_app(id),
  ativo boolean NOT NULL DEFAULT true,
  atribuido_em timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(usuario_id, role)
);

-- 4. Criar tabela de benefícios
CREATE TABLE public.usuarios_beneficios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.usuarios_app(id) ON DELETE CASCADE,
  ai_credits integer NOT NULL DEFAULT 5,
  elimination_aids integer NOT NULL DEFAULT 3,
  skip_aids integer NOT NULL DEFAULT 5,
  tem_recursos_premium boolean NOT NULL DEFAULT false,
  multiplicador_pontos decimal NOT NULL DEFAULT 1.0,
  titulo_personalizado text,
  max_dicas_ia_por_dia integer NOT NULL DEFAULT 3,
  max_pulos_por_sessao integer NOT NULL DEFAULT 5,
  colecao_badges jsonb DEFAULT '[]'::jsonb,
  expira_em timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(usuario_id)
);

-- 5. Criar tabela de ajudas
CREATE TABLE public.usuarios_ajudas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.usuarios_app(id) ON DELETE CASCADE,
  ai_tutor_credits integer NOT NULL DEFAULT 2,
  elimination_aids integer NOT NULL DEFAULT 3,
  skip_aids integer NOT NULL DEFAULT 1,
  ultimo_refill date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(usuario_id)
);

-- 6. Criar índices para performance
CREATE INDEX idx_usuarios_app_email ON public.usuarios_app(email);
CREATE INDEX idx_usuarios_app_username ON public.usuarios_app(username);
CREATE INDEX idx_usuarios_app_tipo ON public.usuarios_app(tipo);
CREATE INDEX idx_usuarios_sessoes_usuario_id ON public.usuarios_sessoes(usuario_id);
CREATE INDEX idx_usuarios_sessoes_expires_at ON public.usuarios_sessoes(expires_at);
CREATE INDEX idx_usuarios_admin_roles_usuario_id ON public.usuarios_admin_roles(usuario_id);

-- 7. Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.atualizar_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Criar triggers para updated_at
CREATE TRIGGER usuarios_app_updated_at
  BEFORE UPDATE ON public.usuarios_app
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_updated_at();

CREATE TRIGGER usuarios_beneficios_updated_at
  BEFORE UPDATE ON public.usuarios_beneficios
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_updated_at();

CREATE TRIGGER usuarios_ajudas_updated_at
  BEFORE UPDATE ON public.usuarios_ajudas
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_updated_at();

-- 9. Criar trigger para inicializar benefícios e ajudas
CREATE OR REPLACE FUNCTION public.inicializar_usuario_dados()
RETURNS trigger AS $$
BEGIN
  -- Inserir benefícios padrão
  INSERT INTO public.usuarios_beneficios (usuario_id) 
  VALUES (NEW.id);
  
  -- Inserir ajudas padrão
  INSERT INTO public.usuarios_ajudas (usuario_id) 
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER usuario_criar_dados_iniciais
  AFTER INSERT ON public.usuarios_app
  FOR EACH ROW
  EXECUTE FUNCTION public.inicializar_usuario_dados();

-- 10. Criar primeiro SUPER_ADMIN (pode ser atualizado depois)
-- Senha: admin123 (hash bcrypt)
INSERT INTO public.usuarios_app (
  email, 
  senha_hash, 
  nome_completo, 
  username, 
  tipo, 
  email_verificado
) VALUES (
  'admin@radventure.com',
  '$2b$10$rQZ8vF3qGK9XvZ4M3nY3W.FE8JjQ2vZ4M3nY3W.FE8JjQ2vZ4M3nY3',
  'Administrador Sistema',
  'admin',
  'SUPER_ADMIN',
  true
) ON CONFLICT (email) DO NOTHING;

-- 11. Atribuir role DEV ao primeiro admin
DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM public.usuarios_app WHERE email = 'admin@radventure.com';
  
  IF admin_id IS NOT NULL THEN
    INSERT INTO public.usuarios_admin_roles (usuario_id, role, atribuido_por)
    VALUES (admin_id, 'DEV', admin_id)
    ON CONFLICT (usuario_id, role) DO NOTHING;
  END IF;
END $$;

-- 12. Função para limpeza de sessões expiradas
CREATE OR REPLACE FUNCTION public.limpar_sessoes_expiradas()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.usuarios_sessoes 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
