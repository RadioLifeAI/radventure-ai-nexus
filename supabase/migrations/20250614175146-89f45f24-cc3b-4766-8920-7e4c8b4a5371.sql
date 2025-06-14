
-- ENUMs
CREATE TYPE profile_type AS ENUM ('USER', 'ADMIN');
CREATE TYPE admin_role AS ENUM (
  'DEV',
  'TechAdmin',
  'WebSecuritySpecialist',
  'ContentEditor',
  'WebPerformanceSpecialist',
  'WebAnalyticsManager',
  'DigitalMarketingSpecialist',
  'EcommerceManager',
  'CustomerSupportCoordinator',
  'ComplianceOfficer'
);
CREATE TYPE academic_stage AS ENUM ('Student', 'Intern', 'Resident', 'Specialist');

-- Tabela Profiles aprimorada
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  type profile_type NOT NULL DEFAULT 'USER',
  email text,
  username text UNIQUE,
  full_name text,
  nickname text,
  bio text,
  country_code text,
  birthdate date,
  college text,
  preferences jsonb, -- preferências de especialidades ou áreas, multi-opção
  academic_specialty text, -- especialidade acadêmica/curso
  medical_specialty text,  -- especialidade médica de fato
  academic_stage academic_stage, -- estágio acadêmico / profissional
  radcoin_balance integer NOT NULL DEFAULT 0,
  total_points integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX profiles_username_idx ON public.profiles(username);
CREATE INDEX profiles_points_idx ON public.profiles(total_points);

-- Nova tabela para funções dos Admins
DROP TABLE IF EXISTS public.admin_roles;
CREATE TABLE public.admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role admin_role NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(profile_id, role)
);

CREATE INDEX admin_roles_profile_idx ON public.admin_roles(profile_id);

-- Função CREATE/Trigger atualizada para lidar com o tipo e campos extras
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_type profile_type := 'USER'; -- padrão
BEGIN
  -- Exemplo: Se quiser permitir criar admin via metadata pode alterar aqui
  INSERT INTO public.profiles (
    id,
    type,
    email,
    username,
    full_name,
    nickname,
    bio,
    country_code,
    birthdate,
    college,
    preferences,
    academic_specialty,
    medical_specialty,
    academic_stage,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    user_type,
    NEW.email,
    ('user_' || substring(NEW.id::text from 1 for 6)),
    NULL, -- ou pode mapear do metadata
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
