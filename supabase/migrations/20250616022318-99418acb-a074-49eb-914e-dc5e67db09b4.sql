
-- 1. Verificar e corrigir a estrutura de roles administrativos
-- Primeiro, vamos garantir que a tabela admin_user_roles existe e está correta
CREATE TABLE IF NOT EXISTS public.admin_user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  admin_role text NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by uuid,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE(user_id, admin_role)
);

-- 2. Habilitar RLS na tabela admin_user_roles
ALTER TABLE public.admin_user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Criar política para administradores visualizarem roles
CREATE POLICY "Admins can view all admin roles" ON public.admin_user_roles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_user_roles aur
      WHERE aur.user_id = auth.uid() 
      AND aur.is_active = true
      AND aur.admin_role IN ('DEV', 'ADMIN_DEV', 'TechAdmin')
    )
  );

-- 4. Atribuir role de desenvolvedor ao usuário atual (substitua pelo seu user_id real)
-- Para encontrar seu user_id, você pode ver no console do browser após fazer login
-- ou podemos criar uma função para fazer isso automaticamente
INSERT INTO public.admin_user_roles (user_id, admin_role, is_active)
SELECT auth.uid(), 'DEV', true
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, admin_role) DO UPDATE SET is_active = true;

-- 5. Corrigir a função handle_new_user para garantir que profiles são criados corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_type_val public.profile_type := 'USER';
  academic_stage_val public.academic_stage;
  error_msg text;
BEGIN
  RAISE LOG 'handle_new_user: Starting for user %', NEW.id;
  
  -- Validar e mapear academic_stage do metadata
  BEGIN
    IF NEW.raw_user_meta_data IS NOT NULL AND NEW.raw_user_meta_data ? 'academic_stage' THEN
      academic_stage_val := (NEW.raw_user_meta_data ->> 'academic_stage')::public.academic_stage;
      RAISE LOG 'handle_new_user: Academic stage mapped to %', academic_stage_val;
    ELSE
      academic_stage_val := 'Student'::public.academic_stage;
      RAISE LOG 'handle_new_user: Using default academic stage: Student';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    academic_stage_val := 'Student'::public.academic_stage;
    RAISE LOG 'handle_new_user: Error mapping academic_stage, using default: %', SQLERRM;
  END;

  -- Inserir na tabela profiles com tratamento de erro
  BEGIN
    INSERT INTO public.profiles (
      id,
      type,
      email,
      username,
      full_name,
      academic_stage,
      medical_specialty,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      user_type_val,
      NEW.email,
      ('user_' || substring(NEW.id::text from 1 for 8)),
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
      academic_stage_val,
      COALESCE(NEW.raw_user_meta_data ->> 'medical_specialty', ''),
      NOW(),
      NOW()
    );
    
    RAISE LOG 'handle_new_user: Profile created successfully for user %', NEW.id;
    
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    RAISE LOG 'handle_new_user: Error creating profile for user %: %', NEW.id, error_msg;
    
    -- Re-raise the error to prevent user creation if profile fails
    RAISE EXCEPTION 'Failed to create user profile: %', error_msg;
  END;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'handle_new_user: Critical error for user %: %', NEW.id, SQLERRM;
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Verificar se o trigger existe e recriá-lo se necessário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
